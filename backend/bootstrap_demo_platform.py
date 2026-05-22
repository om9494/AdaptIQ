import os


os.environ.setdefault('FLASK_ENV', 'development')
os.environ.setdefault('SECRET_KEY', 'change-me')
os.environ.setdefault('DATABASE_URL', 'postgresql://root:root@localhost:5432/eduadapt_db')
os.environ.setdefault('JWT_SECRET_KEY', 'change-me-jwt')
os.environ.setdefault('UPLOAD_FOLDER', './uploads')
os.environ.setdefault('MAX_CONTENT_LENGTH', '104857600')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

from app import create_app, db
from course_catalog import ALL_COURSE_BLUEPRINTS, expand_course_contents
from models.db_models import Course, Content, Enrollment, User, StudentProfile
from werkzeug.security import generate_password_hash


HASH_METHOD = 'pbkdf2:sha256'


def _hash_password(password: str) -> str:
    return generate_password_hash(password, method=HASH_METHOD)


def ensure_demo_users():
    if not User.query.filter_by(email='admin@adaptiq.com').first():
        db.session.add(User(
            name='Admin',
            email='admin@adaptiq.com',
            role='admin',
            password_hash=_hash_password('admin123')
        ))

    for index in range(1, 4):
        email = f'educator{index}@adaptiq.com'
        if not User.query.filter_by(email=email).first():
            db.session.add(User(
                name=f'Educator {index}',
                email=email,
                role='educator',
                password_hash=_hash_password('educator123')
            ))

    for index in range(1, 11):
        email = f'student{index}@adaptiq.com'
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=f'Student {index}',
                email=email,
                role='student',
                password_hash=_hash_password('student123')
            )
            db.session.add(user)
            db.session.flush()
        if not StudentProfile.query.filter_by(user_id=user.id).first():
            db.session.add(StudentProfile(user_id=user.id))

    db.session.commit()


def bootstrap():
    app = create_app()
    with app.app_context():
        ensure_demo_users()

        for definition in ALL_COURSE_BLUEPRINTS:
            educator = User.query.filter_by(email=definition['educator_email']).first()
            if not educator:
                continue

            course = Course.query.filter_by(title=definition['title']).first()
            if not course:
                course = Course(
                    title=definition['title'],
                    description=definition['description'],
                    subject=definition['subject'],
                    difficulty_level=definition['difficulty_level'],
                    created_by=educator.id,
                    is_published=True,
                    thumbnail_url=definition['thumbnail_url']
                )
                db.session.add(course)
                db.session.flush()
            else:
                course.description = definition['description']
                course.subject = definition['subject']
                course.difficulty_level = definition['difficulty_level']
                course.thumbnail_url = definition['thumbnail_url']
                course.created_by = educator.id
                course.is_published = True

            for content_definition in expand_course_contents(definition):
                content_type = content_definition.get('content_type', 'video' if content_definition is definition['video'] else 'text')
                content = Content.query.filter_by(course_id=course.id, title=content_definition['title']).first()
                if not content:
                    content = Content(course_id=course.id, title=content_definition['title'], content_type=content_type)
                    db.session.add(content)
                content.content_type = content_type
                content.file_path = content_definition.get('file_path')
                content.url = content_definition.get('url')
                content.duration_seconds = content_definition.get('duration_seconds', 300)
                content.difficulty_score = content_definition.get('difficulty_score', 0.5)
                content.concept_tags = content_definition.get('concept_tags', [])
                content.description = content_definition.get('description')

            for student_email in definition['student_emails']:
                student = User.query.filter_by(email=student_email).first()
                if not student:
                    continue
                existing = Enrollment.query.filter_by(student_id=student.id, course_id=course.id).first()
                if not existing:
                    db.session.add(Enrollment(student_id=student.id, course_id=course.id, completion_percentage=0.0))

        db.session.commit()
        print('Demo learning platform data is ready with educator1 and educator2 catalogs.')


if __name__ == '__main__':
    bootstrap()


