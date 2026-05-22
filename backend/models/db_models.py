import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Enum
from extensions import db


UserRole = Enum('student', 'educator', 'admin', name='user_role')
LearningStyle = Enum('visual', 'auditory', 'kinesthetic', 'reading_writing', name='learning_style')
ContentType = Enum('text', 'video', 'audio', 'pdf', 'interactive', name='content_type')


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(UserRole, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    student_profile = db.relationship('StudentProfile', back_populates='user', uselist=False)
    courses = db.relationship('Course', back_populates='creator')

    def to_public(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active
        }


class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), primary_key=True)
    learning_style = db.Column(LearningStyle, default='visual')
    current_level = db.Column(db.String(64), default='beginner')
    total_points = db.Column(db.Integer, default=0)
    streak_days = db.Column(db.Integer, default=0)
    badges = db.Column(db.JSON, default=list)
    last_active = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', back_populates='student_profile')

    def to_dict(self):
        return {
            'user_id': str(self.user_id),
            'learning_style': self.learning_style,
            'current_level': self.current_level,
            'total_points': self.total_points,
            'streak_days': self.streak_days,
            'badges': self.badges,
            'last_active': self.last_active.isoformat() if self.last_active else None
        }


class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    subject = db.Column(db.String(128), nullable=False)
    difficulty_level = db.Column(db.String(32), nullable=False)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    thumbnail_url = db.Column(db.String(512), nullable=True)

    creator = db.relationship('User', back_populates='courses')
    contents = db.relationship('Content', back_populates='course', cascade='all, delete-orphan')

    def to_dict(self, include_creator=False):
        data = {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'difficulty_level': self.difficulty_level,
            'created_by': str(self.created_by),
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat(),
            'thumbnail_url': self.thumbnail_url
        }
        if include_creator and self.creator:
            data['creator'] = self.creator.to_public()
        return data


class Content(db.Model):
    __tablename__ = 'contents'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content_type = db.Column(ContentType, nullable=False)
    file_path = db.Column(db.String(1024), nullable=True)
    url = db.Column(db.String(1024), nullable=True)
    duration_seconds = db.Column(db.Integer, nullable=True)
    difficulty_score = db.Column(db.Float, nullable=False)
    concept_tags = db.Column(db.JSON, default=list)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    course = db.relationship('Course', back_populates='contents')

    def to_dict(self):
        return {
            'id': str(self.id),
            'course_id': str(self.course_id),
            'title': self.title,
            'content_type': self.content_type,
            'file_path': self.file_path,
            'url': self.url,
            'duration_seconds': self.duration_seconds,
            'difficulty_score': self.difficulty_score,
            'concept_tags': self.concept_tags,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }


class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completion_percentage = db.Column(db.Float, default=0.0)

    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', name='uniq_enrollment'),)

    def to_dict(self):
        return {
            'id': str(self.id),
            'student_id': str(self.student_id),
            'course_id': str(self.course_id),
            'enrolled_at': self.enrolled_at.isoformat(),
            'completion_percentage': self.completion_percentage
        }


class LearningSession(db.Model):
    __tablename__ = 'learning_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content_id = db.Column(UUID(as_uuid=True), db.ForeignKey('contents.id'), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)
    engagement_score = db.Column(db.Float, nullable=True)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': str(self.id),
            'student_id': str(self.student_id),
            'content_id': str(self.content_id),
            'started_at': self.started_at.isoformat(),
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'engagement_score': self.engagement_score,
            'completed': self.completed
        }


class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'), nullable=False)
    questions = db.Column(db.JSON, default=list)
    answers = db.Column(db.JSON, default=list)
    score = db.Column(db.Float, nullable=True)
    difficulty_level = db.Column(db.Float, default=0.5)
    taken_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'student_id': str(self.student_id),
            'course_id': str(self.course_id),
            'questions': self.questions,
            'answers': self.answers,
            'score': self.score,
            'difficulty_level': self.difficulty_level,
            'taken_at': self.taken_at.isoformat()
        }


class KnowledgeState(db.Model):
    __tablename__ = 'knowledge_states'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    concept = db.Column(db.String(128), nullable=False)
    mastery_score = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('student_id', 'concept', name='uniq_student_concept'),)

    def to_dict(self):
        return {
            'id': str(self.id),
            'student_id': str(self.student_id),
            'concept': self.concept,
            'mastery_score': self.mastery_score,
            'updated_at': self.updated_at.isoformat()
        }


class LearningPath(db.Model):
    __tablename__ = 'learning_paths'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'), nullable=False)
    recommended_content_ids = db.Column(db.JSON, default=list)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    rl_reward_score = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            'id': str(self.id),
            'student_id': str(self.student_id),
            'course_id': str(self.course_id),
            'recommended_content_ids': self.recommended_content_ids,
            'generated_at': self.generated_at.isoformat(),
            'rl_reward_score': self.rl_reward_score
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(512), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }
