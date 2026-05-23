from datetime import datetime, timedelta
from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

try:
    from ..extensions import db
    from ..models.db_models import User, StudentProfile, Notification
    from ..utils.helpers import success_response, error_response, parse_uuid
    from ..utils.badges import award_badges
except ImportError:
    from extensions import db
    from models.db_models import User, StudentProfile, Notification
    from utils.helpers import success_response, error_response, parse_uuid
    from utils.badges import award_badges

# scrypt is unsupported on Windows Python 3.13 — force pbkdf2:sha256
_HASH_METHOD = 'pbkdf2:sha256'


def _hash_password(password: str) -> str:
    return generate_password_hash(password, method=_HASH_METHOD)


def _check_password(stored_hash: str, password: str) -> bool:
    # If the stored hash uses scrypt (unsupported on this platform), re-hash on the fly
    if stored_hash.startswith('scrypt:'):
        return False
    return check_password_hash(stored_hash, password)


auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
def register():
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not name or not email or not password or role not in ('student', 'educator'):
        return error_response('Invalid registration data', 400)

    if User.query.filter_by(email=email).first():
        return error_response('Email already registered', 400)

    user = User(
        name=name,
        email=email,
        role=role,
        password_hash=_hash_password(password)
    )
    db.session.add(user)
    db.session.flush()

    if role == 'student':
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)

    db.session.commit()

    return success_response(user.to_public(), 'Registration successful', 201)


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return error_response('Email and password required', 400)

    user = User.query.filter_by(email=email).first()
    if not user or not _check_password(user.password_hash, password):
        return error_response('Invalid credentials', 401)

    if not user.is_active:
        return error_response('Account is deactivated', 403)

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})

    new_badges = []
    if user.role == 'student':
        profile = StudentProfile.query.filter_by(user_id=user.id).first()
        now = datetime.utcnow()
        just_logged_in = profile.last_active is None

        if profile.last_active and now - profile.last_active <= timedelta(hours=24):
            profile.streak_days += 1
            profile.total_points += 5
        else:
            profile.streak_days = 1
            profile.total_points += 5

        profile.last_active = now
        new_badges = award_badges(profile, just_logged_in=just_logged_in)
        for badge in new_badges:
            db.session.add(Notification(user_id=user.id, message=f"Badge unlocked: {badge}"))
        db.session.commit()

    return success_response({
        'access_token': access_token,
        'user': user.to_public(),
        'new_badges': new_badges
    }, 'Login successful')


@auth_bp.post('/logout')
def logout():
    return success_response({}, 'Logout successful')


@auth_bp.get('/me')
@jwt_required()
def me():
    user_id = parse_uuid(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response('User not found', 404)

    data = user.to_public()
    if user.role == 'student' and user.student_profile:
        data['profile'] = user.student_profile.to_dict()

    return success_response(data, 'User profile')


@auth_bp.put('/profile')
@jwt_required()
def update_profile():
    user_id = parse_uuid(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response('User not found', 404)

    data = request.get_json(silent=True) or {}
    name = data.get('name')
    email = data.get('email')
    learning_style = data.get('learning_style')

    if name:
        user.name = name
    if email:
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user.id:
            return error_response('Email already in use', 400)
        user.email = email

    if user.role == 'student' and learning_style:
        if user.student_profile:
            user.student_profile.learning_style = learning_style

    db.session.commit()
    payload = user.to_public()
    if user.role == 'student' and user.student_profile:
        payload['profile'] = user.student_profile.to_dict()

    return success_response(payload, 'Profile updated')
