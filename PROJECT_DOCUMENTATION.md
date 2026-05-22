# AdaptIq — Complete Project Documentation
### Adaptive Learning Platform Powered by Machine Learning

> **Version:** 1.0 | **Stack:** React 18 + Flask 3 + PostgreSQL + PyTorch + Google Gemini
> **Purpose:** This document covers the full architecture, all ML/AI algorithms, data flows, APIs, and platform features — structured for a PPT presentation.

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [ML/AI Models — Deep Dive](#5-mlai-models--deep-dive)
   - 5.1 Knowledge Tracer (LSTM)
   - 5.2 Student Model (Bayesian Knowledge Update)
   - 5.3 Content Recommender (TF-IDF + Weighted Scoring)
   - 5.4 Learning Optimizer (Actor-Critic RL)
   - 5.5 Engagement Predictor (Neural Network)
   - 5.6 Quiz Generator (Adaptive + Google Gemini)
   - 5.7 Progress Tracker
6. [Complete Data Flow](#6-complete-data-flow)
7. [API Reference](#7-api-reference)
8. [Platform Features](#8-platform-features)
9. [Gamification System](#9-gamification-system)
10. [Configuration & Hyperparameters](#10-configuration--hyperparameters)
11. [Key Metrics & Performance](#11-key-metrics--performance)
12. [PPT Slide Outline](#12-ppt-slide-outline)

---

## 1. EXECUTIVE SUMMARY

**AdaptIq** is a full-stack adaptive learning platform that uses multiple machine learning models working in concert to deliver a personalized education experience. Unlike static LMS platforms (Moodle, Canvas), AdaptIq continuously learns from each student's behavior and adjusts:

- **What content** to show next (Content Recommender)
- **In what order** to present it (RL Learning Optimizer)
- **How difficult** the quizzes should be (Adaptive Quiz Generator)
- **Whether the student will engage** with a piece of content (Engagement Predictor)
- **How much the student knows** about each concept (Knowledge Tracer + Bayesian Update)

### Core Value Proposition
| Traditional LMS | AdaptIq |
|---|---|
| Same content for all students | Personalized per student |
| Fixed quiz difficulty | Adaptive difficulty based on mastery |
| Manual course ordering | AI-ordered learning paths |
| No engagement prediction | Pre-emptive engagement scoring |
| Static progress tracking | Real-time knowledge state updates |

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                       │
│  Landing → Auth → Student Dashboard → Course Viewer → Quiz UI   │
│  Educator Dashboard → Course Builder → Analytics                 │
│  Admin Dashboard → User Management → Platform Analytics          │
│                    Vite + Tailwind CSS + Recharts                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST + JWT
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND (Python 3.13)                  │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ /auth    │ │ /student │ │/educator │ │  /admin  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                    ┌──────────────┐                               │
│                    │  /api (ML)   │                               │
│                    └──────────────┘                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    MLService (Bridge)                    │    │
│  │  Dynamically imports ML package via importlib            │    │
│  │  Logs every call with latency metrics                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌──────────────────┐             ┌──────────────────────────────┐
│   PostgreSQL DB  │             │    AdaptIq ML Package     │
│                  │             │                               │
│  users           │             │  core/                        │
│  student_profiles│             │    student_model.py           │
│  courses         │             │    content_recommender.py     │
│  contents        │             │    learning_optimizer.py      │
│  enrollments     │             │                               │
│  learning_sessions│            │  models/                      │
│  assessments     │             │    knowledge_tracer.py (LSTM) │
│  knowledge_states│             │    rl_agent.py (Actor-Critic) │
│  learning_paths  │             │    engagement_predictor.py    │
│  notifications   │             │                               │
└──────────────────┘             │  assessment/                  │
                                 │    quiz_generator.py          │
                                 │    progress_tracker.py        │
                                 │                               │
                                 │  services/                    │
                                 │    openai_service.py (Gemini)    │
                                 └──────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK

### Backend
| Component | Technology | Purpose |
|---|---|---|
| Web Framework | Flask 3.x | REST API server |
| ORM | SQLAlchemy 2.x + Flask-SQLAlchemy | Database abstraction |
| Migrations | Flask-Migrate (Alembic) | Schema versioning |
| Auth | Flask-JWT-Extended | Stateless JWT tokens |
| CORS | Flask-CORS | Cross-origin requests |
| Database | PostgreSQL 15 | Primary data store |
| ML Framework | PyTorch 2.x | Neural network models |
| ML Utilities | scikit-learn, numpy, pandas | TF-IDF, data processing |
| AI Quizzes | Google Gemini | Dynamic quiz generation |
| PDF Parsing | PyPDF2 | Text extraction from uploads |
| Password Hashing | Werkzeug (pbkdf2:sha256) | Secure credential storage |

### Frontend
| Component | Technology | Purpose |
|---|---|---|
| Framework | React 18 | UI library |
| Build Tool | Vite 5 | Dev server + bundler |
| Routing | React Router v6 | Client-side navigation |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Charts | Recharts | Analytics visualizations |
| HTTP Client | Axios | API communication |
| Icons | react-icons (Feather) | UI iconography |
| State | React Context + hooks | Auth + toast state |

---

## 4. DATABASE SCHEMA

### Entity Relationship Overview
```
User (1) ──── (1) StudentProfile
User (1) ──── (N) Course [created_by]
Course (1) ── (N) Content
User (1) ──── (N) Enrollment ──── (N) Course
User (1) ──── (N) LearningSession ── (N) Content
User (1) ──── (N) Assessment ──── (N) Course
User (1) ──── (N) KnowledgeState [per concept]
User (1) ──── (N) Notification
```

### Key Tables

**users** — Core identity
```
id (UUID PK) | email (unique) | password_hash | name | role (student/educator/admin) | is_active
```

**student_profiles** — Learning metadata
```
user_id (FK) | learning_style (visual/auditory/kinesthetic/reading_writing)
total_points | streak_days | badges (JSON array) | last_active
```

**courses** — Course catalog
```
id (UUID) | title | description | subject | difficulty_level | created_by (FK)
is_published | thumbnail_url | created_at
```

**contents** — Learning materials
```
id (UUID) | course_id (FK) | title | content_type (text/video/audio/pdf/interactive)
file_path | url | duration_seconds | difficulty_score (0.0–1.0)
concept_tags (JSON array) | description
```

**knowledge_states** — Per-student per-concept mastery
```
id (UUID) | student_id (FK) | concept (string) | mastery_score (0.0–1.0) | updated_at
UNIQUE(student_id, concept)
```

**learning_sessions** — Activity tracking
```
id (UUID) | student_id (FK) | content_id (FK) | started_at | ended_at
engagement_score (0.0–1.0) | completed (bool)
```

**assessments** — Quiz records
```
id (UUID) | student_id (FK) | course_id (FK) | questions (JSON) | answers (JSON)
score (0.0–1.0) | difficulty_level | taken_at
```

---

---

## 5. ML/AI MODELS — DEEP DIVE

### 5.1 Knowledge Tracer (LSTM Neural Network)

**File:** `backend/adaptiq/models/knowledge_tracer.py`
**Purpose:** Predict a student's current mastery level for each concept based on their learning history sequence.

#### Architecture
```
Input: Sequence of (concept_id, performance_score) pairs
         ↓
Concept Embeddings  →  [batch, seq_len, hidden_size=128]
Performance Values  →  expanded to [batch, seq_len, hidden_size=128]
         ↓
Concatenate         →  [batch, seq_len, hidden_size*2 = 256]
         ↓
LSTM Layer          →  [batch, seq_len, hidden_size=128]
         ↓
Take last timestep  →  [batch, hidden_size=128]
         ↓
Linear(128 → 64) + ReLU + Dropout(0.2)
         ↓
Linear(64 → num_concepts)
         ↓
Sigmoid             →  Output: [batch, num_concepts] — values in [0,1]
```

#### How It Works
- Each concept is embedded into a 128-dimensional vector space
- The LSTM processes the student's entire interaction history as a sequence
- The final hidden state captures the "accumulated knowledge" across all past interactions
- Sigmoid output gives a probability (0 = no mastery, 1 = full mastery) per concept
- This is a form of **Deep Knowledge Tracing (DKT)**, inspired by Piech et al. (2015)

#### Key Parameters (from `default.yaml`)
```yaml
hidden_size: 128
sequence_length: 10
learning_rate: 0.001
```

---

### 5.2 Student Model (Bayesian Knowledge Update)

**File:** `backend/adaptiq/core/student_model.py`
**Purpose:** Maintain and update a real-time knowledge state for each student using a Bayesian-inspired update rule.

#### The Core Update Formula
```
new_knowledge = current_knowledge + knowledge_gain - knowledge_decay

Where:
  knowledge_gain = performance × learning_rate × (1 - current_knowledge)
  knowledge_decay = forgetting_rate × current_knowledge

Parameters:
  learning_rate   = 0.1   (how fast new knowledge is absorbed)
  forgetting_rate = 0.05  (how fast knowledge decays without practice)
```

#### Why This Formula Works
- `(1 - current_knowledge)` — ensures diminishing returns (harder to go from 90% to 100% than 0% to 10%)
- `forgetting_rate × current_knowledge` — simulates the Ebbinghaus forgetting curve
- Result is always clipped to [0, 1]

#### Additional Capabilities
```python
# Learning Style Detection (from content interaction patterns)
if content_type in ['video', 'animation'] and time_spent > 300:
    style = 'visual'
elif content_type in ['audio', 'podcast'] and performance > 0.7:
    style = 'auditory'
elif content_type in ['interactive', 'simulation']:
    style = 'kinesthetic'
else:
    style = 'reading_writing'

# Engagement Calculation (EMA-smoothed)
engagement = 0.7 × current_engagement + 0.3 × new_engagement
new_engagement = time_score×0.4 + performance_score×0.4 + interaction_score×0.2

# Learning Pace Estimation
if avg_performance > 0.8 and time_spent < 300:  → pace = 1.5x (fast learner)
elif avg_performance < 0.5 and time_spent > 600: → pace = 0.7x (needs support)
else:                                             → pace = 1.0x (normal)
```

---

### 5.3 Content Recommender (TF-IDF + Weighted Scoring)

**File:** `backend/adaptiq/core/content_recommender.py`
**Purpose:** Score and rank all available content for a student based on their current knowledge gaps and learning profile.

#### Scoring Formula
```
Total Score = 0.5 × Relevance
            + 0.3 × Style Match
            + 0.1 × Difficulty Match
            + 0.1 × Duration Match
```

#### Component Breakdown

**Relevance Score (50% weight)**
```python
# Average knowledge gap across content's concepts
relevance = mean(knowledge_gap[concept] for concept in content.concepts)
knowledge_gap[concept] = 1.0 - student_mastery[concept]
# → Content covering concepts the student doesn't know scores highest
```

**Style Match Score (30% weight)**
```python
style_mapping = {
    'visual':          ['video', 'animation', 'infographic'],
    'auditory':        ['audio', 'podcast', 'lecture'],
    'kinesthetic':     ['interactive', 'simulation', 'game'],
    'reading_writing': ['text', 'article', 'ebook']
}
# Perfect match → 1.0, No match → 0.3
```

**Difficulty Match Score (10% weight)**
```python
optimal_difficulty = 0.3 + (engagement_level × 0.4)
# Low engagement → easier content (0.3)
# High engagement → harder content (0.7)
difficulty_score = max(0, 1 - |content_difficulty - optimal_difficulty| × 2)
```

**Duration Match Score (10% weight)**
```python
ideal_duration = 300 × learning_pace
if engagement > 0.7: ideal_duration × 1.5  # engaged students can handle longer content
duration_score = min(actual, ideal) / max(actual, ideal)
```

#### Concept Graph & Prerequisite Paths
The recommender also maintains a concept dependency graph. If a student needs concept B but hasn't mastered prerequisite concept A, the system recursively builds a learning path: `[A → B]`.

---

### 5.4 Learning Optimizer (Actor-Critic Reinforcement Learning)

**File:** `backend/adaptiq/core/learning_optimizer.py` + `models/rl_agent.py`
**Purpose:** Determine the optimal ordering of content for a student to maximize learning outcomes using Reinforcement Learning.

#### The RL Agent Architecture (Actor-Critic / A2C)
```
Input: State vector (student profile features)
         ↓
    ┌────────────────────────────────────┐
    │         Shared Input Layer         │
    └──────────────┬─────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
  Policy Network           Value Network
  (Actor)                  (Critic)
  Linear(state→128)        Linear(state→128)
  ReLU                     ReLU
  Linear(128→128)          Linear(128→128)
  ReLU                     ReLU
  Linear(128→actions)      Linear(128→1)
  ↓                        ↓
  Action Logits            State Value V(s)
  (which content next?)    (how good is this state?)
```

#### Reward Function
```python
total_reward = (
    knowledge_gain    × 0.5 +   # Did the student learn?
    engagement_bonus  × 0.2 +   # Was the student engaged?
    efficiency_bonus  × 0.1 +   # Was time used well?
    style_match       × 0.1 +   # Did content match learning style?
    difficulty_match  × 0.1     # Was difficulty appropriate?
)

efficiency_bonus = max(0, 1 - time_spent / 600)  # Penalizes very long sessions
```

#### Training Algorithm (A2C — Advantage Actor-Critic)
```python
# Advantage = how much better was this action than expected?
advantage = target_value - current_value
target_value = reward + γ × V(next_state)   # γ = 0.99 (discount factor)

# Policy loss: encourage actions that led to positive advantage
policy_loss = -log(π(action|state)) × advantage

# Value loss: make value estimates more accurate
value_loss = MSE(V(state), target_value)

total_loss = policy_loss + value_loss
```

#### How It's Used in Production
> **Important:** The RL agent is used in **inference mode only** during live requests. The `calculate_learning_reward()` function scores each content item and sorts them by expected reward — this gives the AI-ordered learning path. Full online training happens offline via `scripts/train_models.py`.

```python
# Live inference (every dashboard/course load):
for content in course_contents:
    reward = optimizer.calculate_learning_reward(student_profile, content, ...)
    scored.append((content, reward))
scored.sort(key=reward, reverse=True)  # → Personalized learning path
```

#### RL Hyperparameters
```yaml
learning_rate: 0.001
gamma: 0.99          # Discount factor (values future rewards)
exploration_rate: 0.1 # ε-greedy: 10% random exploration
hidden_size: 128
```

---

### 5.5 Engagement Predictor (3-Layer MLP)

**File:** `backend/adaptiq/models/engagement_predictor.py`
**Purpose:** Predict the probability that a student will engage with a specific piece of content BEFORE showing it to them.

#### Architecture
```
Input: 6 features (3 student + 3 content)
  ↓
Linear(6 → 64) + ReLU + Dropout(0.2)
  ↓
Linear(64 → 32) + ReLU + Dropout(0.1)
  ↓
Linear(32 → 1) + Sigmoid
  ↓
Output: Engagement probability [0.0 – 1.0]
```

#### Input Features
```python
student_features = [
    total_points / 1000,          # Normalized achievement level
    streak_days / 30,             # Normalized consistency
    avg_mastery_score             # Average knowledge across all concepts
]

content_features = [
    difficulty_score,             # Content difficulty (0.0–1.0)
    duration_seconds / 1000,      # Normalized duration
    1.0                           # Bias term
]
```

#### Use Case
The engagement score is exposed via `GET /api/engagement-prediction/{student_id}/{content_id}` and can be used to:
- Pre-filter content that a student is unlikely to engage with
- Prioritize high-engagement content in recommendations
- Alert educators when a student's predicted engagement drops

---

### 5.6 Quiz Generator (Adaptive + Google Gemini)

**Files:** `assessment/quiz_generator.py` + `services/openai_service.py`
**Purpose:** Generate personalized quiz questions that target a student's weakest concepts, adapted to their learning style.

#### Two-Layer Architecture

**Layer 1: Google Gemini (Primary)**
```python
prompt = f"""
Generate {n_questions} MCQ questions about: {course_title}
Concepts to cover: {weak_concepts}  ← sorted by knowledge gap
Difficulty: {easy|medium|hard}       ← based on completion %
Style hint: {visual|auditory|kinesthetic|reading_writing}

Return JSON array with: question, options[4], correct_answer (A/B/C/D),
explanation, concepts[], difficulty
"""
```

**Layer 2: ML-Based Fallback (when Gemini unavailable)**
```python
# Concept weighting: focus on what the student doesn't know
concept_weight = 1.0 - student_mastery[concept]
# → Concept with 0% mastery gets weight 1.0 (most questions)
# → Concept with 80% mastery gets weight 0.2 (fewer questions)

# Style-based question selection
style_preferences = {
    'visual':          ['diagram', 'image_based'],
    'auditory':        ['audio_question', 'listening'],
    'kinesthetic':     ['interactive', 'simulation'],
    'reading_writing': ['text', 'multiple_choice']
}
```

#### Adaptive Difficulty Scaling
```
Completion 0–40%   → difficulty = 'easy'
Completion 40–75%  → difficulty = 'medium'
Completion 75–100% → difficulty = 'hard'

Milestone questions:
  25% checkpoint → 3 questions
  50% checkpoint → 5 questions
  75% checkpoint → 6 questions
  100% checkpoint → 8 questions
```

#### Quiz Evaluation
```python
# Per-concept scoring
concept_score = correct_answers_for_concept / total_questions_for_concept

# Weak concept identification
weak_concepts = [c for c, score in concept_scores.items() if score < 0.6]

# After quiz: knowledge state updated for weak concepts
# After quiz: AI recommends follow-up content targeting weak concepts
```

---

### 5.7 Progress Tracker

**File:** `backend/adaptiq/assessment/progress_tracker.py`
**Purpose:** Aggregate all learning activity into actionable insights and metrics.

#### Metrics Computed
```python
# Learning Velocity: how fast is the student covering new concepts?
velocity = concepts_covered / (total_hours_in_last_30_days)
# Unit: concepts per hour

# Assessment Trend: is performance improving?
trend = (latest_score - oldest_score) / num_assessments
# Positive = improving, Negative = declining

# Recent Engagement (7-day window)
engagement = mean(session.engagement_level for session in last_7_days)

# Knowledge Gaps: concepts that appeared as weak in assessments
gaps = union(assessment.weak_concepts for all assessments)
```

#### Output Structure
```json
{
  "total_sessions": 24,
  "total_learning_hours": 8.5,
  "average_performance": 0.73,
  "learning_velocity": 2.4,
  "assessment_trend": 0.05,
  "recent_engagement": 0.68,
  "knowledge_gaps": ["recursion", "dynamic_programming"],
  "time_per_concept": [{"label": "python_basics", "value": 45.2}],
  "engagement_heatmap": [{"date": "2025-05-20", "value": 0.72}]
}
```

---

---

## 6. COMPLETE DATA FLOW

### Flow 1: Student Completes a Lesson
```
Student clicks "Mark Complete"
    │
    ▼
POST /student/content/{id}/complete
    │
    ├─► Record LearningSession (ended_at, engagement_score, completed=True)
    │
    ├─► For each concept_tag on the content:
    │       MLService.update_knowledge_state(student_id, concept, engagement_score)
    │           │
    │           ├─► StudentModel.update_student_profile()
    │           │       new_k = k + perf×lr×(1-k) - forgetting×k
    │           │
    │           └─► Upsert KnowledgeState row in PostgreSQL
    │
    ├─► Recalculate enrollment.completion_percentage
    │       = (completed_lessons / total_lessons) × 100
    │
    ├─► Award badges if milestones hit (+10 points, streak update)
    │
    └─► MLService.get_recommendations() → next content suggestion
            │
            ├─► ContentRecommender scores all course content
            ├─► Weights: relevance(50%) + style(30%) + difficulty(10%) + duration(10%)
            └─► Returns top-5 personalized recommendations
```

### Flow 2: Student Views Dashboard
```
GET /student/dashboard
    │
    ├─► Load KnowledgeState from DB → knowledge_gaps dict
    │
    ├─► MLService.get_recommendations()
    │       → ContentRecommender → top-5 content items
    │
    ├─► MLService.generate_learning_path()
    │       → LearningOptimizer.calculate_learning_reward() for each content
    │       → Sort by reward score (descending)
    │       → Returns AI-ordered content sequence
    │
    └─► Return: learning_path, recommendations, knowledge_state,
                streak, points, badges, courses, recent_sessions
```

### Flow 3: Student Takes a Quiz
```
GET /student/quiz/{course_id}?milestone=50
    │
    ├─► Check enrollment + completion ≥ 25%
    │
    ├─► Gather all concept_tags from course content
    │
    ├─► Sort concepts by knowledge gap (weakest first)
    │
    ├─► Determine difficulty from completion %
    │
    ├─► Google Gemini generates questions
    │       (fallback: ML-based template questions)
    │
    └─► Save Assessment record, return questions

POST /student/quiz/{course_id}/submit
    │
    ├─► QuizGenerator.evaluate_quiz_performance()
    │       → per-concept scores, weak_concepts (score < 0.6)
    │
    ├─► For each weak concept:
    │       MLService.update_knowledge_state() → lower mastery
    │
    ├─► Award +50 points if score ≥ 70%
    │
    └─► MLService.get_recommendations(target=weak_concepts)
            → Follow-up content targeting gaps
```

### Flow 4: Educator Uploads Content
```
POST /educator/courses/{id}/content/upload
    │
    ├─► If PDF/text file:
    │       Extract text → MLService.extract_concepts_from_text()
    │           → TF-IDF vectorizer → top-8 concept keywords
    │
    ├─► If no file: TF-IDF on title + description + URL
    │
    ├─► Merge auto-extracted tags with manually entered tags
    │
    └─► Save Content with concept_tags (JSON)
        → These tags drive ALL ML recommendations for this content
```

### Flow 5: ML Service Bridge (How Python Modules Are Loaded)
```python
# MLService uses importlib to dynamically load the AdaptIq-ai package
# This avoids namespace collisions with Flask's own modules

def _import_ml_module(self, module_name):
    # 1. Remove any conflicting modules from sys.modules
    # 2. Import from the ML package path
    # 3. Restore original modules
    return importlib.import_module(module_name)

# Called once at app startup:
app.extensions['ml_service'] = MLService(app.config['ML_PATH'])

# Accessed in every blueprint:
ml_service = current_app.extensions['ml_service']
```

---

## 7. API REFERENCE

### Authentication (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account (student/educator) |
| POST | `/auth/login` | Get JWT token + user data |
| POST | `/auth/logout` | Stateless logout |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update name/email/learning_style |

### Student (`/student`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/student/dashboard` | Full dashboard data with AI recommendations |
| GET | `/student/courses` | All published courses with enrollment status |
| POST | `/student/courses/{id}/enroll` | Self-enroll in a course |
| GET | `/student/courses/{id}` | Course detail with AI-ordered content |
| POST | `/student/content/{id}/start` | Begin a learning session |
| POST | `/student/content/{id}/complete` | Complete session + update knowledge |
| GET | `/student/content/{id}` | Content detail with recommendations |
| GET | `/student/quiz/{course_id}` | Generate adaptive quiz |
| POST | `/student/quiz/{course_id}/submit` | Submit answers + get results |
| GET | `/student/progress` | Full progress analytics |
| GET | `/student/notifications` | Unread badge notifications |

### Educator (`/educator`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/educator/dashboard` | Stats + course list + assessments |
| POST | `/educator/courses` | Create new course |
| PUT | `/educator/courses/{id}` | Update course metadata |
| PATCH | `/educator/courses/{id}/publish` | Toggle publish status |
| GET | `/educator/courses/{id}/content` | List all content items |
| POST | `/educator/courses/{id}/content/upload` | Upload content + auto-tag |
| DELETE | `/educator/content/{id}` | Remove content item |
| GET | `/educator/courses/{id}/students` | Enrolled students + knowledge |
| GET | `/educator/students/{id}/analytics` | Per-student deep analytics |
| GET | `/educator/assessments` | All quiz results for educator's courses |

### Admin (`/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Platform-wide stats |
| GET | `/admin/users` | All users with optional role filter |
| PATCH | `/admin/users/{id}/deactivate` | Toggle user active status |
| PATCH | `/admin/users/{id}/role` | Change user role |
| GET | `/admin/courses` | All courses with metrics |
| POST | `/admin/assignments` | Assign course to student(s) |
| GET | `/admin/analytics` | 90-day platform analytics |

### ML Direct (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/recommend` | Get content recommendations |
| POST | `/api/learning-path` | Get RL-ordered learning path |
| GET | `/api/knowledge-state/{student_id}` | All concept mastery scores |
| POST | `/api/update-knowledge` | Manually update concept mastery |
| GET | `/api/engagement-prediction/{student_id}/{content_id}` | Predict engagement |
| POST | `/api/quiz/generate` | Generate quiz via ML |
| GET | `/api/progress/{student_id}` | Progress metrics |

---

## 8. PLATFORM FEATURES

### 8.1 Student Experience

#### Dashboard
- **AI Learning Path** — RL-ordered list of content items personalized per student
- **Knowledge Mastery Radar** — Spider chart showing mastery % across all concepts
- **Streak & Points** — Daily login streak, total XP points
- **Enrolled Courses** — Progress bars per course
- **Achievement Badges** — 6 badge types with unlock status
- **Recent Activity** — Last 5 sessions with engagement scores

#### Course Browser
- Search by title/description
- Filter by subject and enrollment status
- Course cards with thumbnail, difficulty badge, learner count, progress bar
- One-click enroll or continue learning

#### Content Viewer
- **Video** — YouTube embed (auto-detected from URL) or direct MP4/WebM
- **PDF** — Inline iframe viewer
- **Audio** — HTML5 audio player
- **Text** — Rendered lesson content
- **Interactive** — Sandboxed iframe
- Session tracking (start/end timestamps)
- Engagement score calculated from time spent
- "Mark Complete" triggers knowledge update + next recommendation

#### Adaptive Quiz
- AI-generated questions via Google Gemini (fallback: ML templates)
- Per-question answer reveal with explanation
- Progress bar across questions
- Results screen: score, concept breakdown, weak areas, follow-up recommendations
- Milestone checkpoints: 25% / 50% / 75% / 100% completion

#### Progress Analytics
- Learning velocity (concepts/hour)
- Engagement area chart over time
- Time per concept horizontal bar chart
- Knowledge gap list

### 8.2 Educator Experience

#### Dashboard
- Total students, courses, avg engagement, content items
- Daily active students area chart (7-day)
- Course management cards with publish toggle
- Recent assessment results

#### Course Builder
- Title, description, subject, difficulty level
- Thumbnail URL with live preview
- Save → redirect to content management

#### Content Management
- Upload: video, PDF, audio, text, interactive
- YouTube URL auto-detection
- Auto concept tag extraction via TF-IDF on upload
- Manual tag management
- Difficulty slider (Easy / Medium / Hard)
- Duration input

#### Student Analytics
- Per-student mastery radar chart
- Engagement trend line chart
- Session history table
- Concept mastery breakdown with progress bars

### 8.3 Admin Experience

#### Platform Dashboard
- 6 KPI cards: users, courses, sessions today, avg mastery, enrollments, avg completion
- Role distribution bar chart

#### User Management
- Full user table with search and role filter
- Inline role change (student/educator/admin)
- Activate/deactivate toggle
- Assign course to student via modal

#### Platform Analytics (90-day window)
- Daily active users area chart
- Content usage by subject bar chart
- Average mastery growth line chart
- Course completion rates horizontal bar chart
- Quiz performance by course horizontal bar chart

---

## 9. GAMIFICATION SYSTEM

### Points System
| Action | Points Awarded |
|---|---|
| Daily login | +5 XP |
| Complete a lesson | +10 XP |
| Maintain streak (24h window) | +5 XP bonus |
| Pass a quiz (score ≥ 70%) | +50 XP |

### Streak System
```python
# On login and lesson completion:
if last_active within 24 hours:
    streak_days += 1
else:
    streak_days = 1  # Reset streak
```

### Badge System
| Badge Key | Name | Trigger |
|---|---|---|
| `first_login` | First Steps 🎯 | First ever login |
| `streak_5` | On Fire 🔥 | 5-day streak |
| `streak_30` | Unstoppable ⚡ | 30-day streak |
| `quiz_master` | Quiz Master 🏆 | Pass 5 quizzes |
| `course_complete` | Graduate 🎓 | Complete first course |
| `top_learner` | Top Learner 🌟 | Earn 500+ points |

### Milestone Quizzes
Quizzes unlock progressively as students complete course content:
- **25% complete** → 3-question checkpoint quiz
- **50% complete** → 5-question checkpoint quiz
- **75% complete** → 6-question checkpoint quiz
- **100% complete** → 8-question final quiz

---

## 10. CONFIGURATION & HYPERPARAMETERS

### `backend/adaptiq/configs/default.yaml`

```yaml
# Knowledge Tracing (LSTM)
knowledge_tracing:
  sequence_length: 10      # How many past interactions to consider
  hidden_size: 128         # LSTM hidden state dimension
  learning_rate: 0.001     # Gradient descent step size
  forgetting_rate: 0.05    # Ebbinghaus forgetting simulation
  knowledge_decay: 0.02    # Passive decay rate

# Content Recommendation (Weighted Scoring)
content_recommendation:
  relevance_weight: 0.5    # Knowledge gap alignment
  style_match_weight: 0.3  # Learning style preference
  difficulty_weight: 0.1   # Difficulty appropriateness
  engagement_weight: 0.1   # Duration/pace match

# Reinforcement Learning (Actor-Critic)
reinforcement_learning:
  learning_rate: 0.001
  gamma: 0.99              # Future reward discount
  exploration_rate: 0.1    # ε-greedy exploration
  hidden_size: 128
  reward_weights:
    knowledge_gain: 0.5
    engagement: 0.2
    efficiency: 0.2
    completion: 0.1

# Assessment
assessment:
  adaptive_difficulty: true
  mastery_threshold: 0.8   # Score needed to consider concept "mastered"
  difficulty_scaling: 0.1

# Progress Tracking
progress_tracking:
  retention_period: 90     # Days of history to keep
  velocity_window: 30      # Days for velocity calculation
  engagement_window: 7     # Days for recent engagement
```

### Environment Variables (`.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/adaptiq_db
JWT_SECRET_KEY=<secret>
GEMINI_API_KEY=<Gemini-key>
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=104857600   # 100MB
CORS_ORIGINS=http://localhost:5173
```

---

## 11. KEY METRICS & PERFORMANCE

### ML Model Characteristics
| Model | Type | Input | Output | Latency |
|---|---|---|---|---|
| KnowledgeTracer | LSTM (PyTorch) | Concept+performance sequence | Mastery per concept [0,1] | ~2ms |
| StudentModel | Bayesian update | Single interaction | Updated knowledge vector | <1ms |
| ContentRecommender | TF-IDF + scoring | Student profile + content list | Ranked content list | ~5ms |
| LearningOptimizer | Actor-Critic RL | Student profile + content | Reward-sorted path | ~3ms |
| EngagementPredictor | 3-layer MLP | 6 features | Engagement score [0,1] | <1ms |
| QuizGenerator (Gemini) | LLM (Gemini-3.5) | Topic + concepts | MCQ questions | ~2-4s |
| QuizGenerator (ML) | Template-based | Concepts + knowledge | MCQ questions | <1ms |

### Recommendation Pipeline Latency
```
Total recommendation call: ~8-15ms
  ├── Content normalization:     ~1ms
  ├── TF-IDF vectorization:      ~3ms
  ├── Scoring all content:       ~2ms
  └── Sorting + returning top-5: ~1ms
```

### Scalability Notes
- ML models are loaded **once at startup** and reused across all requests (singleton pattern)
- Knowledge states are persisted to PostgreSQL — ML in-memory state is a cache
- On server restart, in-memory ML state rebuilds from DB on first request per student
- The RL agent runs in inference-only mode during live requests (no online training)

---

## 12. PPT SLIDE OUTLINE

### Slide 1 — Title
**AdaptIq: Intelligent Adaptive Learning Platform**
*Personalized Education Powered by Machine Learning*

### Slide 2 — Problem Statement
- One-size-fits-all education fails 60% of learners
- Students waste time on content they already know
- Educators have no visibility into individual knowledge gaps
- Traditional quizzes don't adapt to what students actually need

### Slide 3 — Our Solution
- AI that knows exactly what each student knows and doesn't know
- Content ordered by an RL agent to maximize learning efficiency
- Quizzes generated by Gemini-3.5 targeting each student's weak spots
- Real-time knowledge state tracking per concept

### Slide 4 — System Architecture
*(Use the ASCII architecture diagram from Section 2)*
- React Frontend → Flask REST API → ML Package + PostgreSQL
- 5 blueprints, 7 ML models, 1 Gemini integration

### Slide 5 — The 5 ML Models
1. **LSTM Knowledge Tracer** — Tracks mastery over time
2. **Bayesian Student Model** — Updates knowledge in real-time
3. **TF-IDF Content Recommender** — Finds the right content
4. **Actor-Critic RL Optimizer** — Orders content optimally
5. **MLP Engagement Predictor** — Predicts student engagement

### Slide 6 — Knowledge Tracing Deep Dive
*(LSTM architecture diagram)*
- Input: sequence of (concept, performance) pairs
- LSTM captures temporal learning patterns
- Output: mastery probability per concept [0–1]
- Inspired by Deep Knowledge Tracing (Piech et al., 2015)

### Slide 7 — Bayesian Knowledge Update
*(Formula visualization)*
```
new_k = k + performance × lr × (1-k) - forgetting × k
```
- Diminishing returns: harder to improve at high mastery
- Forgetting curve: knowledge decays without practice
- Real-time: updates on every lesson completion

### Slide 8 — Content Recommendation Engine
*(Pie chart of weights)*
- 50% Relevance to knowledge gaps
- 30% Learning style match
- 10% Difficulty appropriateness
- 10% Duration/pace match
- Result: Top-5 personalized content items

### Slide 9 — Reinforcement Learning Path Optimizer
*(Actor-Critic diagram)*
- State: student profile (mastery, style, engagement, pace)
- Action: which content to show next
- Reward: knowledge gain + engagement + efficiency + style + difficulty
- Algorithm: Advantage Actor-Critic (A2C)

### Slide 10 — AI Quiz Generation
*(Two-layer diagram)*
- Primary: Google Gemini with adaptive prompting
- Fallback: ML-based concept-weighted question selection
- Adapts difficulty to course completion percentage
- Targets weakest concepts first

### Slide 11 — Student Journey
*(Flow diagram)*
Enroll → Watch Video → Mark Complete → Knowledge Updated →
AI Recommends Next → Take Quiz → Weak Concepts Identified →
Targeted Content Suggested → Repeat

### Slide 12 — Platform Features
- 3 user roles: Student, Educator, Admin
- Full course management with chapter/lesson structure
- Video (YouTube + direct), PDF, Audio, Text, Interactive content
- Gamification: XP points, streaks, 6 badge types
- Milestone quizzes at 25/50/75/100% completion
- Real-time analytics dashboards for all roles

### Slide 13 — Tech Stack
*(Logo grid)*
- Backend: Python, Flask, PostgreSQL, PyTorch, scikit-learn
- Frontend: React 18, Vite, Tailwind CSS, Recharts
- AI: Google Gemini
- Auth: JWT (stateless)
- Deployment: Any WSGI server + PostgreSQL

### Slide 14 — Demo Credentials
| Role | Email | Password |
|---|---|---|
| Student | student1@adaptiq.com | student123 |
| Educator | educator1@adaptiq.com | educator123 |
| Admin | admin@adaptiq.com | admin123 |

### Slide 15 — Key Differentiators
1. **Real ML** — Not rule-based, actual PyTorch neural networks
2. **Gemini-powered quizzes** — Dynamic, not template-based
3. **Per-concept tracking** — Granular mastery, not just course %
4. **RL-ordered paths** — Mathematically optimal content sequencing
5. **Full-stack** — Production-ready, not a prototype

---

## APPENDIX: FILE STRUCTURE

```
adaptiq/
├── backend/
│   ├── app.py                    # Flask app factory
│   ├── config.py                 # Environment configs
│   ├── extensions.py             # db, migrate, jwt singletons
│   ├── blueprints/
│   │   ├── auth.py               # /auth routes
│   │   ├── student.py            # /student routes
│   │   ├── educator.py           # /educator routes
│   │   ├── admin.py              # /admin routes
│   │   └── api.py                # /api ML routes
│   ├── models/
│   │   └── db_models.py          # SQLAlchemy models (10 tables)
│   ├── services/
│   │   ├── ml_service.py         # ML integration bridge
│   │   └── openai_service.py     # Gemini quiz generation
│   ├── utils/
│   │   ├── badges.py             # Badge award logic
│   │   ├── decorators.py         # @role_required
│   │   ├── helpers.py            # Response helpers
│   │   └── file_handler.py       # Upload handling
│   ├── migrations/               # Alembic DB migrations
│   └── adaptiq/              # ML package
│       ├── core/
│       │   ├── student_model.py       # Bayesian KT + StudentModel
│       │   ├── content_recommender.py # TF-IDF recommender
│       │   └── learning_optimizer.py  # RL optimizer + A2C agent
│       ├── models/
│       │   ├── knowledge_tracer.py    # LSTM KT model
│       │   ├── rl_agent.py            # Actor-Critic PyTorch
│       │   └── engagement_predictor.py # MLP predictor
│       ├── assessment/
│       │   ├── quiz_generator.py      # Adaptive quiz logic
│       │   └── progress_tracker.py   # Progress metrics
│       └── configs/
│           └── default.yaml           # All hyperparameters
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Design system + CSS vars
│   │   ├── api/                  # Axios API modules
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Navbar, Layout
│   │   │   └── ui/               # Button, Card, Badge, Modal...
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── hooks/                # useAuth, useFetch, useToast
│   │   └── pages/
│   │       ├── Landing.jsx       # Marketing landing page
│   │       ├── auth/             # Login, Register
│   │       ├── student/          # Dashboard, Courses, Quiz, Progress
│   │       ├── educator/         # Dashboard, CourseForm, ContentList
│   │       └── admin/            # Dashboard, Users, Analytics
│   └── tailwind.config.js
│
├── PROJECT_DOCUMENTATION.md      # This file
└── README.md                     # Quick start guide
```

---

*AdaptIq — Built for the Hackathon 2025*
*Stack: React 18 + Flask 3 + PostgreSQL + PyTorch + Google Gemini*



