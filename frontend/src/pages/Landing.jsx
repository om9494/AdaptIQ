import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiTrendingUp, FiZap } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const benefits = [
  'Guided lesson paths that keep learning organized.',
  'Checkpoint quizzes placed at meaningful milestones.',
  'Progress summaries that make next steps easy to understand.',
]

const quickPoints = [
  {
    icon: FiBookOpen,
    title: 'Structured learning',
    text: 'Courses are arranged as clear lesson paths instead of disconnected content.',
  },
  {
    icon: FiTrendingUp,
    title: 'Visible progress',
    text: 'Students can quickly see what is complete and what needs attention next.',
  },
  {
    icon: FiZap,
    title: 'Focused experience',
    text: 'The interface stays simple, calm, and centered on learning.',
  },
]

const Landing = () => (
  <div className="page-atmosphere min-h-screen px-4 py-4 sm:px-6 lg:px-8">
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6">
      <header className="glass-panel animate-in px-6 py-4 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="theme-orb hero-gradient text-white">
              <FiZap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">EduAdapt AI</p>
              <p className="text-sm text-slate-500">Adaptive learning platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-2 font-semibold">
              Sign In
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="grid flex-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <section className="landing-hero animate-in p-5 sm:p-7 lg:p-8">
          <div className="landing-copy-panel relative z-10 max-w-2xl">
            <span className="landing-eyebrow inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em]">
              Adaptive learning, simplified
            </span>

            <h1 className="landing-headline mt-5 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Personalized learning with a cleaner student experience.
            </h1>

            <p className="landing-subcopy mt-4 max-w-xl text-base leading-8 sm:text-lg">
              Move through structured lessons, milestone quizzes, and practical progress guidance in one focused platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="px-6 py-3">
                  Start Learning
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="px-6 py-3 bg-white/90">
                  Open Platform
                </Button>
              </Link>
            </div>

            <div className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="landing-inline-benefit">
                  <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                  <p className="landing-benefit-text text-sm font-medium leading-6">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <Card className="course-shell animate-slide-in-right p-6 sm:p-7">
            <p className="section-kicker">Why it works</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Clear value, without extra noise.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              EduAdapt AI is designed to help students stay oriented, practice at the right time, and understand their progress without overloaded dashboards.
            </p>
          </Card>

          {quickPoints.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="landing-benefit animate-slide-in-right p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </main>
    </div>
  </div>
)

export default Landing
