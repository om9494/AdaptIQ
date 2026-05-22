import uuid
from typing import Any, Dict, Tuple
from urllib.parse import parse_qs, urlparse


def success_response(data: Any = None, message: str = 'OK', status_code: int = 200) -> Tuple[Dict[str, Any], int]:
    return {
        'status': 'success',
        'data': data,
        'message': message
    }, status_code


def error_response(message: str, status_code: int = 400, data: Any = None) -> Tuple[Dict[str, Any], int]:
    return {
        'status': 'error',
        'data': data,
        'message': message
    }, status_code


def parse_uuid(value: Any):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def youtube_video_id(url: str) -> str | None:
    if not url:
        return None

    parsed = urlparse(url)
    host = parsed.netloc.lower()

    if host in {'youtu.be', 'www.youtu.be'}:
        return parsed.path.strip('/').split('/')[0] or None

    if 'youtube.com' in host:
        if parsed.path == '/watch':
            return parse_qs(parsed.query).get('v', [None])[0]
        if parsed.path.startswith('/embed/'):
            return parsed.path.split('/embed/', 1)[1].split('/')[0]
        if parsed.path.startswith('/shorts/'):
            return parsed.path.split('/shorts/', 1)[1].split('/')[0]

    return None


def youtube_embed_url(url: str) -> str | None:
    video_id = youtube_video_id(url)
    if not video_id:
        return None
    return f'https://www.youtube.com/embed/{video_id}'


def youtube_thumbnail_url(url: str) -> str | None:
    video_id = youtube_video_id(url)
    if not video_id:
        return None
    return f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
