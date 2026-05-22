import os
from datetime import datetime, timedelta


os.environ.setdefault('FLASK_ENV', 'development')
os.environ.setdefault('SECRET_KEY', 'change-me')
os.environ.setdefault('DATABASE_URL', 'postgresql://root:root@localhost:5432/eduadapt_db')
os.environ.setdefault('JWT_SECRET_KEY', 'change-me-jwt')
os.environ.setdefault('UPLOAD_FOLDER', './uploads')
os.environ.setdefault('MAX_CONTENT_LENGTH', '104857600')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

from app import create_app, db
from course_catalog import ALL_COURSE_BLUEPRINTS, expand_course_contents
from models.db_models import (
    Assessment,
    Content,
    Course,
    Enrollment,
    KnowledgeState,
    LearningSession,
    StudentProfile,
    User,
)
from werkzeug.security import generate_password_hash


LEARNING_STYLES = ['visual', 'auditory', 'kinesthetic', 'reading_writing']
HASH_METHOD = 'pbkdf2:sha256'


def _hash_password(password: str) -> str:
    return generate_password_hash(password, method=HASH_METHOD)


def seed(reset=True):
    app = create_app()
    with app.app_context():
        if reset:
            db.drop_all()
            db.create_all()
        else:
            db.create_all()
            if User.query.first() or Course.query.first():
                print('Seed skipped because the database already contains data.')
                return

        admin = User(
            name='Admin',
            email='admin@adaptiq.com',
            role='admin',
            password_hash=_hash_password('admin123')
        )
        db.session.add(admin)

        educators = []
        for index in range(1, 4):
            educator = User(
                name=f'Educator {index}',
                email=f'educator{index}@adaptiq.com',
                role='educator',
                password_hash=_hash_password('educator123')
            )
            educators.append(educator)
            db.session.add(educator)

        students = []
        for index in range(1, 11):
            student = User(
                name=f'Student {index}',
                email=f'student{index}@adaptiq.com',
                role='student',
                password_hash=_hash_password('student123')
            )
            students.append(student)
            db.session.add(student)
        db.session.flush()

        for index, student in enumerate(students):
            profile = StudentProfile(
                user_id=student.id,
                learning_style=LEARNING_STYLES[index % len(LEARNING_STYLES)],
                current_level='beginner',
                total_points=40 + (index * 10),
                streak_days=(index % 5) + 1,
                badges=['starter']
            )
            db.session.add(profile)

        educators_by_email = {educator.email: educator for educator in educators}
        students_by_email = {student.email: student for student in students}

        all_courses = []
        knowledge_state_seen = {student.id: set() for student in students}

        for course_index, blueprint in enumerate(ALL_COURSE_BLUEPRINTS):
            educator = educators_by_email[blueprint['educator_email']]
            course = Course(
                title=blueprint['title'],
                description=blueprint['description'],
                subject=blueprint['subject'],
                difficulty_level=blueprint['difficulty_level'],
                created_by=educator.id,
                is_published=True,
                thumbnail_url=blueprint['thumbnail_url']
            )
            db.session.add(course)
            db.session.flush()
            all_courses.append(course)

            lesson_rows = []
            for content_definition in expand_course_contents(blueprint):
                content_row = Content(
                    course_id=course.id,
                    title=content_definition['title'],
                    content_type=content_definition.get('content_type', 'video' if content_definition is blueprint['video'] else 'text'),
                    url=content_definition.get('url'),
                    file_path=content_definition.get('file_path'),
                    duration_seconds=content_definition.get('duration_seconds', 300),
                    difficulty_score=content_definition.get('difficulty_score', 0.5),
                    concept_tags=content_definition.get('concept_tags', []),
                    description=content_definition.get('description')
                )
                db.session.add(content_row)
                lesson_rows.append(content_row)

            db.session.flush()

            for student_offset, student_email in enumerate(blueprint['student_emails']):
                student = students_by_email[student_email]
                completion_percentage = min(85.0, float((student_offset + 1) * 15 + (course_index % 4) * 5))
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    completion_percentage=completion_percentage
                )
                db.session.add(enrollment)

                completed_lessons = min(len(lesson_rows), max(1, int(completion_percentage // 25)))
                for lesson_index, lesson_row in enumerate(lesson_rows[:completed_lessons]):
                    started_at = datetime.utcnow() - timedelta(days=(course_index % 7) + lesson_index + student_offset)
                    ended_at = started_at + timedelta(minutes=max(8, int((lesson_row.duration_seconds or 300) / 60)))
                    db.session.add(LearningSession(
                        student_id=student.id,
                        content_id=lesson_row.id,
                        started_at=started_at,
                        ended_at=ended_at,
                        engagement_score=min(0.95, 0.6 + (lesson_index * 0.07) + (student_offset * 0.03)),
                        completed=True
                    ))

                knowledge_tags = []
                for lesson_row in lesson_rows[:2]:
                    knowledge_tags.extend((lesson_row.concept_tags or [])[:2])
                for tag_index, concept in enumerate(dict.fromkeys(knowledge_tags)):
                    if concept in knowledge_state_seen[student.id]:
                        continue
                    db.session.add(KnowledgeState(
                        student_id=student.id,
                        concept=concept,
                        mastery_score=min(0.92, 0.34 + tag_index * 0.16 + student_offset * 0.05)
                    ))
                    knowledge_state_seen[student.id].add(concept)

                db.session.add(Assessment(
                    student_id=student.id,
                    course_id=course.id,
                    questions=[],
                    answers=[],
                    score=min(0.96, 0.56 + student_offset * 0.11),
                    difficulty_level=min(0.9, 0.4 + course_index * 0.02)
                ))

        db.session.commit()
        print(
            f'Seed completed with {len(all_courses)} total courses, '
            f'{sum(1 for course in ALL_COURSE_BLUEPRINTS if course["educator_email"] == "educator1@adaptiq.com")} for educator1, '
            f'{sum(1 for course in ALL_COURSE_BLUEPRINTS if course["educator_email"] == "educator2@adaptiq.com")} for educator2.'
        )


if __name__ == '__main__':
    seed()


