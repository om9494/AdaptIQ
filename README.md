# AdaptIq

> **Adaptive Learning Platform** — Personalized education powered by PyTorch, Reinforcement Learning, and Google Gemini

[![Stack](https://img.shields.io/badge/Backend-Flask%203%20%2B%20PostgreSQL-blue)]()
[![Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)]()
[![ML](https://img.shields.io/badge/ML-PyTorch%20%2B%20scikit--learn-orange)]()
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-green)]()

---

## What is AdaptIq?

AdaptIq is a full-stack EdTech platform that uses **5 machine learning models** working together to deliver a truly personalized learning experience:

| ML Model | What it does |
|---|---|
| **LSTM Knowledge Tracer** | Tracks how much a student knows about each concept over time |
| **Bayesian Student Model** | Updates knowledge state in real-time after every lesson |
| **TF-IDF Content Recommender** | Finds the most relevant content for each student's gaps |
| **Actor-Critic RL Optimizer** | Orders content to maximize learning efficiency |
| **MLP Engagement Predictor** | Predicts whether a student will engage with content |

Quizzes are generated dynamically by **Google Gemini**, targeting each student's weakest concepts with adaptive difficulty.

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup Backend

```bash
cd backend
pip install flask flask-sqlalchemy flask-migrate flask-jwt-extended flask-cors
pip install python-dotenv psycopg2-binary PyPDF2 pydantic numpy pandas scikit-learn torch google-genai
```

Create `.env` (copy from `.env.example`):
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/adaptiq_db
JWT_SECRET_KEY=your-jwt-secret
GEMINI_API_KEY=your-Gemini-key
UPLOAD_FOLDER=./uploads
CORS_ORIGINS=http://localhost:5173
```

Run migrations and start:
```bash
flask db upgrade
python bootstrap_demo_platform.py   # Seeds demo courses + users
python -m flask run --port=5000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**
Backend runs at **http://localhost:5000**

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| 👨‍🎓 Student | `student1@adaptiq.com` | `student123` |
| 👩‍🏫 Educator | `educator1@adaptiq.com` | `educator123` |
| 🔧 Admin | `admin@adaptiq.com` | `admin123` |

---

## Platform Overview

### Student Features
- **AI Learning Path** — RL-ordered content personalized to your knowledge state
- **Knowledge Mastery Radar** — Visual spider chart of concept mastery
- **Adaptive Quizzes** — LLM-generated questions targeting your weak spots
- **Progress Analytics** — Learning velocity, engagement heatmap, time per concept
- **Gamification** — XP points, daily streaks, 6 achievement badges
- **Milestone Checkpoints** — Quizzes unlock at 25%, 50%, 75%, 100% completion

### Educator Features
- **Course Builder** — Create courses with title, description, subject, difficulty
- **Content Upload** — Video (YouTube/direct), PDF, Audio, Text, Interactive
- **Auto Concept Tagging** — TF-IDF extracts concept tags from uploaded content
- **Student Analytics** — Per-student mastery radar + engagement trend
- **Assessment Dashboard** — All quiz results with pass/fail rates

### Admin Features
- **Platform Analytics** — 90-day DAU, content usage, mastery growth, quiz performance
- **User Management** — Role changes, activate/deactivate, course assignment
- **Course Overview** — All courses with completion rates and student counts

---

## Architecture

```
React Frontend (Vite + Tailwind)
        ↓ JWT-authenticated REST
Flask Backend (5 blueprints)
        ↓ importlib bridge
AdaptIq ML Package (PyTorch)
        ↓
PostgreSQL (10 tables)
```

**Full documentation:** See [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)

---

## ML Pipeline (How It Works)

```
Student completes lesson
    → Bayesian knowledge update (per concept)
    → Knowledge state saved to DB
    → Content Recommender scores all content
    → RL Optimizer orders by reward
    → Top-5 recommendations returned

Student takes quiz
    → Gemini-3.5 generates questions (weak concepts first)
    → Adaptive difficulty (based on completion %)
    → Results update knowledge state
    → Follow-up content recommended
```

---

## Project Structure

```
adaptiq/
├── backend/
│   ├── app.py                 # Flask factory
│   ├── blueprints/            # auth, student, educator, admin, api
│   ├── models/db_models.py    # 10 SQLAlchemy tables
│   ├── services/
│   │   ├── ml_service.py      # ML integration bridge
│   │   └── openai_service.py  # Gemini quiz generation
│   └── adaptiq/           # ML package
│       ├── core/              # StudentModel, ContentRecommender, LearningOptimizer
│       ├── models/            # KnowledgeTracer (LSTM), RLAgent, EngagementPredictor
│       └── assessment/        # QuizGenerator, ProgressTracker
│
├── frontend/
│   └── src/
│       ├── pages/             # Landing, auth, student, educator, admin
│       ├── components/        # Layout, UI components, charts
│       └── api/               # Axios modules per role
│
├── PROJECT_DOCUMENTATION.md   # Complete technical documentation + PPT outline
└── README.md                  # This file
```

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Flask over Django | Lightweight, better for ML service integration |
| PostgreSQL JSON columns | Flexible storage for concept_tags, questions, badges |
| importlib for ML loading | Avoids namespace collisions between Flask and ML modules |
| pbkdf2:sha256 hashing | scrypt unsupported on Windows Python 3.13 |
| Gemini + ML fallback | Resilient quiz generation even without API key |
| JWT stateless auth | Scales horizontally without session storage |

---

*Built for Hackathon 2025 — AdaptIq Team*



