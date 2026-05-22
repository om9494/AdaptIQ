import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUsers, FiBookOpen, FiActivity, FiFileText, FiPlus, FiEdit2, FiEye, FiToggleLeft, FiToggleRight, FiArrowRight } from 'react-icons/fi'
import { getEducatorDashboard, getAssessments, togglePublish } from '../../api/educator'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { useToast } from '../../hooks/useToast.jsx'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const EducatorDashboard = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [dashRes, assessRes] = await Promise.all([getEducatorDashboard(), getAssessments()])
    setData(dashRes.data.data)
    setAssessments(assessRes.data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleTogglePublish = async (courseId, isPublished) => {
    await togglePublish(courseId)
    toast.success(isPublished ? 'Course unpublished' : 'Course published!')
    load()
  }

  if (loading) return <PageSpinner />

  const chartData = (data.daily_active_students || []).map(d => ({ date: d.date?.slice(5), active: d.active }))

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Educator Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your courses and track student progress.</p>
        </div>
        <Button onClick={() => navigate('/educator/courses/new')}>
          <FiPlus size={16} /> New Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FiUsers,    label: 'Total Students', value: data.total_students,                         bg: 'bg-indigo-100 dark:bg-indigo-900/30', ic: 'text-indigo-600 dark:text-indigo-400' },
          { icon: FiBookOpen, label: 'Courses',         value: data.total_courses,                          bg: 'bg-green-100 dark:bg-green-900/30',   ic: 'text-green-600 dark:text-green-400' },
          { icon: FiActivity, label: 'Avg Engagement',  value: `${Math.round(data.avg_engagement * 100)}%`, bg: 'bg-amber-100 dark:bg-amber-900/30',   ic: 'text-amber-600 dark:text-amber-400' },
          { icon: FiFileText, label: 'Content Items',   value: data.total_content_items,                    bg: 'bg-violet-100 dark:bg-violet-900/30', ic: 'text-violet-600 dark:text-violet-400' },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon className={s.ic} size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-4">Daily Active Students (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fill="url(#activeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">My Courses</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/educator/courses/new')}>
            <FiPlus size={14} /> Add Course
          </Button>
        </div>
        {data.courses.length === 0 ? (
          <Card className="p-12 text-center">
            <FiBookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 font-medium">No courses yet</p>
            <Button className="mt-4" onClick={() => navigate('/educator/courses/new')}>Create Your First Course</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.courses.map(course => (
              <Card key={course.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={course.is_published ? 'success' : 'slate'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="brand">{course.subject}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {course.content_count} lessons · {course.assigned_students} students
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/educator/courses/${course.id}/edit`)}>
                    <FiEdit2 size={12} /> Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/educator/courses/${course.id}/content`)}>
                    <FiEye size={12} /> Content
                  </Button>
                  <Button
                    size="sm"
                    variant={course.is_published ? 'secondary' : 'primary'}
                    onClick={() => handleTogglePublish(course.id, course.is_published)}
                  >
                    {course.is_published ? <FiToggleRight size={12} /> : <FiToggleLeft size={12} />}
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Assessments */}
      {assessments.length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-4">Recent Assessments</h3>
          <div className="space-y-3">
            {assessments.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    Score: {Math.round((a.score || 0) * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">{new Date(a.taken_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={a.score >= 0.7 ? 'success' : 'warning'}>
                  {a.score >= 0.7 ? 'Passed' : 'Needs Review'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default EducatorDashboard
