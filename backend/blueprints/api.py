import sys
import importlib
from flask import Blueprint, request, current_app

from extensions import db
from models.db_models import Content, KnowledgeState, StudentProfile, LearningSession, Course
from utils.decorators import role_required
from utils.helpers import success_response, error_response, parse_uuid


api_bp = Blueprint('api', __name__)


def _get_ml_service():
    return current_app.extensions['ml_service']


def _import_learning_schema():
    ml_path = current_app.config.get('ML_PATH')
    if ml_path and ml_path not in sys.path:
        sys.path.insert(0, ml_path)
    module = importlib.import_module('api.schemas')
    return module.LearningRequest


def _knowledge_state_dict(student_id):
    rows = KnowledgeState.query.filter_by(student_id=student_id).all()
    return {row.concept: row.mastery_score for row in rows}


@api_bp.post('/recommend')
@role_required('student', 'educator', 'admin')
def recommend():
    data = request.get_json(silent=True) or {}

    try:
        LearningRequest = _import_learning_schema()
        payload = LearningRequest(**data)
    except Exception:
        return error_response('Invalid request payload', 400)

    course_id = data.get('course_id')
    course = Course.query.get(parse_uuid(course_id)) if course_id else None
    if course_id and not course:
        return error_response('Course not found', 404)

    contents = Content.query.filter_by(course_id=course.id).all() if course else []
    knowledge_state = _knowledge_state_dict(parse_uuid(payload.student_id))
    profile = StudentProfile.query.filter_by(user_id=parse_uuid(payload.student_id)).first()
    student_profile = {
        'learning_style': profile.learning_style if profile else 'visual',
        'engagement_level': 0.5,
        'learning_pace': 1.0,
        'knowledge_state': knowledge_state
    }

    ml_service = _get_ml_service()
    recommendations = ml_service.get_recommendations(student_profile, [c.to_dict() for c in contents], payload.target_concepts)

    return success_response(recommendations, 'Recommendations')


@api_bp.post('/learning-path')
@role_required('student', 'educator', 'admin')
def learning_path():
    data = request.get_json(silent=True) or {}
    student_id = data.get('student_id')
    course_id = data.get('course_id')

    if not student_id or not course_id:
        return error_response('student_id and course_id required', 400)

    course = Course.query.get(parse_uuid(course_id))
    if not course:
        return error_response('Course not found', 404)

    contents = Content.query.filter_by(course_id=course.id).all()
    knowledge_state = _knowledge_state_dict(parse_uuid(student_id))
    profile = StudentProfile.query.filter_by(user_id=parse_uuid(student_id)).first()
    student_profile = {
        'learning_style': profile.learning_style if profile else 'visual',
        'engagement_level': 0.5,
        'learning_pace': 1.0,
        'knowledge_state': knowledge_state
    }

    ml_service = _get_ml_service()
    result = ml_service.generate_learning_path(student_profile, [c.to_dict() for c in contents])

    return success_response(result, 'Learning path')


@api_bp.get('/knowledge-state/<student_id>')
@role_required('student', 'educator', 'admin')
def knowledge_state(student_id):
    student_uuid = parse_uuid(student_id)
    knowledge = KnowledgeState.query.filter_by(student_id=student_uuid).all()
    return success_response([k.to_dict() for k in knowledge], 'Knowledge state')


@api_bp.post('/update-knowledge')
@role_required('student', 'educator', 'admin')
def update_knowledge():
    data = request.get_json(silent=True) or {}
    student_id = data.get('student_id')
    concept = data.get('concept')
    performance_score = float(data.get('performance_score', 0.0))

    if not student_id or not concept:
        return error_response('student_id and concept required', 400)

    ml_service = _get_ml_service()
    knowledge_map = ml_service.update_knowledge_state(student_id, concept, performance_score)

    student_uuid = parse_uuid(student_id)
    if concept in knowledge_map:
        row = KnowledgeState.query.filter_by(student_id=student_uuid, concept=concept).first()
        if not row:
            row = KnowledgeState(student_id=student_uuid, concept=concept, mastery_score=knowledge_map[concept])
            db.session.add(row)
        else:
            row.mastery_score = knowledge_map[concept]
        db.session.commit()

    return success_response({'concept': concept, 'mastery_score': knowledge_map.get(concept, 0.0)}, 'Knowledge updated')


@api_bp.get('/engagement-prediction/<student_id>/<content_id>')
@role_required('student', 'educator', 'admin')
def engagement_prediction(student_id, content_id):
    student_uuid = parse_uuid(student_id)
    content_uuid = parse_uuid(content_id)

    profile = StudentProfile.query.filter_by(user_id=student_uuid).first()
    content = Content.query.get(content_uuid)
    if not content:
        return error_response('Content not found', 404)

    mastery = _knowledge_state_dict(student_uuid)
    avg_mastery = sum(mastery.values()) / max(len(mastery), 1) if mastery else 0.0

    student_features = [
        (profile.total_points if profile else 0) / 1000,
        (profile.streak_days if profile else 0) / 30,
        avg_mastery
    ]
    content_features = [
        float(content.difficulty_score or 0.5),
        float((content.duration_seconds or 0) / 1000),
        1.0
    ]

    ml_service = _get_ml_service()
    score = ml_service.predict_engagement(student_features, content_features)

    return success_response({'engagement_score': score}, 'Engagement predicted')


@api_bp.post('/quiz/generate')
@role_required('student', 'educator', 'admin')
def generate_quiz():
    data = request.get_json(silent=True) or {}
    course_id = data.get('course_id')
    student_id = data.get('student_id')
    n_questions = int(data.get('n_questions', 5))

    if not course_id or not student_id:
        return error_response('course_id and student_id required', 400)

    course = Course.query.get(parse_uuid(course_id))
    if not course:
        return error_response('Course not found', 404)

    contents = Content.query.filter_by(course_id=course.id).all()
    knowledge_state = _knowledge_state_dict(parse_uuid(student_id))

    ml_service = _get_ml_service()
    quiz = ml_service.generate_quiz([c.to_dict() for c in contents], knowledge_state, n_questions=n_questions)

    return success_response({'questions': quiz}, 'Quiz generated')


@api_bp.get('/progress/<student_id>')
@role_required('student', 'educator', 'admin')
def progress(student_id):
    student_uuid = parse_uuid(student_id)
    sessions = LearningSession.query.filter_by(student_id=student_uuid).all()

    session_history = []
    for session in sessions:
        session_history.append({
            'content_id': str(session.content_id),
            'concepts': [],
            'performance': session.engagement_score or 0.0,
            'time_spent': (session.ended_at - session.started_at).total_seconds() if session.ended_at else 0,
            'engagement_level': session.engagement_score or 0.0
        })

    ml_service = _get_ml_service()
    metrics = ml_service.track_progress(student_id, session_history)

    return success_response(metrics, 'Progress metrics')
