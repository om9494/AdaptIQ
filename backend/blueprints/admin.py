from datetime import datetime, timedelta
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

try:
    from ..extensions import db
    from ..models.db_models import User, Course, Content, Enrollment, LearningSession, KnowledgeState, Assessment
    from ..utils.decorators import role_required
    from ..utils.helpers import success_response, error_response, parse_uuid
except ImportError:
    from extensions import db
    from models.db_models import User, Course, Content, Enrollment, LearningSession, KnowledgeState, Assessment
    from utils.decorators import role_required
    from utils.helpers import success_response, error_response, parse_uuid


admin_bp = Blueprint('admin', __name__)


@admin_bp.get('/dashboard')
@role_required('admin')
def dashboard():
    total_users = User.query.count()
    role_counts = {
        'student': User.query.filter_by(role='student').count(),
        'educator': User.query.filter_by(role='educator').count(),
        'admin': User.query.filter_by(role='admin').count()
    }
    active_courses = Course.query.filter_by(is_published=True).count()
    sessions_today = LearningSession.query.filter(LearningSession.started_at >= datetime.utcnow().date()).count()
    total_assignments = Enrollment.query.count()
    avg_completion = db.session.query(db.func.avg(Enrollment.completion_percentage)).scalar() or 0.0

    avg_mastery = 0.0
    rows = KnowledgeState.query.all()
    if rows:
        avg_mastery = sum([row.mastery_score for row in rows]) / max(len(rows), 1)

    data = {
        'total_users': total_users,
        'active_courses': active_courses,
        'sessions_today': sessions_today,
        'avg_mastery': avg_mastery,
        'total_assignments': total_assignments,
        'avg_completion': avg_completion,
        'role_counts': role_counts
    }

    return success_response(data, 'Admin dashboard')


@admin_bp.get('/users')
@role_required('admin')
def list_users():
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.all()

    student_ids = [user.id for user in users if user.role == 'student']
    enrollments = Enrollment.query.filter(Enrollment.student_id.in_(student_ids)).all() if student_ids else []
    course_ids = list({enrollment.course_id for enrollment in enrollments})
    courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []
    course_map = {course.id: course for course in courses}

    student_courses = {}
    for enrollment in enrollments:
        course = course_map.get(enrollment.course_id)
        if not course:
            continue
        student_courses.setdefault(enrollment.student_id, []).append({
            'id': str(course.id),
            'title': course.title,
            'subject': course.subject,
            'completion_percentage': enrollment.completion_percentage
        })

    payload = []
    for user in users:
        item = user.to_public()
        if user.role == 'student':
            item['assigned_courses'] = student_courses.get(user.id, [])
        payload.append(item)

    return success_response(payload, 'Users list')


@admin_bp.patch('/users/<user_id>/deactivate')
@role_required('admin')
def deactivate_user(user_id):
    user_uuid = parse_uuid(user_id)
    user = User.query.get(user_uuid)
    if not user:
        return error_response('User not found', 404)

    user.is_active = not user.is_active
    db.session.commit()

    return success_response(user.to_public(), 'User status updated')


@admin_bp.patch('/users/<user_id>/role')
@role_required('admin')
def change_role(user_id):
    user_uuid = parse_uuid(user_id)
    user = User.query.get(user_uuid)
    if not user:
        return error_response('User not found', 404)

    data = request.get_json(silent=True) or {}
    role = data.get('role')
    if role not in ('student', 'educator', 'admin'):
        return error_response('Invalid role', 400)

    user.role = role
    db.session.commit()

    return success_response(user.to_public(), 'Role updated')


@admin_bp.get('/courses')
@role_required('admin')
def list_courses():
    courses = Course.query.all()
    course_ids = [course.id for course in courses]
    content_rows = Content.query.filter(Content.course_id.in_(course_ids)).all() if course_ids else []
    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all() if course_ids else []

    content_count = {}
    for row in content_rows:
        content_count[row.course_id] = content_count.get(row.course_id, 0) + 1

    assigned_count = {}
    avg_completion = {}
    for enrollment in enrollments:
        assigned_count[enrollment.course_id] = assigned_count.get(enrollment.course_id, 0) + 1
        avg_completion.setdefault(enrollment.course_id, []).append(enrollment.completion_percentage)

    payload = []
    for course in courses:
        item = course.to_dict(include_creator=True)
        item['content_count'] = content_count.get(course.id, 0)
        item['assigned_students'] = assigned_count.get(course.id, 0)
        completion_values = avg_completion.get(course.id, [])
        item['avg_completion'] = sum(completion_values) / len(completion_values) if completion_values else 0.0
        payload.append(item)

    return success_response(payload, 'Courses list')


