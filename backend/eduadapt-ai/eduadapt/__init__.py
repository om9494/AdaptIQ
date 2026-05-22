__version__ = '0.0.1'

# Lightweight proxies to core components for quick import tests
try:
    from core.content_recommender import ContentRecommender
    from core.learning_optimizer import LearningOptimizer
    from core.student_model import StudentModel
    __all__ = ['ContentRecommender', 'LearningOptimizer', 'StudentModel']
except Exception:
    pass
