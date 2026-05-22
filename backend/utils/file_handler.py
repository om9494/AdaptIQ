import os
import tempfile
from typing import Tuple, Optional
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader


ALLOWED_EXTENSIONS = {
    'text': {'.txt', '.md'},
    'pdf': {'.pdf'},
    'video': {'.mp4', '.mov', '.mkv', '.webm'},
    'audio': {'.mp3', '.wav', '.ogg', '.m4a'},
    'interactive': {'.html', '.zip'}
}


def validate_upload(filename: str, content_type: str) -> bool:
    ext = os.path.splitext(filename.lower())[1]
    allowed = ALLOWED_EXTENSIONS.get(content_type, set())
    return ext in allowed


def save_upload(file_storage, upload_root: str, course_id: str) -> Tuple[str, str]:
    os.makedirs(upload_root, exist_ok=True)
    course_dir = os.path.join(upload_root, course_id)
    os.makedirs(course_dir, exist_ok=True)

    filename = secure_filename(file_storage.filename)
    stored_name = f"{uuid4_str()}_{filename}"
    path = os.path.join(course_dir, stored_name)
    file_storage.save(path)
    return path, stored_name


def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or '')
    return '\n'.join(text_parts)


def extract_text_from_file(file_storage, content_type: str) -> Optional[str]:
    if content_type not in ('pdf', 'text'):
        return None

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file_storage.save(temp_file.name)
        temp_path = temp_file.name

    try:
        if content_type == 'pdf':
            return extract_text_from_pdf(temp_path)
        return open(temp_path, 'r', encoding='utf-8', errors='ignore').read()
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


def uuid4_str() -> str:
    import uuid
    return str(uuid.uuid4())