@admin_bp.post('/assignments')
@role_required('admin')
def assign_course():
    data = request.get_json(silent=True) or {}
    course_id = data.get('course_id')
    student_ids = data.get('student_ids') or []
    student_id = data.get('student_id')

    if student_id:
        student_ids = [student_id]

    if not course_id or not student_ids:
        return error_response('course_id and student_ids required', 400)

    course_uuid = parse_uuid(course_id)
    course = Course.query.get(course_uuid)
    if not course:
        return error_response('Course not found', 404)
    if not course.is_published:
        return error_response('Publish the course before assigning it', 400)

    assigned = []
    skipped = []

    for raw_student_id in student_ids:
        student_uuid = parse_uuid(raw_student_id)
        student = User.query.get(student_uuid)
        if not student or student.role != 'student':
            skipped.append({'student_id': raw_student_id, 'reason': 'Student not found'})
            continue

        existing = Enrollment.query.filter_by(student_id=student_uuid, course_id=course_uuid).first()
        if existing:
            skipped.append({'student_id': raw_student_id, 'reason': 'Already assigned'})
            continue

        enrollment = Enrollment(student_id=student_uuid, course_id=course_uuid, completion_percentage=0.0)
        db.session.add(enrollment)
        assigned.append({
            'student_id': str(student_uuid),
            'student_name': student.name,
            'course_id': str(course_uuid),
            'course_title': course.title
        })

    db.session.commit()

    return success_response({
        'assigned': assigned,
        'skipped': skipped
    }, 'Course assignment processed')


@admin_bp.get('/analytics')
@role_required('admin')
def analytics():
    days = 90
    cutoff = datetime.utcnow() - timedelta(days=days)
    sessions = LearningSession.query.filter(LearningSession.started_at >= cutoff).all()
    enrollments = Enrollment.query.all()
    assessments = Assessment.query.filter(Assessment.taken_at >= cutoff).all()

    daily_active = {}
    for session in sessions:
        day = session.started_at.strftime('%Y-%m-%d')
        daily_active.setdefault(day, set()).add(str(session.student_id))

    daily_active_counts = [{'date': day, 'active_users': len(users)} for day, users in daily_active.items()]

    content_usage = {}
    for session in sessions:
        course = Course.query.join(Content, Course.id == Content.course_id) \
            .filter(Content.id == session.content_id).first()
        if course:
            content_usage[course.subject] = content_usage.get(course.subject, 0) + 1

    content_usage_series = [{'label': subject, 'value': count} for subject, count in content_usage.items()]

    mastery_rows = KnowledgeState.query.filter(KnowledgeState.updated_at >= cutoff).all()
    mastery_by_day = {}
    for row in mastery_rows:
        day = row.updated_at.strftime('%Y-%m-%d')
        mastery_by_day.setdefault(day, []).append(row.mastery_score)

    mastery_growth = [
        {'date': day, 'value': sum(values) / max(len(values), 1)}
        for day, values in mastery_by_day.items()
    ]

    assignment_completion_map = {}
    if enrollments:
        for enrollment in enrollments:
            course = Course.query.get(enrollment.course_id)
            if course:
                assignment_completion_map.setdefault(course.title, []).append(enrollment.completion_percentage)

    assignment_completion = [
        {'label': title, 'value': round(sum(values) / len(values), 2)}
        for title, values in assignment_completion_map.items()
    ]

    quiz_performance = {}
    for assessment in assessments:
        course = Course.query.get(assessment.course_id)
        if not course:
            continue
        quiz_performance.setdefault(course.title, []).append((assessment.score or 0.0) * 100)

    quiz_performance_series = [
        {'label': course_title, 'value': round(sum(scores) / len(scores), 2)}
        for course_title, scores in quiz_performance.items()
    ]

    data = {
        'daily_active_users': daily_active_counts,
        'content_usage_by_subject': content_usage_series,
        'mastery_growth': mastery_growth,
        'assignment_completion': assignment_completion,
        'quiz_performance': quiz_performance_series
    }

    return success_response(data, 'Admin analytics')
