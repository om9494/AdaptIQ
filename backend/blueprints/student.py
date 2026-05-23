from datetime import datetime, timedelta
from flask import Blueprint, request, current_app, send_file, url_for
from flask_jwt_extended import get_jwt_identity

try:
    from ..course_catalog import get_course_runtime
    from ..extensions import db
    from ..models.db_models import Course, Content, Enrollment, LearningSession, Assessment, KnowledgeState, StudentProfile, Notification
    from ..utils.decorators import role_required
    from ..utils.helpers import success_response, error_response, parse_uuid, youtube_embed_url
    from ..utils.badges import award_badges
    from ..services.openai_service import generate_progress_summary, generate_quiz_with_llm
except ImportError:
    from course_catalog import get_course_runtime
    from extensions import db
    from models.db_models import Course, Content, Enrollment, LearningSession, Assessment, KnowledgeState, StudentProfile, Notification
    from utils.decorators import role_required
    from utils.helpers import success_response, error_response, parse_uuid, youtube_embed_url
    from utils.badges import award_badges
    from services.openai_service import generate_progress_summary, generate_quiz_with_llm


student_bp = Blueprint('student', __name__)


def _get_ml_service():
    return current_app.extensions['ml_service']


def _knowledge_state_dict(student_id):
    rows = KnowledgeState.query.filter_by(student_id=student_id).all()
    return {row.concept: row.mastery_score for row in rows}


def _upsert_knowledge_state(student_id, concept, mastery):
    row = KnowledgeState.query.filter_by(student_id=student_id, concept=concept).first()
    if not row:
        row = KnowledgeState(student_id=student_id, concept=concept, mastery_score=mastery)
        db.session.add(row)
    else:
        row.mastery_score = mastery
        row.updated_at = datetime.utcnow()


def _student_learning_metrics(user_id):
    recent_sessions = LearningSession.query.filter_by(student_id=user_id) \
        .order_by(LearningSession.started_at.desc()) \
        .limit(12) \
        .all()

    if not recent_sessions:
        return {
            'engagement_level': 0.5,
            'learning_pace': 1.0,
            'recent_engagement': 0.0
        }

    engagement_scores = [session.engagement_score or 0.5 for session in recent_sessions]
    pace_ratios = []
    for session in recent_sessions:
        content = Content.query.get(session.content_id)
        if not content or not session.ended_at:
            continue
        time_spent = max((session.ended_at - session.started_at).total_seconds(), 1)
        expected_time = max(content.duration_seconds or 300, 1)
        pace_ratios.append(min(1.6, max(0.6, expected_time / time_spent)))

    return {
        'engagement_level': sum(engagement_scores) / max(len(engagement_scores), 1),
        'learning_pace': sum(pace_ratios) / max(len(pace_ratios), 1) if pace_ratios else 1.0,
        'recent_engagement': sum(engagement_scores) / max(len(engagement_scores), 1)
    }


def _student_profile_payload(user_id, profile, knowledge_state):
    metrics = _student_learning_metrics(user_id)
    return {
        'learning_style': profile.learning_style if profile else 'visual',
        'engagement_level': metrics['engagement_level'],
        'learning_pace': metrics['learning_pace'],
        'knowledge_state': knowledge_state
    }


def _course_payload(course, completion_percentage=0.0, include_creator=False):
    payload = course.to_dict(include_creator=include_creator)
    payload.update(get_course_runtime(course.title, completion_percentage))
    return payload


def _next_milestone(completion_percentage):
    for threshold in [25, 50, 75, 100]:
        if completion_percentage < threshold:
            return f'Reach {threshold}% completion'
    return 'Master the capstone and keep your streak alive'


def _content_asset_url(content):
    if not content or not content.file_path:
        return None
    return url_for('student.content_asset', content_id=str(content.id))


def _serialize_content(content, completed=False):
    data = content.to_dict()
    data['asset_url'] = _content_asset_url(content)
    data['playback_url'] = content.url or data['asset_url']
    data['embed_url'] = youtube_embed_url(content.url or '')
    data['is_youtube'] = bool(data['embed_url'])
    data['completed'] = completed
    return data


def _completed_content_ids(student_id, course_id):
    rows = LearningSession.query.join(Content, LearningSession.content_id == Content.id) \
        .filter(
            LearningSession.student_id == student_id,
            Content.course_id == course_id,
            LearningSession.completed.is_(True)
        ).all()
    return {row.content_id for row in rows}


