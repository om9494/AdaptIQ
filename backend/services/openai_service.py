import json
import logging
import os
import time
from importlib.util import find_spec
from typing import Any, Dict, List

from pydantic import BaseModel, Field

logger = logging.getLogger('llm_service')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')


class QuizQuestionSchema(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    explanation: str
    concepts: List[str]
    type: str = 'multiple_choice'
    difficulty: str


def _classify_gemini_error(exc: Exception) -> str:
    message = str(exc).lower()
    if 'resource_exhausted' in message or 'quota' in message or '429' in message:
        return 'gemini_insufficient_quota'
    if '503' in message or 'unavailable' in message or 'high demand' in message:
        return 'gemini_temporarily_unavailable'
    if 'api key not valid' in message or 'invalid api key' in message or 'permission_denied' in message or '403' in message:
        return 'gemini_auth_error'
    if 'not found' in message or 'model' in message and 'supported' in message:
        return 'gemini_model_error'
    if 'timeout' in message:
        return 'gemini_timeout'
    return 'gemini_error'


def _strip_code_fence(raw: str) -> str:
    if not raw.startswith('```'):
        return raw.strip()

    parts = raw.split('```')
    raw = parts[1] if len(parts) > 1 else raw
    if raw.startswith('json'):
        raw = raw[4:]
    return raw.strip()


def _parse_delimited_quiz(raw: str, concepts: List[str], difficulty: str) -> List[Dict[str, Any]]:
    questions = []
    chunks = [chunk for chunk in raw.split('<<<QUESTION>>>') if '<<<END>>>' in chunk]

    for chunk in chunks:
        block = chunk.split('<<<END>>>', 1)[0]
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        record: Dict[str, Any] = {}
        option_map: Dict[str, str] = {}

        for line in lines:
            if line.startswith('QUESTION:'):
                record['question'] = line.split(':', 1)[1].strip()
            elif line.startswith('A:'):
                option_map['A'] = line.split(':', 1)[1].strip()
            elif line.startswith('B:'):
                option_map['B'] = line.split(':', 1)[1].strip()
            elif line.startswith('C:'):
                option_map['C'] = line.split(':', 1)[1].strip()
            elif line.startswith('D:'):
                option_map['D'] = line.split(':', 1)[1].strip()
            elif line.startswith('ANSWER:'):
                record['correct_answer'] = line.split(':', 1)[1].strip().upper()[:1]
            elif line.startswith('EXPLANATION:'):
                record['explanation'] = line.split(':', 1)[1].strip()
            elif line.startswith('CONCEPTS:'):
                raw_concepts = line.split(':', 1)[1].strip()
                record['concepts'] = [item.strip() for item in raw_concepts.replace(',', '|').split('|') if item.strip()]
            elif line.startswith('DIFFICULTY:'):
                record['difficulty'] = line.split(':', 1)[1].strip().lower()

        if len(option_map) != 4 or not all(key in record for key in ['question', 'correct_answer']):
            continue

        questions.append({
            'question': record['question'],
            'options': [option_map['A'], option_map['B'], option_map['C'], option_map['D']],
            'correct_answer': record.get('correct_answer', 'A') if record.get('correct_answer') in ['A', 'B', 'C', 'D'] else 'A',
            'explanation': record.get('explanation', ''),
            'concepts': record.get('concepts', concepts[:1]),
            'type': 'multiple_choice',
            'difficulty': record.get('difficulty', difficulty)
        })

    return questions


def get_llm_status() -> Dict[str, Any]:
    package_installed = find_spec('google.genai') is not None
    key_present = bool(GEMINI_API_KEY)
    available = package_installed and key_present
    blockers = []
    if not package_installed:
        blockers.append('gemini_package_missing')
    if not key_present:
        blockers.append('gemini_api_key_missing')

    return {
        'available': available,
        'provider': 'gemini' if available else 'fallback',
        'model': GEMINI_MODEL,
        'package_installed': package_installed,
        'api_key_present': key_present,
        'blockers': blockers
    }


def _gemini_client():
    if not get_llm_status()['available']:
        return None
    from google import genai
    return genai.Client(api_key=GEMINI_API_KEY)


def _generate_with_gemini(
    prompt: str,
    system_prompt: str,
    max_tokens: int = 800,
    response_mime_type: str | None = None
) -> str:
    client = _gemini_client()
    if not client:
        raise RuntimeError('Gemini client unavailable')

    from google.genai import types

    attempts = 2
    for attempt in range(attempts):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.4,
                    max_output_tokens=max_tokens,
                    response_mime_type=response_mime_type,
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                )
            )

            if getattr(response, 'text', None):
                return response.text.strip()

            candidates = getattr(response, 'candidates', []) or []
            for candidate in candidates:
                content = getattr(candidate, 'content', None)
                parts = getattr(content, 'parts', []) if content else []
                text_parts = [getattr(part, 'text', '').strip() for part in parts if getattr(part, 'text', None)]
                if text_parts:
                    return '\n'.join(text_parts).strip()

            raise ValueError('Gemini returned an empty response')
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(2)


