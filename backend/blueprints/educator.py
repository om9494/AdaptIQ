import json
from datetime import datetime, timedelta
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity

try:
    from ..extensions import db
    from ..models.db_models import Course, Content, Enrollment, LearningSession, Assessment, KnowledgeState, User
    from ..utils.decorators import role_required
    from ..utils.helpers import success_response, error_response, parse_uuid, youtube_embed_url, youtube_thumbnail_url
    from ..utils.file_handler import save_upload, validate_upload, extract_text_from_file
except ImportError:
    from extensions import db
    from models.db_models import Course, Content, Enrollment, LearningSession, Assessment, KnowledgeState, User
    from utils.decorators import role_required
    from utils.helpers import success_response, error_response, parse_uuid, youtube_embed_url, youtube_thumbnail_url
    from utils.file_handler import save_upload, validate_upload, extract_text_from_file


educator_bp = Blueprint('educator', __name__)


def _get_ml_service():
    return current_app.extensions['ml_service']


def _serialize_content(content):
    data = content.to_dict()
    data['is_youtube'] = bool(youtube_embed_url(content.url or ''))
    data['embed_url'] = youtube_embed_url(content.url or '')
    data['preview_thumbnail'] = youtube_thumbnail_url(content.url or '')
    data['has_uploaded_file'] = bool(content.file_path)
    return data


@educator_bp.get('/dashboard')
@role_required('educator')
def dashboard():
    user_id = parse_uuid(get_jwt_identity())
    courses = Course.query.filter_by(created_by=user_id).all()
    course_ids = [c.id for c in courses]

    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all() if course_ids else []
    content_items = Content.query.filter(Content.course_id.in_(course_ids)).all() if course_ids else []

    session_count = LearningSession.query.join(Content, LearningSession.content_id == Content.id) \
        .filter(Content.course_id.in_(course_ids)).count() if course_ids else 0

    avg_engagement = 0.0
    sessions = []
    if session_count:
        sessions = LearningSession.query.join(Content, LearningSession.content_id == Content.id) \
            .filter(Content.course_id.in_(course_ids)).all()
        avg_engagement = sum([s.engagement_score or 0 for s in sessions]) / max(len(sessions), 1)

    daily_active_map = {}
    cutoff = datetime.utcnow() - timedelta(days=6)
    for session in sessions:
        if session.started_at < cutoff:
            continue
        day = session.started_at.strftime('%Y-%m-%d')
        daily_active_map.setdefault(day, set()).add(str(session.student_id))

    data = {
        'total_students': len({e.student_id for e in enrollments}),
        'total_courses': len(courses),
        'avg_engagement': avg_engagement,
        'total_content_items': len(content_items),
        'daily_active_students': [
            {'date': day, 'active': len(student_ids)}
            for day, student_ids in sorted(daily_active_map.items())
        ],
        'courses': [{
            **c.to_dict(include_creator=True),
            'content_count': len([item for item in content_items if item.course_id == c.id]),
            'assigned_students': len({enrollment.student_id for enrollment in enrollments if enrollment.course_id == c.id})
        } for c in courses]
    }

    return success_response(data, 'Educator dashboard')


