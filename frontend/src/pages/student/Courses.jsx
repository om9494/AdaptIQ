import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiSearch,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap
} from 'react-icons/fi'
import { getStudentCourses, enrollCourse } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DifficultyBadge from '../../components/ui/DifficultyBadge'
import ProgressBar from '../../components/ui/ProgressBar'
import { useToast } from '../../hooks/useToast.jsx'

const courseThemeStyle = (course) => ({
  background: `linear-gradient(135deg, ${course.theme?.ink || '#0f172a'} 0%, ${course.theme?.accent || '#0f766e'} 58%, ${course.theme?.surface || '#ccfbf1'} 140%)`
})

const highlightStyle = (course) => ({
  backgroundColor: course.theme?.surface || '#ecfeff',
  color: course.theme?.ink || '#0f766e'
})

const CourseCard = ({ course, onEnroll, onContinue }) => {
  const milestoneCount = course.gamification?.milestone_rewards?.length || 0

  return (
    <div className="course-card group animate-in">
      <div className="course-card-thumb" style={courseThemeStyle(course)}>
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
        <div className="floating-accent top-5 right-6 h-20 w-20 bg-white/20" />
        <div className="absolute inset-x-5 top-4 flex items-start justify-between gap-3">
          <DifficultyBadge level={course.difficulty_level} />
          {course.enrolled ? (
            <Badge variant="success"><FiCheck size={10} /> Enrolled</Badge>
          ) : (
            <Badge variant="brand"><FiZap size={10} /> {course.gamification?.track_name || 'Learning Track'}</Badge>
          )}
        </div>
        <div className="absolute inset-x-5 bottom-5 space-y-3 text-white">
          <div className="flex flex-wrap gap-2">
            <span className="course-chip bg-white/16 text-white">{course.subject}</span>
            <span className="course-chip bg-white/16 text-white">{course.lesson_count || 0} lessons</span>
            <span className="course-chip bg-white/16 text-white">{course.estimated_minutes || 0} min</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/70">
              {course.creator?.name || 'Educator'}
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight">{course.title}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="metric-pill"><FiUsers size={13} /> {course.student_count || 0} learners</span>
          <span className="metric-pill"><FiAward size={13} /> {course.gamification?.estimated_total_xp || 0} XP</span>
          <span className="metric-pill"><FiTarget size={13} /> {milestoneCount} checkpoints</span>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Weekly Quest</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {course.gamification?.weekly_quest || 'Complete the next module.'}
              </p>
            </div>
            <div className="theme-orb shrink-0" style={highlightStyle(course)}>
              <FiStar size={18} />
            </div>
          </div>
        </div>

        {course.enrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Course progress</span>
              <span className="font-bold" style={{ color: course.theme?.ink || '#0f766e' }}>
                {Math.round(course.completion_percentage || 0)}%
              </span>
            </div>
            <ProgressBar value={course.completion_percentage || 0} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FiClock size={12} />
              <span>{course.gamification?.xp_per_lesson || 0} XP per lesson</span>
            </div>
          </div>
          {course.enrolled ? (
            <Button onClick={() => onContinue(course.id)}>
              {course.completion_percentage > 0 ? 'Continue Path' : 'Start Path'}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onEnroll(course.id)}>
              Enroll Free
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const StudentCourses = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [filter, setFilter] = useState('all')

  const load = async () => {
    const res = await getStudentCourses()
    setCourses(res.data.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleEnroll = async (courseId) => {
    await enrollCourse(courseId)
    toast.success('Enrolled successfully!')
    load()
  }

  const subjects = useMemo(() => ['all', ...new Set(courses.map((course) => course.subject))], [courses])
  const filtered = courses.filter((course) => {
    const q = course.title.toLowerCase().includes(query.toLowerCase()) || course.description?.toLowerCase().includes(query.toLowerCase())
    const s = subject === 'all' || course.subject === subject
    const f = filter === 'all' || (filter === 'enrolled' && course.enrolled) || (filter === 'available' && !course.enrolled)
    return q && s && f
  })

  const enrolledCount = courses.filter((course) => course.enrolled).length
  const totalXp = courses.reduce((sum, course) => sum + (course.gamification?.estimated_total_xp || 0), 0)

  if (loading) return <PageSpinner />

  return (
    <div className="page-atmosphere space-y-6 animate-in">
      <section className="glass-panel ambient-grid relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="floating-accent -right-4 top-8 h-24 w-24 bg-teal-300/20" />
        <div className="floating-accent left-24 top-2 h-14 w-14 bg-orange-300/20" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="section-kicker">Adaptive Course Library</p>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
              Explore guided learning paths with checkpoints, rewards, and educator-built structure.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Every course includes a video anchor lesson, clear step-by-step content, and gamified milestone rewards to keep momentum visible.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="card px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Courses</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{courses.length}</p>
            </div>
            <div className="card px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Enrolled</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{enrolledCount}</p>
            </div>
            <div className="card px-4 py-4 sm:col-span-1 col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Catalog XP</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{totalXp}</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="input pl-11"
              placeholder="Search by course title or topic"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="input lg:w-64" value={subject} onChange={(event) => setSubject(event.target.value)}>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All subjects' : item}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {['all', 'enrolled', 'available'].map((item) => {
              const active = filter === item
              return (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FiBookOpen className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No courses matched those filters.</p>
          <p className="mt-1 text-sm text-slate-400">Try another subject or remove the current search.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              onContinue={(courseId) => navigate(`/student/courses/${courseId}`)}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="theme-orb bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
              <FiZap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">AI sequencing</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lessons stay ordered to fit your current mastery.</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="theme-orb bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <FiAward size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Checkpoint rewards</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Each path includes badges, milestone XP, and a final boss goal.</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="theme-orb bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              <FiTrendingUp size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Structured outcomes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Every course now has a visible path, runtime estimate, and quest layer.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StudentCourses