def generate_quiz_with_llm(
    topic: str,
    concepts: List[str],
    difficulty: str = 'medium',
    n_questions: int = 5,
    learning_style: str = 'reading_writing'
) -> Dict[str, Any]:
    status = get_llm_status()
    if not status['available']:
        return {
            'questions': _fallback_questions(concepts, n_questions, difficulty),
            'provider': 'fallback',
            'model': status['model'],
            'llm_enabled': False,
            'reason': ','.join(status['blockers']) if status['blockers'] else 'llm_unavailable'
        }

    try:
        style_hint = {
            'visual': 'Prefer vivid, interface-based, or diagram-friendly scenarios when useful.',
            'auditory': 'Prefer explanation-style questions that mirror spoken reasoning.',
            'kinesthetic': 'Prefer hands-on, action-oriented scenarios.',
            'reading_writing': 'Prefer concise analytical text questions.'
        }.get(learning_style, '')

        concepts_str = ', '.join(concepts[:8]) if concepts else topic
        client = _gemini_client()
        if not client:
            raise RuntimeError('Gemini client unavailable')

        from google.genai import types

        concepts_pool = concepts[:max(1, n_questions)] or [topic.replace(' ', '_').lower()]
        validated = []

        for index in range(n_questions):
            focus_concept = concepts_pool[index % len(concepts_pool)]
            prompt = f"""Create one multiple-choice quiz question for the course "{topic}".
Focus concept: {focus_concept}
Additional context concepts: {concepts_str}
Difficulty: {difficulty}
Learning style preference: {learning_style}. {style_hint}

Return one concise question with exactly 4 answer options, one correct answer label, a short explanation, and the concept list."""

            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction='You are an expert EdTech quiz designer. Return strict JSON only for a single quiz question.',
                    temperature=0.35,
                    max_output_tokens=320,
                    response_mime_type='application/json',
                    response_schema=QuizQuestionSchema,
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                )
            )

            item = getattr(response, 'parsed', None)
            if not item:
                raw = _strip_code_fence(getattr(response, 'text', '') or '')
                item = json.loads(raw)
            if hasattr(item, 'model_dump'):
                item = item.model_dump()

            if not all(key in item for key in ['question', 'options', 'correct_answer']):
                continue
            if not isinstance(item['options'], list) or len(item['options']) != 4:
                continue

            correct_answer = item['correct_answer'] if item['correct_answer'] in ['A', 'B', 'C', 'D'] else 'A'
            validated.append({
                'question': item['question'],
                'options': item['options'],
                'correct_answer': correct_answer,
                'explanation': item.get('explanation', ''),
                'concepts': item.get('concepts', [focus_concept]),
                'type': 'multiple_choice',
                'difficulty': item.get('difficulty', difficulty)
            })

        if not validated:
            raise ValueError('No valid questions returned')

        return {
            'questions': validated[:n_questions],
            'provider': 'gemini',
            'model': status['model'],
            'llm_enabled': True,
            'reason': 'gemini_success'
        }
    except Exception as exc:
        reason = _classify_gemini_error(exc)
        logger.warning('Gemini quiz generation failed (%s): %s - using fallback', reason, exc)
        return {
            'questions': _fallback_questions(concepts, n_questions, difficulty),
            'provider': 'fallback',
            'model': status['model'],
            'llm_enabled': False,
            'reason': reason
        }