@educator_bp.post('/courses')
@role_required('educator')
def create_course():
    user_id = parse_uuid(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    required_fields = ['title', 'description', 'subject', 'difficulty_level']
    if not all(data.get(field) for field in required_fields):
        return error_response('Missing course fields', 400)

    course = Course(
        title=data['title'],
        description=data['description'],
        subject=data['subject'],
        difficulty_level=data['difficulty_level'],
        created_by=user_id,
        thumbnail_url=data.get('thumbnail_url')
    )
    db.session.add(course)
    db.session.commit()

    return success_response(course.to_dict(), 'Course created', 201)


@educator_bp.put('/courses/<course_id>')
@role_required('educator')
def update_course(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)

    data = request.get_json(silent=True) or {}
    for field in ['title', 'description', 'subject', 'difficulty_level', 'thumbnail_url']:
        if field in data:
            setattr(course, field, data[field])

    db.session.commit()
    return success_response(course.to_dict(), 'Course updated')


@educator_bp.get('/courses/<course_id>')
@role_required('educator')
def get_course(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)
    return success_response(course.to_dict(), 'Course detail')


@educator_bp.patch('/courses/<course_id>/publish')
@role_required('educator')
def toggle_publish(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)

    course.is_published = not course.is_published
    db.session.commit()

    return success_response(course.to_dict(), 'Publish status updated')


@educator_bp.get('/courses/<course_id>/content')
@role_required('educator')
def list_content(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)

    contents = Content.query.filter_by(course_id=course_uuid).all()
    return success_response([_serialize_content(c) for c in contents], 'Content list')


@educator_bp.post('/courses/<course_id>/content/upload')
@role_required('educator')
def upload_content(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)

    title = request.form.get('title')
    content_type = request.form.get('content_type')
    difficulty_score = request.form.get('difficulty_score')
    description = request.form.get('description')
    url = request.form.get('url')
    concept_tags_raw = request.form.get('concept_tags', '[]')

    if not title or not content_type or difficulty_score is None:
        return error_response('Missing content fields', 400)

    try:
        difficulty_score = float(difficulty_score)
    except ValueError:
        return error_response('Invalid difficulty score', 400)

    try:
        concept_tags = json.loads(concept_tags_raw)
    except json.JSONDecodeError:
        concept_tags = []

    file_storage = request.files.get('file')
    file_path = None

    extracted_tags = []
    if file_storage:
        if not validate_upload(file_storage.filename, content_type):
            return error_response('File type not allowed for selected content type', 400)
        if content_type in ('pdf', 'text'):
            text = extract_text_from_file(file_storage, content_type)
            if text:
                extracted_tags = _get_ml_service().extract_concepts_from_text(text)
            file_storage.stream.seek(0)
        file_path, _ = save_upload(file_storage, current_app.config['UPLOAD_FOLDER'], str(course_uuid))

    if not extracted_tags:
        text_for_analysis = ' '.join(filter(None, [title, description, url]))
        if text_for_analysis.strip():
            extracted_tags = _get_ml_service().extract_concepts_from_text(text_for_analysis)

    if extracted_tags:
        concept_tags = list({*concept_tags, *extracted_tags})

    content = Content(
        course_id=course_uuid,
        title=title,
        content_type=content_type,
        file_path=file_path,
        url=url,
        duration_seconds=int(request.form.get('duration_seconds', '0') or 0),
        difficulty_score=difficulty_score,
        concept_tags=concept_tags,
        description=description
    )
    db.session.add(content)
    db.session.commit()

    return success_response({
        **_serialize_content(content),
        'extracted_tags': extracted_tags
    }, 'Content uploaded', 201)


@educator_bp.post('/content/extract-tags')
@role_required('educator')
def extract_tags():
    file_storage = request.files.get('file')
    content_type = request.form.get('content_type', 'text')

    if not file_storage:
        return error_response('file is required', 400)

    text = extract_text_from_file(file_storage, content_type)
    if not text:
        return error_response('Unable to extract text', 400)

    tags = _get_ml_service().extract_concepts_from_text(text)
    return success_response({'suggested_tags': tags}, 'Tags extracted')


@educator_bp.delete('/content/<content_id>')
@role_required('educator')
def delete_content(content_id):
    user_id = parse_uuid(get_jwt_identity())
    content_uuid = parse_uuid(content_id)
    content = Content.query.get(content_uuid)
    if not content:
        return error_response('Content not found', 404)

    course = Course.query.get(content.course_id)
    if not course or course.created_by != user_id:
        return error_response('Forbidden', 403)

    db.session.delete(content)
    db.session.commit()

    return success_response({}, 'Content deleted')


@educator_bp.get('/courses/<course_id>/students')
@role_required('educator')
def course_students(course_id):
    user_id = parse_uuid(get_jwt_identity())
    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course or course.created_by != user_id:
        return error_response('Course not found', 404)

    enrollments = Enrollment.query.filter_by(course_id=course_uuid).all()
    student_ids = [e.student_id for e in enrollments]
    students = User.query.filter(User.id.in_(student_ids)).all() if student_ids else []
    knowledge = KnowledgeState.query.filter(KnowledgeState.student_id.in_(student_ids)).all() if student_ids else []

    knowledge_map = {}
    for row in knowledge:
        knowledge_map.setdefault(str(row.student_id), []).append(row.to_dict())

    payload = []
    for student in students:
        payload.append({
            'student': student.to_public(),
            'knowledge': knowledge_map.get(str(student.id), [])
        })

    return success_response(payload, 'Enrolled students')


@educator_bp.get('/students/<student_id>/analytics')
@role_required('educator')
def student_analytics(student_id):
    student_uuid = parse_uuid(student_id)
    sessions = LearningSession.query.filter_by(student_id=student_uuid).order_by(LearningSession.started_at.desc()).all()
    knowledge = KnowledgeState.query.filter_by(student_id=student_uuid).all()
    student = User.query.get(student_uuid)

    session_history = []
    for session in sessions:
        session_history.append({
            'content_id': str(session.content_id),
            'started_at': session.started_at.isoformat(),
            'duration_minutes': ((session.ended_at - session.started_at).total_seconds() / 60) if session.ended_at else 0,
            'engagement_score': session.engagement_score or 0,
            'completed': session.completed
        })

    data = {
        'student': student.to_public() if student else None,
        'knowledge_state': [row.to_dict() for row in knowledge],
        'sessions': session_history
    }

    return success_response(data, 'Student analytics')


@educator_bp.get('/assessments')
@role_required('educator')
def assessments():
    user_id = parse_uuid(get_jwt_identity())
    courses = Course.query.filter_by(created_by=user_id).all()
    course_ids = [c.id for c in courses]
    assessments = Assessment.query.filter(Assessment.course_id.in_(course_ids)).all() if course_ids else []

    return success_response([a.to_dict() for a in assessments], 'Assessments')