def _milestone_payload(completion_percentage):
    milestones = [25, 50, 75, 100]
    payload = []
    for threshold in milestones:
        payload.append({
            'threshold': threshold,
            'label': f'Checkpoint {threshold}%',
            'unlocked': completion_percentage >= threshold
        })
    return payload


def _require_course_enrollment(student_id, course_id):
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return None, error_response('Enroll in or get assigned to this course first', 403)
    return enrollment, None


@student_bp.get('/dashboard')
@role_required('student')
def dashboard():
    user_id = parse_uuid(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    course_ids = [e.course_id for e in enrollments]
    courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []

    course_cards = []
    for course in courses:
        enrollment = next((e for e in enrollments if e.course_id == course.id), None)
        course_cards.append({
            **_course_payload(course, enrollment.completion_percentage if enrollment else 0.0, include_creator=True),
            'completion_percentage': enrollment.completion_percentage if enrollment else 0.0
        })

    selected_course = courses[0] if courses else None
    contents = Content.query.filter_by(course_id=selected_course.id).all() if selected_course else []

    knowledge_state = _knowledge_state_dict(user_id)
    student_profile = _student_profile_payload(user_id, profile, knowledge_state)
    ml_service = _get_ml_service()

    completed_ids = _completed_content_ids(user_id, selected_course.id) if selected_course else set()
    content_payload = [_serialize_content(content, completed=content.id in completed_ids) for content in contents]
    target_concepts = list({c for item in content_payload for c in item.get('concept_tags', [])})

    recommendations = ml_service.get_recommendations(student_profile, content_payload, target_concepts)
    learning_path = ml_service.generate_learning_path(student_profile, content_payload)

    recent_sessions = LearningSession.query.filter_by(student_id=user_id).order_by(LearningSession.started_at.desc()).limit(5).all()
    recent_activity = []
    content_lookup = {c.id: c for c in contents}
    for session in recent_sessions:
        content = content_lookup.get(session.content_id)
        recent_activity.append({
            'session_id': str(session.id),
            'content_title': content.title if content else 'Content',
            'date': session.started_at.isoformat(),
            'engagement_score': session.engagement_score or 0.0
        })

    data = {
        'learning_path': learning_path.get('ordered_content', []),
        'recommendations': recommendations,
        'knowledge_state': knowledge_state,
        'streak_days': profile.streak_days if profile else 0,
        'total_points': profile.total_points if profile else 0,
        'badges': profile.badges if profile else [],
        'courses': course_cards,
        'recent_sessions': recent_activity,
        'featured_course': _course_payload(selected_course, course_cards[0]['completion_percentage'] if course_cards else 0.0, include_creator=True) if selected_course else None,
        'next_recommended_content': recommendations[0] if recommendations else None
    }

    return success_response(data, 'Student dashboard')


@student_bp.get('/courses')
@role_required('student')
def list_courses():
    user_id = parse_uuid(get_jwt_identity())
    enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    enrollment_map = {e.course_id: e for e in enrollments}

    courses = Course.query.filter_by(is_published=True).all()
    payload = []
    for course in courses:
        enrollment = enrollment_map.get(course.id)
        student_count = Enrollment.query.filter_by(course_id=course.id).count()
        payload.append({
            **_course_payload(course, enrollment.completion_percentage if enrollment else 0.0, include_creator=True),
            'enrolled': enrollment is not None,
            'completion_percentage': enrollment.completion_percentage if enrollment else 0.0,
            'student_count': student_count,
            'milestones': _milestone_payload(enrollment.completion_percentage if enrollment else 0.0)
        })

    payload.sort(key=lambda item: (not item['enrolled'], item['title']))
    return success_response(payload, 'Courses list')


@student_bp.post('/courses/<course_id>/enroll')
@role_required('student')
def enroll(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)

    course = Course.query.get(course_uuid)
    if not course or not course.is_published:
        return error_response('Course not available', 404)

    existing = Enrollment.query.filter_by(student_id=user_id, course_id=course_uuid).first()
    if existing:
        return success_response(existing.to_dict(), 'Already enrolled')

    enrollment = Enrollment(student_id=user_id, course_id=course_uuid)
    db.session.add(enrollment)
    db.session.commit()

    return success_response(enrollment.to_dict(), 'Enrollment successful', 201)


@student_bp.get('/courses/<course_id>')
@role_required('student')
def course_detail(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)

    course = Course.query.get(course_uuid)
    if not course:
        return error_response('Course not found', 404)
    enrollment, error = _require_course_enrollment(user_id, course_uuid)
    if error:
        return error

    contents = Content.query.filter_by(course_id=course_uuid).all()
    knowledge_state = _knowledge_state_dict(user_id)
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_profile = _student_profile_payload(user_id, profile, knowledge_state)
    completed_ids = _completed_content_ids(user_id, course_uuid)

    ml_service = _get_ml_service()
    content_payload = [_serialize_content(content, completed=content.id in completed_ids) for content in contents]
    learning_path = ml_service.generate_learning_path(student_profile, content_payload)
    recommendations = ml_service.get_recommendations(
        student_profile,
        content_payload,
        list({concept for item in content_payload for concept in item.get('concept_tags', [])})
    )

    ordered_content = []
    for idx, content in enumerate(learning_path.get('ordered_content', []), start=1):
        ordered_content.append({
            **content,
            'order': idx
        })

    course_payload = _course_payload(course, enrollment.completion_percentage if enrollment else 0.0, include_creator=True)
    course_payload['completion_percentage'] = enrollment.completion_percentage if enrollment else 0.0
    course_payload['milestones'] = _milestone_payload(course_payload['completion_percentage'])
    course_concepts = list({concept for item in content_payload for concept in item.get('concept_tags', [])})
    ranked_concepts = sorted(course_concepts, key=lambda concept: knowledge_state.get(concept, 0.0))
    ai_progress_summary = generate_progress_summary({
        'title': course.title,
        'completion_percentage': course_payload['completion_percentage'],
        'learning_style': profile.learning_style if profile else 'visual',
        'recent_engagement': student_profile['engagement_level'],
        'average_performance': student_profile['engagement_level'],
        'knowledge_gaps': ranked_concepts[:3],
        'strengths': list(reversed(ranked_concepts[-3:])) if ranked_concepts else [],
        'streak_days': profile.streak_days if profile else 0,
        'total_points': profile.total_points if profile else 0,
        'next_milestone': _next_milestone(course_payload['completion_percentage'])
    })

    next_content = next((item for item in ordered_content if not item.get('completed')), None)

    data = {
        'course': course_payload,
        'content': ordered_content,
        'recommended_content': recommendations[:3],
        'next_content': next_content,
        'completed_content_ids': [str(content_id) for content_id in completed_ids],
        'ai_progress_summary': ai_progress_summary
    }

    return success_response(data, 'Course details')


@student_bp.post('/content/<content_id>/start')
@role_required('student')
def start_content(content_id):
    user_id = parse_uuid(get_jwt_identity())
    content_uuid = parse_uuid(content_id)
    content = Content.query.get(content_uuid)
    if not content:
        return error_response('Content not found', 404)
    _, error = _require_course_enrollment(user_id, content.course_id)
    if error:
        return error

    session = LearningSession(student_id=user_id, content_id=content_uuid)
    db.session.add(session)
    db.session.commit()

    return success_response({'session_id': str(session.id)}, 'Session started', 201)


@student_bp.post('/content/<content_id>/complete')
@role_required('student')
def complete_content(content_id):
    user_id = parse_uuid(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    session_id = data.get('session_id')
    engagement_score = float(data.get('engagement_score', 0.5))

    if not session_id:
        return error_response('session_id is required', 400)

    session = LearningSession.query.get(parse_uuid(session_id))
    if not session or session.student_id != user_id:
        return error_response('Session not found', 404)

    content = Content.query.get(parse_uuid(content_id))
    if not content:
        return error_response('Content not found', 404)
    _, error = _require_course_enrollment(user_id, content.course_id)
    if error:
        return error

    session.ended_at = datetime.utcnow()
    session.engagement_score = engagement_score
    session.completed = True

    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    profile.total_points += 10
    now = datetime.utcnow()
    if profile.last_active and now - profile.last_active <= timedelta(hours=24):
        profile.streak_days += 1
        profile.total_points += 5
    else:
        profile.streak_days = 1
        profile.total_points += 5
    profile.last_active = now

    ml_service = _get_ml_service()
    new_badges = []

    for concept in content.concept_tags or []:
        knowledge_map = ml_service.update_knowledge_state(str(user_id), concept, engagement_score)
        if concept in knowledge_map:
            _upsert_knowledge_state(user_id, concept, knowledge_map[concept])

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=content.course_id).first()
    if enrollment:
        total_content = Content.query.filter_by(course_id=content.course_id).count()
        completed_count = LearningSession.query.join(Content, LearningSession.content_id == Content.id) \
            .filter(LearningSession.student_id == user_id, Content.course_id == content.course_id, LearningSession.completed.is_(True)) \
            .count()
        enrollment.completion_percentage = (completed_count / max(total_content, 1)) * 100.0

    completed_courses = Enrollment.query.filter_by(student_id=user_id).filter(Enrollment.completion_percentage >= 100).count()
    new_badges = award_badges(profile, completed_courses=completed_courses)
    for badge in new_badges:
        db.session.add(Notification(user_id=user_id, message=f"Badge unlocked: {badge}"))

    updated_completion = enrollment.completion_percentage if enrollment else 0.0
    milestone_reached = max([threshold for threshold in [25, 50, 75, 100] if updated_completion >= threshold], default=None)

    course_contents = Content.query.filter_by(course_id=content.course_id).all()
    knowledge_state = _knowledge_state_dict(user_id)
    student_profile = _student_profile_payload(user_id, profile, knowledge_state)
    recommendations = _get_ml_service().get_recommendations(
        student_profile,
        [_serialize_content(item) for item in course_contents],
        list({concept for item in course_contents for concept in (item.concept_tags or [])})
    )
    course_obj = Course.query.get(content.course_id)
    ai_progress_summary = generate_progress_summary({
        'title': course_obj.title if course_obj else 'Course Progress',
        'completion_percentage': updated_completion,
        'learning_style': profile.learning_style if profile else 'visual',
        'recent_engagement': student_profile['engagement_level'],
        'average_performance': engagement_score,
        'knowledge_gaps': sorted(list({concept for item in course_contents for concept in (item.concept_tags or [])}), key=lambda concept: knowledge_state.get(concept, 0.0))[:3],
        'strengths': [concept for concept, score in sorted(knowledge_state.items(), key=lambda item: item[1], reverse=True)[:3]],
        'streak_days': profile.streak_days,
        'total_points': profile.total_points,
        'next_milestone': _next_milestone(updated_completion)
    })

    db.session.commit()

    return success_response({
        'session_id': str(session.id),
        'points': profile.total_points,
        'new_badges': new_badges,
        'completion_percentage': updated_completion,
        'milestone_reached': milestone_reached,
        'next_recommended_content': recommendations[0] if recommendations else None,
        'ai_progress_summary': ai_progress_summary
    }, 'Content completed')


@student_bp.get('/quiz/<course_id>')
@role_required('student')
def generate_quiz(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    milestone = request.args.get('milestone')
    course = Course.query.get(course_uuid)
    if not course:
        return error_response('Course not found', 404)

    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_uuid).first()
    if not enrollment:
        return error_response('Enroll in or get assigned to this course first', 403)
    completion_percentage = enrollment.completion_percentage if enrollment else 0.0
    if completion_percentage < 25:
        return error_response('Complete at least 25% of the course to unlock a quiz', 403)

    contents = Content.query.filter_by(course_id=course_uuid).all()
    knowledge_state = _knowledge_state_dict(user_id)
    ml_service = _get_ml_service()
    milestone_questions = {
        '25': 3,
        '50': 5,
        '75': 6,
        '100': 8
    }
    n_questions = milestone_questions.get(str(milestone), 5)

    # Gather concepts from course content
    all_concepts = list({c for content in contents for c in (content.concept_tags or [])})
    # Sort by knowledge gap (weakest first)
    all_concepts.sort(key=lambda c: knowledge_state.get(c, 0.0))

    # Determine difficulty from completion
    if completion_percentage < 40:
        difficulty = 'easy'
    elif completion_percentage < 75:
        difficulty = 'medium'
    else:
        difficulty = 'hard'

    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    learning_style = profile.learning_style if profile else 'reading_writing'

    # Use Gemini for dynamic quiz generation
    quiz_result = generate_quiz_with_llm(
        topic=course.title,
        concepts=all_concepts,
        difficulty=difficulty,
        n_questions=n_questions,
        learning_style=learning_style
    )
    quiz = quiz_result['questions']

    # Fallback to ML-based quiz if the LLM/fallback layer returns no questions
    if not quiz:
        quiz = ml_service.generate_quiz([c.to_dict() for c in contents], knowledge_state, n_questions=n_questions)
        quiz_result = {
            'provider': 'ml_service',
            'model': None,
            'llm_enabled': False,
            'reason': 'ml_service_fallback'
        }

    assessment = Assessment(student_id=user_id, course_id=course_uuid, questions=quiz, answers=[], difficulty_level=min(1.0, completion_percentage / 100))
    db.session.add(assessment)
    db.session.commit()

    return success_response({
        'assessment_id': str(assessment.id),
        'questions': quiz,
        'milestone': milestone,
        'completion_percentage': completion_percentage,
        'quiz_provider': quiz_result['provider'],
        'quiz_model': quiz_result['model'],
        'llm_enabled': quiz_result['llm_enabled'],
        'quiz_reason': quiz_result['reason']
    }, 'Quiz generated')


@student_bp.post('/quiz/<course_id>/submit')
@role_required('student')
def submit_quiz(course_id):
    user_id = parse_uuid(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    answers = data.get('answers', [])
    assessment_id = data.get('assessment_id')

    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course:
        return error_response('Course not found', 404)
    _, error = _require_course_enrollment(user_id, course_uuid)
    if error:
        return error

    assessment = Assessment.query.get(parse_uuid(assessment_id)) if assessment_id else None
    if assessment:
        quiz_questions = assessment.questions
    else:
        contents = Content.query.filter_by(course_id=course_uuid).all()
        ml_service = _get_ml_service()
        quiz_questions = ml_service.generate_quiz([c.to_dict() for c in contents], _knowledge_state_dict(user_id), n_questions=5)
        assessment = Assessment(student_id=user_id, course_id=course_uuid, questions=quiz_questions, answers=[])
        db.session.add(assessment)
        db.session.flush()

    answer_map = {idx: ans for idx, ans in enumerate(answers)}
    ml_service = _get_ml_service()
    result = ml_service.quiz_generator.evaluate_quiz_performance(quiz_questions, answer_map)

    assessment.answers = answers
    assessment.score = result['overall_score']

    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    new_badges = []
    if result['overall_score'] >= 0.7:
        profile.total_points += 50

    now = datetime.utcnow()
    if profile.last_active and now - profile.last_active <= timedelta(hours=24):
        profile.streak_days += 1
        profile.total_points += 5
    else:
        profile.streak_days = 1
        profile.total_points += 5
    profile.last_active = now

    quiz_passed_count = Assessment.query.filter_by(student_id=user_id).filter(Assessment.score >= 0.7).count()
    completed_courses = Enrollment.query.filter_by(student_id=user_id).filter(Enrollment.completion_percentage >= 100).count()
    new_badges = award_badges(profile, quiz_passed_count=quiz_passed_count, completed_courses=completed_courses)
    for badge in new_badges:
        db.session.add(Notification(user_id=user_id, message=f"Badge unlocked: {badge}"))

    for concept in result.get('weak_concepts', []):
        knowledge_map = ml_service.update_knowledge_state(str(user_id), concept, result['overall_score'])
        if concept in knowledge_map:
            _upsert_knowledge_state(user_id, concept, knowledge_map[concept])

    contents = Content.query.filter_by(course_id=course_uuid).all()
    refreshed_knowledge_state = _knowledge_state_dict(user_id)
    recommended_followups = ml_service.get_recommendations(
        _student_profile_payload(user_id, profile, refreshed_knowledge_state),
        [_serialize_content(content) for content in contents],
        result.get('weak_concepts', [])
    )

    db.session.commit()

    return success_response({
        'score': result['overall_score'],
        'concept_scores': result['concept_scores'],
        'new_badges': new_badges,
        'weak_concepts': result.get('weak_concepts', []),
        'recommended_followups': recommended_followups[:3]
    }, 'Quiz submitted')


@student_bp.get('/progress')
@role_required('student')
def progress():
    user_id = parse_uuid(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    sessions = LearningSession.query.join(Content, LearningSession.content_id == Content.id) \
        .filter(LearningSession.student_id == user_id) \
        .order_by(LearningSession.started_at.asc()).all()

    session_history = []
    concept_time = {}
    engagement_by_day = {}
    course_time = {}
    course_engagement = {}

    for session in sessions:
        content = Content.query.get(session.content_id)
        concepts = content.concept_tags if content else []
        time_spent = (session.ended_at - session.started_at).total_seconds() if session.ended_at else 0
        day_key = session.started_at.strftime('%Y-%m-%d')
        engagement_by_day.setdefault(day_key, []).append(session.engagement_score or 0.0)
        if content:
            course_obj = Course.query.get(content.course_id)
            if course_obj:
                course_time[course_obj.title] = course_time.get(course_obj.title, 0) + time_spent
                course_engagement.setdefault(course_obj.title, []).append(session.engagement_score or 0.0)
        for concept in concepts:
            concept_time[concept] = concept_time.get(concept, 0) + time_spent
        session_history.append({
            'content_id': str(session.content_id),
            'concepts': concepts,
            'performance': session.engagement_score or 0.0,
            'time_spent': time_spent,
            'engagement_level': session.engagement_score or 0.0
        })

    ml_service = _get_ml_service()
    metrics = ml_service.track_progress(str(user_id), session_history)

    heatmap = [
        {'date': day, 'value': sum(values) / max(len(values), 1)}
        for day, values in engagement_by_day.items()
    ]

    metrics['time_per_concept'] = [
        {'label': concept, 'value': round(seconds / 60, 2)}
        for concept, seconds in concept_time.items()
    ]
    metrics['engagement_heatmap'] = heatmap
    metrics['course_breakdown'] = [
        {
            'title': title,
            'minutes': round(seconds / 60, 1),
            'engagement': round(sum(course_engagement.get(title, [])) / max(len(course_engagement.get(title, [])), 1) * 100),
        }
        for title, seconds in sorted(course_time.items(), key=lambda item: item[1], reverse=True)
    ]

    knowledge_state = _knowledge_state_dict(user_id)
    strengths = [concept for concept, _score in sorted(knowledge_state.items(), key=lambda item: item[1], reverse=True)[:3]]
    metrics['ai_progress_summary'] = generate_progress_summary({
        'title': 'Your learning portfolio',
        'completion_percentage': min(100, metrics.get('total_sessions', 0) * 8),
        'learning_style': profile.learning_style if profile else 'visual',
        'recent_engagement': metrics.get('recent_engagement', 0.0),
        'average_performance': metrics.get('average_performance', 0.0),
        'knowledge_gaps': metrics.get('knowledge_gaps', []),
        'strengths': strengths,
        'streak_days': profile.streak_days if profile else 0,
        'total_points': profile.total_points if profile else 0,
        'next_milestone': 'Close one weak concept gap this week'
    })

    return success_response(metrics, 'Progress metrics')


@student_bp.get('/content/<content_id>')
@role_required('student')
def content_detail(content_id):
    user_id = parse_uuid(get_jwt_identity())
    content_uuid = parse_uuid(content_id)
    content = Content.query.get(content_uuid)
    if not content:
        return error_response('Content not found', 404)
    _, error = _require_course_enrollment(user_id, content.course_id)
    if error:
        return error

    course_contents = Content.query.filter_by(course_id=content.course_id).all()
    knowledge_state = _knowledge_state_dict(user_id)
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_profile = _student_profile_payload(user_id, profile, knowledge_state)
    recommendations = _get_ml_service().get_recommendations(
        student_profile,
        [_serialize_content(item) for item in course_contents if item.id != content.id],
        content.concept_tags or []
    )

    return success_response({
        **_serialize_content(content),
        'related_recommendations': recommendations[:3]
    }, 'Content detail')


@student_bp.get('/content/<content_id>/asset')
@role_required('student')
def content_asset(content_id):
    user_id = parse_uuid(get_jwt_identity())
    content_uuid = parse_uuid(content_id)
    content = Content.query.get(content_uuid)
    if not content or not content.file_path:
        return error_response('Asset not found', 404)
    _, error = _require_course_enrollment(user_id, content.course_id)
    if error:
        return error

    return send_file(content.file_path)


@student_bp.get('/notifications')
@role_required('student')
def notifications():
    user_id = parse_uuid(get_jwt_identity())
    notes = Notification.query.filter_by(user_id=user_id, is_read=False).order_by(Notification.created_at.desc()).all()
    return success_response([n.to_dict() for n in notes], 'Notifications')

