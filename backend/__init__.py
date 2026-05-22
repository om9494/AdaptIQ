try:
    from .app import create_app
except ImportError:
    from app import create_app

__all__ = ['create_app']
