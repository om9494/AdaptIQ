from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from utils.helpers import error_response


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            role = claims.get('role')
            if role not in roles:
                return error_response('Forbidden', 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
