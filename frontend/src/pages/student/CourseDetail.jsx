import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiLock,
  FiPlay,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi'
import { getCourseDetail } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DifficultyBadge from '../../components/ui/DifficultyBadge'
import ProgressBar from '../../components/ui/ProgressBar'

const themeBackground = (course) => ({
  background: `linear-gradient(135deg, ${course.theme?.ink || '#0f172a'} 0%, ${course.theme?.accent || '#0f766e'} 58%, ${course.theme?.surface || '#ccfbf1'} 150%)`
})

const accentSurface = (course) => ({
  backgroundColor: course.theme?.surface || '#ecfeff',
  color: course.theme?.ink || '#0f766e'
})

const ContentRow = ({ item, index, course, onClick }) => {
  const Icon = item.completed ? FiCheck : FiPlay

  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
      onClick={onClick}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={accentSurface(course)}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{String(index).padStart(2, '0')}</span>
          <p className="truncate font-semibold text-slate-900 dark:text-white">{item.title}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="capitalize">{item.content_type}</span>
          <span>{Math.round((item.duration_seconds || item.duration || 0) / 60)} min</span>
          {item.completed && <Badge variant="success">Completed</Badge>}
        </div>
      </div>
      <DifficultyBadge
        level={item.difficulty_score > 0.7 ? 'Hard' : item.difficulty_score > 0.4 ? 'Medium' : 'Easy'}
      />
    </button>
  )
}

const ProgressSummaryCard = ({ summary, course }) => {
  if (!summary?.summary) return null

  const providerLabel = summary.llm_enabled
    ? `${summary.provider === 'gemini' ? 'Gemini' : 'AI'} Coach`
    : 'Adaptive Coach'

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant={summary.llm_enabled ? 'brand' : 'warning'}>
          <FiZap size={10} /> {providerLabel}
        </Badge>
        <span className="text-xs text-slate-400">
          {summary.llm_enabled ? summary.model : 'Fallback summary'}
        </span>
      </div>
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{summary.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(course.gamification?.milestone_rewards || []).slice(0, 2).map((reward) => (
          <span key={reward.threshold} className="metric-pill" style={accentSurface(course)}>
            <FiStar size={12} /> {reward.badge}
          </span>
        ))}
      </div>
    </Card>
  )
}

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourseDetail(id).then((response) => setData(response.data.data)).finally(() => setLoading(false))
  }, [id])

  const course = data?.course
  const content = data?.content || []
  const completion = course?.completion_percentage || 0
  const courseMetrics = useMemo(() => ([
    { icon: FiBookOpen, label: 'Lessons', value: course?.lesson_count || content.length },
    { icon: FiClock, label: 'Runtime', value: `${course?.estimated_minutes || 0} min` },
    { icon: FiAward, label: 'Total XP', value: course?.gamification?.estimated_total_xp || 0 },
    { icon: FiTarget, label: 'Track', value: course?.gamification?.track_name || 'Learning Track' }
  ]), [course, content.length])

  if (loading) return <PageSpinner />

  return (
    <div className="page-atmosphere space-y-6 animate-in">
      <section className="course-shell overflow-hidden">
        <div className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-8" style={themeBackground(course)}>
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-slate-950/30" />
          <div className="floating-accent right-10 top-8 h-24 w-24 bg-white/15" />
          <div className="relative z-10 space-y-5 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="brand">{course.subject}</Badge>
              <DifficultyBadge level={course.difficulty_level} />
              <span className="course-chip bg-white/14 text-white">
                {course.creator?.name || 'Educator'}
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                {course.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {courseMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-white/75">
                    <metric.icon size={15} />
                    <span className="text-xs uppercase tracking-[0.2em]">{metric.label}</span>
                  </div>
                  <p className="mt-3 text-lg font-extrabold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200/70 p-6 dark:border-slate-700 lg:grid-cols-[1.35fr,0.95fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Completion</span>
              <span className="font-bold" style={{ color: course.theme?.ink || '#0f766e' }}>
                {Math.round(completion)}%
              </span>
            </div>
            <ProgressBar value={completion} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Weekly Quest</p>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {course.gamification?.weekly_quest}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Final Boss</p>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {course.gamification?.final_boss}
                </p>
              </div>
            </div>
          </div>

          <ProgressSummaryCard summary={data.ai_progress_summary} course={course} />
        </div>
      </section>

      {data.next_content && (
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={accentSurface(course)}>
                <FiTrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Resume next</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{data.next_content.title}</p>
              </div>
            </div>
            <Button onClick={() => navigate(`/student/content/${data.next_content.id}`)}>
              Continue Learning <FiArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-kicker">Learning path</p>
              <h3 className="section-title">AI-ordered lesson flow</h3>
            </div>
            <Badge variant="brand"><FiZap size={10} /> Personalized order</Badge>
          </div>
          <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {content.map((item, index) => (
              <ContentRow
                key={item.id}
                item={item}
                index={index + 1}
                course={course}
                onClick={() => navigate(`/student/content/${item.id}`)}
              />
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <div>
            <p className="section-kicker">Gamification</p>
            <h3 className="section-title">Milestones and rewards</h3>
          </div>
          <div className="space-y-3">
            {(course.milestones || []).map((milestone) => {
              const reward = (course.gamification?.milestone_rewards || []).find((item) => item.threshold === milestone.threshold)
              const unlocked = milestone.unlocked

              return (
                <Card key={milestone.threshold} className={`p-4 ${unlocked ? '' : 'opacity-75'}`}>
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={unlocked ? accentSurface(course) : { backgroundColor: '#e2e8f0', color: '#64748b' }}>
                      {unlocked ? <FiAward size={17} /> : <FiLock size={17} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{milestone.label}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {reward ? `${reward.badge} + ${reward.xp} XP reward` : `Unlocks at ${milestone.threshold}%`}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant={unlocked ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!unlocked}
                    onClick={() => navigate(`/student/quiz/${course.id}?milestone=${milestone.threshold}`)}
                  >
                    {unlocked ? 'Take checkpoint quiz' : 'Locked'}
                  </Button>
                </Card>
              )
            })}
          </div>

          {data.recommended_content?.length > 0 && (
            <>
              <div className="pt-2">
                <p className="section-kicker">Suggested review</p>
                <h3 className="section-title">Recommended content</h3>
              </div>
              <div className="space-y-3">
                {data.recommended_content.slice(0, 3).map((item) => (
                  <Card key={item.id} hover className="p-4" onClick={() => navigate(`/student/content/${item.id}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {(item.concepts || item.concept_tags || []).slice(0, 3).join(', ') || 'Course concept'}
                        </p>
                      </div>
                      <FiArrowRight className="mt-0.5 shrink-0 text-slate-400" size={16} />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
