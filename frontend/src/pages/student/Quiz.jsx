import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiRefreshCw,
  FiX,
  FiZap
} from 'react-icons/fi'
import { getQuiz, submitQuiz } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { useToast } from '../../hooks/useToast.jsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const providerDisplayName = (provider) => {
  if (provider === 'gemini') return 'Gemini'
  if (provider === 'openai') return 'OpenAI'
  return 'Adaptive'
}

const QuizQuestion = ({ question, index, total, selected, onSelect, showResult }) => {
  const correct = question.correct_answer

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-500">Question {index + 1} of {total}</span>
        <div className="flex-1">
          <ProgressBar value={((index + 1) / total) * 100} />
        </div>
        <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
          {Math.round(((index + 1) / total) * 100)}%
        </span>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-teal-50 to-sky-50 p-6 dark:border-slate-700 dark:from-teal-950/30 dark:to-sky-950/20">
        <Badge variant="brand" className="mb-3 capitalize">{question.difficulty || 'medium'}</Badge>
        <h2 className="text-xl font-bold leading-relaxed text-slate-900 dark:text-white">{question.question}</h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, optionIndex) => {
          const label = OPTION_LABELS[optionIndex]
          const isSelected = selected === label
          const isCorrect = showResult && label === correct
          const isWrong = showResult && isSelected && label !== correct

          let cls = 'quiz-option'
          if (isCorrect) cls = 'quiz-option quiz-option-correct'
          else if (isWrong) cls = 'quiz-option quiz-option-wrong'
          else if (isSelected && !showResult) cls = 'quiz-option quiz-option-selected'

          return (
            <button
              key={label}
              type="button"
              className={cls}
              onClick={() => !showResult && onSelect(label)}
              disabled={showResult}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCorrect ? 'bg-green-500 text-white' :
                    isWrong ? 'bg-red-400 text-white' :
                    isSelected ? 'bg-teal-600 text-white' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {showResult && isCorrect ? <FiCheck size={12} /> : showResult && isWrong ? <FiX size={12} /> : label}
                </span>
                <span>{option}</span>
              </div>
            </button>
          )
        })}
      </div>

      {showResult && question.explanation && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
          <p className="mb-1 text-sm font-semibold text-sky-700 dark:text-sky-300">Explanation</p>
          <p className="text-sm text-sky-700/90 dark:text-sky-200/80">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

const QuizResults = ({ result, courseId, onRetry, quizMeta }) => {
  const navigate = useNavigate()
  const score = Math.round(result.score * 100)
  const passed = score >= 70

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in">
      <Card className={`p-8 text-center ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10' : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10'}`}>
        <div className="mb-4 flex justify-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            <FiAward size={34} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {passed ? 'Checkpoint cleared' : 'Keep building confidence'}
        </h2>
        <div className="mt-4 text-6xl font-extrabold" style={{ color: passed ? '#16a34a' : '#f59e0b' }}>
          {score}%
        </div>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {passed ? '+50 points added to your progress.' : 'Review the weak concepts below, then retry for a stronger pass.'}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Badge variant={quizMeta?.llmEnabled ? 'brand' : 'warning'}>
            <FiZap size={10} /> {quizMeta?.label || 'Adaptive quiz'}
          </Badge>
        </div>
      </Card>

      {Object.keys(result.concept_scores || {}).length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-4">Concept breakdown</h3>
          <div className="space-y-3">
            {Object.entries(result.concept_scores).map(([concept, value]) => (
              <div key={concept}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{concept.replace(/_/g, ' ')}</span>
                  <span className={`font-bold ${value >= 0.7 ? 'text-green-600' : 'text-amber-600'}`}>{Math.round(value * 100)}%</span>
                </div>
                <ProgressBar value={value * 100} color={value >= 0.7 ? 'success' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.weak_concepts?.length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-3">Areas to improve</h3>
          <div className="flex flex-wrap gap-2">
            {result.weak_concepts.map((concept) => (
              <Badge key={concept} variant="warning">{concept.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
        </Card>
      )}

      {result.recommended_followups?.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="section-title">Recommended review</h3>
            <Badge variant="brand"><FiZap size={10} /> Personalized</Badge>
          </div>
          <div className="space-y-3">
            {result.recommended_followups.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[22px] bg-slate-50 p-3 dark:bg-slate-800/65">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{(item.concepts || item.concept_tags || []).slice(0, 3).join(', ')}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/student/content/${item.id}`)}>
                  Review <FiArrowRight size={12} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={() => navigate(`/student/courses/${courseId}`)} variant="secondary" className="flex-1">
          <FiBookOpen size={16} /> Back to Course
        </Button>
        <Button onClick={onRetry} className="flex-1">
          <FiRefreshCw size={16} /> Retake Quiz
        </Button>
      </div>
    </div>
  )
}

const Quiz = () => {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const milestone = searchParams.get('milestone')
  const toast = useToast()
  const [questions, setQuestions] = useState([])
  const [assessmentId, setAssessmentId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizMeta, setQuizMeta] = useState({
    label: 'Adaptive quiz',
    detail: 'Adaptive fallback generator',
    llmEnabled: false
  })

  const loadQuiz = async () => {
    setLoading(true)
    setResult(null)
    setAnswers([])
    setCurrentIndex(0)
    setShowResult(false)
    try {
      const res = await getQuiz(courseId, milestone)
      const payload = res.data.data
      const llmEnabled = Boolean(payload.llm_enabled)
      const providerName = providerDisplayName(payload.quiz_provider)
      setQuestions(payload.questions)
      setAssessmentId(payload.assessment_id)
      setQuizMeta({
        label: llmEnabled ? `${providerName} quiz` : 'Adaptive fallback quiz',
        detail: llmEnabled ? `${providerName} · ${payload.quiz_model}` : payload.quiz_reason || 'LLM unavailable',
        llmEnabled
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuiz()
  }, [courseId, milestone])

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  const progressLabel = useMemo(() => {
    if (!quizMeta.llmEnabled) return 'This quiz is using the built-in adaptive fallback because the live LLM provider is unavailable.'
    return `This quiz was generated through ${quizMeta.detail}.`
  }, [quizMeta])

  const handleSelect = (label) => {
    const nextAnswers = [...answers]
    nextAnswers[currentIndex] = label
    setAnswers(nextAnswers)
  }

  const handleNext = async () => {
    if (!answers[currentIndex]) {
      toast.warning('Please select an answer')
      return
    }

    if (!showResult) {
      setShowResult(true)
      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1)
      setShowResult(false)
      return
    }

    setSubmitting(true)
    try {
      const res = await submitQuiz(courseId, { answers, assessment_id: assessmentId })
      setResult(res.data.data)
      toast.success('Quiz submitted!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageSpinner />

  if (result) return <QuizResults result={result} courseId={courseId} onRetry={loadQuiz} quizMeta={quizMeta} />

  if (questions.length === 0) {
    return (
      <Card className="mx-auto max-w-md p-12 text-center">
        <FiBookOpen className="mx-auto mb-3 text-slate-300" size={40} />
        <p className="text-slate-500">No quiz questions are available yet.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
      </Card>
    )
  }

  return (
    <div className="page-atmosphere mx-auto max-w-3xl space-y-6 animate-in">
      <section className="glass-panel relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="floating-accent right-8 top-8 h-16 w-16 bg-teal-300/20" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">Checkpoint Assessment</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
              {milestone ? `${milestone}% checkpoint quiz` : 'Course quiz'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {progressLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={quizMeta.llmEnabled ? 'brand' : 'warning'}>
              <FiZap size={10} /> {quizMeta.label}
            </Badge>
            <Badge variant="slate">{quizMeta.detail}</Badge>
          </div>
        </div>
      </section>

      <QuizQuestion
        question={current}
        index={currentIndex}
        total={questions.length}
        selected={answers[currentIndex]}
        onSelect={handleSelect}
        showResult={showResult}
      />

      <div className="flex gap-3">
        {currentIndex > 0 && !showResult && (
          <Button variant="secondary" onClick={() => { setCurrentIndex((value) => value - 1); setShowResult(false) }}>
            Previous
          </Button>
        )}
        <Button className="flex-1" onClick={handleNext} loading={submitting} disabled={!answers[currentIndex]}>
          {!showResult ? 'Check Answer' : isLast ? 'Submit Quiz' : 'Next Question'} <FiArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}

export default Quiz