def generate_quiz_with_openai(
    topic: str,
    concepts: List[str],
    difficulty: str = 'medium',
    n_questions: int = 5,
    learning_style: str = 'reading_writing'
) -> Dict[str, Any]:
    return generate_quiz_with_llm(topic, concepts, difficulty, n_questions, learning_style)


def generate_progress_summary(payload: Dict[str, Any]) -> Dict[str, Any]:
    status = get_llm_status()
    fallback_summary = _fallback_progress_summary(payload)
    if not status['available']:
        return {
            'summary': fallback_summary,
            'provider': 'fallback',
            'model': status['model'],
            'llm_enabled': False,
            'reason': ','.join(status['blockers']) if status['blockers'] else 'llm_unavailable'
        }

    try:
        prompt = f"""Create a short learner-facing progress brief in 3-4 sentences.
Course or view: {payload.get('title', 'Learning Progress')}
Completion: {payload.get('completion_percentage', 0)}%
Learning style: {payload.get('learning_style', 'visual')}
Recent engagement: {payload.get('recent_engagement', 0)}
Average performance: {payload.get('average_performance', 0)}
Knowledge gaps: {', '.join(payload.get('knowledge_gaps', [])[:6]) or 'none noted'}
Strengths: {', '.join(payload.get('strengths', [])[:6]) or 'developing fundamentals'}
Current streak days: {payload.get('streak_days', 0)}
Current points: {payload.get('total_points', 0)}
Next milestone: {payload.get('next_milestone', 'Continue steady progress')}

Keep the tone motivating, specific, and actionable. Avoid markdown. Mention one concrete next step."""

        summary = _generate_with_gemini(
            prompt=prompt,
            system_prompt='You are a concise AI learning coach writing short, practical progress briefs.',
            max_tokens=220
        )
        return {
            'summary': summary,
            'provider': 'gemini',
            'model': status['model'],
            'llm_enabled': True,
            'reason': 'gemini_success'
        }
    except Exception as exc:
        reason = _classify_gemini_error(exc)
        logger.warning('Gemini progress summary failed (%s): %s - using fallback', reason, exc)
        return {
            'summary': fallback_summary,
            'provider': 'fallback',
            'model': status['model'],
            'llm_enabled': False,
            'reason': reason
        }


def _fallback_questions(concepts: List[str], n_questions: int, difficulty: str = 'medium') -> List[Dict[str, Any]]:
    questions = []
    for concept in concepts[:n_questions]:
        questions.append({
            'question': f'Which statement best describes the concept of "{concept}"?',
            'options': [
                f'{concept} is a foundational principle in this subject area.',
                f'{concept} is unrelated to the core learning objectives.',
                f'{concept} only applies in advanced scenarios.',
                f'{concept} is a deprecated concept no longer in use.'
            ],
            'correct_answer': 'A',
            'explanation': f'{concept} is indeed a foundational concept covered in this course.',
            'concepts': [concept],
            'type': 'multiple_choice',
            'difficulty': difficulty
        })

    while len(questions) < n_questions and questions:
        questions.append(questions[len(questions) % len(questions)])
    return questions[:n_questions]


def _fallback_progress_summary(payload: Dict[str, Any]) -> str:
    title = payload.get('title', 'this course')
    completion = round(float(payload.get('completion_percentage', 0)))
    recent_engagement = round(float(payload.get('recent_engagement', 0)) * 100)
    strengths = payload.get('strengths', [])
    knowledge_gaps = payload.get('knowledge_gaps', [])
    next_milestone = payload.get('next_milestone', 'Keep progressing through the next lesson block.')

    strength_text = strengths[0].replace('_', ' ') if strengths else 'your steady lesson completion'
    gap_text = knowledge_gaps[0].replace('_', ' ') if knowledge_gaps else 'reinforcing your current concepts'

    return (
        f'You are {completion}% through {title}, and your recent engagement is around {recent_engagement}%. '
        f'Your strongest signal right now is {strength_text}. '
        f'The next growth area is {gap_text}, so focus there before pushing to the next checkpoint. '
        f'Next step: {next_milestone}'
    )
