import os
import sys
import time
import logging
import importlib
from typing import Any, Dict, List, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


class MLService:
    def __init__(self, ml_path: str):
        self.ml_path = os.path.abspath(ml_path)
        if self.ml_path not in sys.path:
            sys.path.insert(0, self.ml_path)

        MLConfig = self._import_ml_module('utils.config').Config
        ContentRecommender = self._import_ml_module('core.content_recommender').ContentRecommender
        LearningOptimizer = self._import_ml_module('core.learning_optimizer').LearningOptimizer
        StudentModel = self._import_ml_module('core.student_model').StudentModel
        KnowledgeTracer = self._import_ml_module('models.knowledge_tracer').KnowledgeTracer
        RLLearningAgent = self._import_ml_module('models.rl_agent').RLLearningAgent
        EngagementPredictor = self._import_ml_module('models.engagement_predictor').EngagementPredictor
        QuizGenerator = self._import_ml_module('assessment.quiz_generator').QuizGenerator
        ProgressTracker = self._import_ml_module('assessment.progress_tracker').ProgressTracker
        ContentProcessor = self._import_ml_module('data.content_processor').ContentProcessor

        config_path = os.path.join(self.ml_path, 'configs', 'default.yaml')

        class _FallbackConfig:
            def get(self, _key, default=None):
                return default

        if os.path.exists(config_path):
            self.config = MLConfig(config_path)
        else:
            self.config = _FallbackConfig()

        self.content_recommender_cls = ContentRecommender
        self.learning_optimizer = LearningOptimizer(self.config.get('reinforcement_learning', {}))
        self.student_model = StudentModel(self.config.get('knowledge_tracing', {}))
        self.knowledge_tracer = KnowledgeTracer(8)
        self.rl_agent_cls = RLLearningAgent
        self.engagement_predictor = EngagementPredictor(6)
        self.quiz_generator = QuizGenerator(self.config.get('assessment', {}))
        self.progress_tracker = ProgressTracker(self.config.get('progress_tracking', {}))
        self.content_processor = ContentProcessor(self.config.get('content_recommendation', {}))

        self.logger = logging.getLogger('ml_service')
        if not self.logger.handlers:
            logging.basicConfig(level=logging.INFO)

        self._engagement_input_size = 6

    def _import_ml_module(self, module_name: str):
        roots = ['utils', 'models', 'core', 'assessment', 'data', 'api']
        removed = {}
        for root in roots:
            for key in list(sys.modules.keys()):
                if key == root or key.startswith(root + '.'):
                    mod = sys.modules.get(key)
                    mod_path = getattr(mod, '__file__', '') if mod else ''
                    if not mod_path or not mod_path.startswith(self.ml_path):
                        removed[key] = sys.modules.pop(key, None)

        try:
            return importlib.import_module(module_name)
        finally:
            if removed:
                sys.modules.update(removed)

    def _log_call(self, module: str, input_summary: Dict[str, Any], output_summary: Dict[str, Any], latency_ms: float):
        self.logger.info(
            '%s | input=%s | output=%s | latency_ms=%.2f',
            module,
            input_summary,
            output_summary,
            latency_ms
        )

    def _normalize_content(self, content_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        for item in content_list:
            normalized.append({
                'id': item.get('id'),
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'concepts': item.get('concept_tags', []) or item.get('concepts', []),
                'difficulty': float(item.get('difficulty_score', item.get('difficulty', 0.5))),
                'type': item.get('content_type', item.get('type', 'text')),
                'duration': int(item.get('duration_seconds', item.get('duration', 300)))
            })
        return normalized

    def _default_student_profile(self, student_profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'learning_style': student_profile_dict.get('learning_style', 'visual'),
            'engagement_level': student_profile_dict.get('engagement_level', 0.5),
            'learning_pace': student_profile_dict.get('learning_pace', 1.0),
            'knowledge_state': student_profile_dict.get('knowledge_state', {})
        }

    def get_recommendations(self, student_profile_dict: Dict[str, Any],
                            content_list: List[Dict[str, Any]],
                            target_concepts: List[str]) -> List[Dict[str, Any]]:
        start = time.time()

        profile = self._default_student_profile(student_profile_dict)
        normalized = self._normalize_content(content_list)

        recommender = self.content_recommender_cls(self.config.get('content_recommendation', {}))
        for content in normalized:
            recommender.add_content(content['id'], content)
        recommender.fit_content_vectors()

        if not target_concepts:
            target_concepts = list({c for item in normalized for c in item.get('concepts', [])})

        knowledge_state = profile.get('knowledge_state', {})
        knowledge_gaps = {concept: 1.0 - float(knowledge_state.get(concept, 0.0)) for concept in target_concepts}

        recommendations = recommender.recommend_content(profile, knowledge_gaps, 5)

        latency_ms = (time.time() - start) * 1000
        self._log_call('ContentRecommender.recommend_content',
                       {'targets': len(target_concepts), 'content': len(normalized)},
                       {'count': len(recommendations)},
                       latency_ms)
        return recommendations

    def generate_learning_path(self, student_profile_dict: Dict[str, Any],
                               content_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        start = time.time()
        profile = self._default_student_profile(student_profile_dict)
        normalized = self._normalize_content(content_list)
        knowledge_state = profile.get('knowledge_state', {})
        engagement_level = float(profile.get('engagement_level', 0.5))
        learning_pace = max(0.75, float(profile.get('learning_pace', 1.0)))

        scored = []
        for content in normalized:
            concept_mastery = [float(knowledge_state.get(concept, 0.0)) for concept in content.get('concepts', [])]
            avg_mastery = float(np.mean(concept_mastery)) if concept_mastery else 0.4
            inferred_performance = min(0.95, 0.3 + (avg_mastery * 0.4) + (engagement_level * 0.25))
            adjusted_time = max(180, int(content.get('duration', 300) / learning_pace))
            reward = self.learning_optimizer.calculate_learning_reward(
                profile,
                content,
                performance=inferred_performance,
                time_spent=adjusted_time
            )
            scored.append((content, reward))

        scored.sort(key=lambda x: x[1], reverse=True)
        ordered = [item for item, _ in scored]
        expected_gain = float(np.mean([score for _, score in scored]) if scored else 0.0)

        latency_ms = (time.time() - start) * 1000
        self._log_call('LearningOptimizer.calculate_learning_reward',
                       {'content': len(normalized)},
                       {'ordered': len(ordered), 'expected_gain': expected_gain},
                       latency_ms)

        return {
            'ordered_content': ordered,
            'expected_mastery_gain': expected_gain
        }

    def predict_engagement(self, student_features: List[float], content_features: List[float]) -> float:
        start = time.time()
        features = np.array(student_features + content_features, dtype=np.float32)
        if features.size != self._engagement_input_size:
            self._engagement_input_size = features.size
            EngagementPredictor = self._import_ml_module('models.engagement_predictor').EngagementPredictor
            self.engagement_predictor = EngagementPredictor(self._engagement_input_size)

        import torch
        with torch.no_grad():
            tensor = torch.tensor(features).unsqueeze(0)
            score = float(self.engagement_predictor(tensor).item())

        latency_ms = (time.time() - start) * 1000
        self._log_call('EngagementPredictor.forward',
                       {'feature_len': features.size},
                       {'score': score},
                       latency_ms)
        return score

    def update_knowledge_state(self, student_id: str, concept: str, performance_score: float) -> Dict[str, float]:
        start = time.time()
        if concept not in self.student_model.concept_mapping:
            self.student_model.concept_mapping[concept] = len(self.student_model.concept_mapping)
            self.student_model.initialize_knowledge_tracer(len(self.student_model.concept_mapping))
            for profile in self.student_model.student_profiles.values():
                knowledge_state = profile.get('knowledge_state')
                if knowledge_state is None:
                    continue
                if len(knowledge_state) < len(self.student_model.concept_mapping):
                    pad_width = len(self.student_model.concept_mapping) - len(knowledge_state)
                    profile['knowledge_state'] = np.pad(knowledge_state, (0, pad_width))

        interaction_data = {
            'concept_id': concept,
            'performance': performance_score,
            'content_type': 'text',
            'time_spent': 300,
            'interaction_count': 1
        }
        self.student_model.update_student_profile(student_id, interaction_data)

        profile = self.student_model.student_profiles.get(student_id, {})
        knowledge = profile.get('knowledge_state', [])
        knowledge_map = {
            concept_key: float(knowledge[self.student_model.concept_mapping[concept_key]])
            for concept_key in self.student_model.concept_mapping
            if self.student_model.concept_mapping[concept_key] < len(knowledge)
        }

        latency_ms = (time.time() - start) * 1000
        self._log_call('StudentModel.update_student_profile',
                       {'student_id': student_id, 'concept': concept},
                       {'knowledge_items': len(knowledge_map)},
                       latency_ms)

        return knowledge_map

    def generate_quiz(self, content_list: List[Dict[str, Any]],
                      knowledge_state_dict: Dict[str, float],
                      n_questions: int = 5) -> List[Dict[str, Any]]:
        start = time.time()
        normalized = self._normalize_content(content_list)

        for content in normalized:
            for concept in content.get('concepts', []):
                question = {
                    'question': f"What best describes {concept}?",
                    'options': [
                        f"Core idea of {concept}",
                        f"Unrelated topic to {concept}",
                        f"Advanced subtopic of {concept}",
                        f"History of {concept}"
                    ],
                    'correct_answer': 'A',
                    'concepts': [concept],
                    'type': 'multiple_choice',
                    'explanation': f"{concept} is a foundational concept in this course."
                }
                self.quiz_generator.add_questions(concept, [question])

        student_profile = {
            'learning_style': 'reading_writing',
            'knowledge_state': knowledge_state_dict
        }
        target_concepts = list({c for item in normalized for c in item.get('concepts', [])})
        quiz = self.quiz_generator.generate_adaptive_quiz(student_profile, target_concepts, n_questions)

        latency_ms = (time.time() - start) * 1000
        self._log_call('QuizGenerator.generate_adaptive_quiz',
                       {'concepts': len(target_concepts)},
                       {'questions': len(quiz)},
                       latency_ms)
        return quiz

    def track_progress(self, student_id: str, session_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        start = time.time()

        progress_module = self._import_ml_module('assessment.progress_tracker')
        progress_module.np = np

        for session in session_history:
            self.progress_tracker.record_learning_session(student_id, session)

        insights = self.progress_tracker.get_student_insights(student_id)

        latency_ms = (time.time() - start) * 1000
        self._log_call('ProgressTracker.get_student_insights',
                       {'sessions': len(session_history)},
                       {'metrics': list(insights.keys())},
                       latency_ms)

        return insights

    def extract_concepts_from_text(self, text: str, top_k: int = 8) -> List[str]:
        start = time.time()

        vectorizer = TfidfVectorizer(max_features=200, stop_words='english')
        tfidf = vectorizer.fit_transform([text])
        scores = tfidf.toarray().flatten()
        terms = vectorizer.get_feature_names_out()

        ranked = sorted(zip(terms, scores), key=lambda x: x[1], reverse=True)
        concepts = [term for term, score in ranked[:top_k] if score > 0]

        latency_ms = (time.time() - start) * 1000
        self._log_call('ContentProcessor.extract_concepts',
                       {'chars': len(text)},
                       {'concepts': concepts},
                       latency_ms)
        return concepts
