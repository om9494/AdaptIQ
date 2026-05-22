import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiPlay,
  FiStar,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { getStudentDashboard } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import DifficultyBadge from '../../components/ui/DifficultyBadge'
import { BADGES } from '../../utils/constants'
import useAuth from '../../hooks/useAuth'

const statStyles = [
  { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-700 dark:text-orange-300' },
  { bg: 'bg-sky-100 dark:bg-sky-900/30', icon: 'text-sky-700 dark:text-sky-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: 'text-violet-700 dark:text-violet-300' }
]

const featuredTheme = (course) => ({
  background: `linear-gradient(135deg, ${course?.theme?.ink || '#0f172a'} 0%, ${course?.theme?.accent || '#0f766e'} 58%, ${course?.theme?.surface || '#ccfbf1'} 140%)`
})

const StudentDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    getStudentDashboard().then((response) => setData(response.data.data)).finally(() => setLoading(false))
  }, [])

  const masteryData = useMemo(() => (
    Object.entries(data?.knowledge_state || {}).slice(0, 8).map(([concept, value]) => ({
      concept: concept.replace(/_/g, ' '),
      value: Math.round(value * 100)
    }))
  ), [data])

  const avgMastery = masteryData.length
    ? Math.round(masteryData.reduce((sum, item) => sum + item.value, 0) / masteryData.length)
    : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const featuredCourse = data?.featured_course
  const nextContent = data?.next_recommended_content

  const stats = [
    { icon: FiZap, label: 'Day Streak', value: data?.streak_days || 0, sub: 'Keep momentum alive' },
    { icon: FiStar, label: 'Total Points', value: data?.total_points || 0, sub: 'Earned across lessons and quizzes' },
    { icon: FiBookOpen, label: 'Active Paths', value: data?.courses?.length || 0, sub: 'Current enrollments' },
    { icon: FiTrendingUp, label: 'Avg Mastery', value: `${avgMastery}%`, sub: 'Tracked concept confidence' }
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="page-atmosphere space-y-6 animate-in">
      <section className="glass-panel ambient-grid relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="floating-accent right-8 top-10 h-20 w-20 bg-white/25" />
        <div className="floating-accent left-20 top-4 h-16 w-16 bg-teal-300/20" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <div>
              <p className="section-kicker">Student Command Center</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                Good {greeting}, {user?.name?.split(' ')[0]}. Your adaptive study loop is ready.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Track your streak, continue the strongest next lesson, and keep your course rewards moving with every completed checkpoint.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/student/courses')}>
                Browse Courses <FiArrowRight size={14} />
              </Button>
              {nextContent && (
                <Button variant="secondary" onClick={() => navigate(`/student/content/${nextContent.id}`)}>
                  Continue Next Lesson <FiPlay size={14} />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="metric-pill"><FiAward size={13} /> {(data?.badges || []).length} badges earned</span>
              <span className="metric-pill"><FiTrendingUp size={13} /> {avgMastery}% mastery average</span>
              {featuredCourse?.gamification?.weekly_quest && (
                <span className="metric-pill"><FiStar size={13} /> {featuredCourse.gamification.weekly_quest}</span>
              )}
            </div>
          </div>

          <div className="course-shell overflow-hidden">
            <div className="relative min-h-[260px] p-6 text-white" style={featuredTheme(featuredCourse)}>
              {featuredCourse?.thumbnail_url && (
                <img
                  src={featuredCourse.thumbnail_url}
                  alt={featuredCourse.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                />
              )}
              <div className="absolute inset-0 bg-slate-950/35" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="space-y-2">
                  <Badge variant="brand">Featured Path</Badge>
                  <h3 className="max-w-sm text-2xl font-extrabold">{featuredCourse?.title || 'Start your first course'}</h3>
                  <p className="max-w-md text-sm text-white/78">
                    {featuredCourse?.description || 'Enroll in a course to unlock AI sequencing, quizzes, and progress summaries.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-white/15 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Lessons</p>
                    <p className="mt-2 text-lg font-bold">{featuredCourse?.lesson_count || 0}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/15 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Track XP</p>
                    <p className="mt-2 text-lg font-bold">{featuredCourse?.gamification?.estimated_total_xp || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${statStyles[index].bg}`}>
                <stat.icon className={statStyles[index].icon} size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-kicker">Adaptive sequencing</p>
              <h3 className="section-title">AI learning path</h3>
            </div>
            <Badge variant="brand"><FiZap size={10} /> Personalized</Badge>
          </div>
          {(data?.learning_path || []).length === 0 ? (
            <Card className="p-8 text-center">
              <FiBookOpen className="mx-auto mb-3 text-slate-300" size={34} />
              <p className="font-semibold text-slate-700 dark:text-slate-200">No personalized path yet.</p>
              <p className="mt-1 text-sm text-slate-400">Enroll in a course to unlock a learning sequence.</p>
              <Button className="mt-4" size="sm" onClick={() => navigate('/student/courses')}>Browse Courses</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {(data.learning_path || []).slice(0, 5).map((item, index) => (
                <Card
                  key={item.id || index}
                  hover
                  className="p-4"
                  onClick={() => item.id && navigate(`/student/content/${item.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                      <FiPlay size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400 capitalize">
                        {item.type} · {Math.round((item.duration || 0) / 60)} min
                      </p>
                    </div>
                    <DifficultyBadge level={item.difficulty > 0.7 ? 'Hard' : item.difficulty > 0.4 ? 'Medium' : 'Easy'} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="section-kicker">Concept map</p>
            <h3 className="section-title">Knowledge mastery</h3>
          </div>
          <Card className="p-5">
            {masteryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={masteryData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="concept" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar name="Mastery" dataKey="value" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.26} strokeWidth={2} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Mastery']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-52 items-center justify-center text-center text-sm text-slate-400">
                Complete lessons to light up your concept mastery map.
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-kicker">Enrollment</p>
              <h3 className="section-title">My courses</h3>
            </div>
            <Button variant="ghost" onClick={() => navigate('/student/courses')}>View all</Button>
          </div>
          {(data?.courses || []).length === 0 ? (
            <Card className="p-6 text-center">
              <p className="font-semibold text-slate-700 dark:text-slate-200">No courses enrolled yet.</p>
              <Button className="mt-4" size="sm" onClick={() => navigate('/student/courses')}>Enroll Now</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.courses.slice(0, 4).map((course) => (
                <Card
                  key={course.id}
                  hover
                  className="p-4"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                      style={featuredTheme(course)}
                    >
                      <FiBookOpen size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                          <p className="text-xs text-slate-400">{course.subject}</p>
                        </div>
                        <Badge variant="brand">{course.gamification?.track_name || 'Track'}</Badge>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={course.completion_percentage || 0} showLabel />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="section-kicker">Rewards</p>
            <h3 className="section-title">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(BADGES).map(([key, badge]) => {
              const earned = (data?.badges || []).includes(key)
              return (
                <Card key={key} className={`p-4 ${earned ? 'ring-2 ring-teal-200 dark:ring-teal-700/60' : 'opacity-55'}`}>
                  <div className="text-3xl">{badge.icon}</div>
                  <p className="mt-3 font-semibold text-slate-900 dark:text-white">{badge.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{badge.description}</p>
                  {earned && <Badge variant="success" className="mt-3"><FiCheck size={10} /> Earned</Badge>}
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {data?.recent_sessions?.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="section-kicker">Latest work</p>
            <h3 className="section-title">Recent activity</h3>
          </div>
          <Card className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.recent_sessions.map((session) => (
              <div key={session.session_id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FiClock size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{session.content_title}</p>
                  <p className="text-xs text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
                </div>
                <Badge variant={session.engagement_score > 0.7 ? 'success' : 'warning'}>
                  {Math.round(session.engagement_score * 100)}%
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
