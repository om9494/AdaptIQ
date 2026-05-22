import React, { useEffect, useMemo, useState } from 'react'
import { FiActivity, FiClock, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { getProgress } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'

const StudentProgress = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgress().then((response) => setData(response.data.data)).finally(() => setLoading(false))
  }, [])

  const engagementSeries = useMemo(() => (
    (data?.engagement_heatmap || []).map((item) => ({
      date: item.date?.slice(5),
      value: Math.round(item.value * 100)
    }))
  ), [data])

  const timePerConcept = useMemo(() => (
    (data?.time_per_concept || []).slice(0, 10).map((item) => ({
      ...item,
      label: item.label?.replace(/_/g, ' ')
    }))
  ), [data])

  const courseBreakdown = data?.course_breakdown || []
  const progressCoachLabel = data?.ai_progress_summary?.llm_enabled
    ? `${data?.ai_progress_summary?.provider === 'gemini' ? 'Gemini' : 'AI'} Progress Coach`
    : 'Adaptive Progress Coach'

  if (loading) return <PageSpinner />

  return (
    <div className="page-atmosphere space-y-6 animate-in">
      <section className="glass-panel ambient-grid relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="floating-accent left-16 top-5 h-16 w-16 bg-teal-300/20" />
        <div className="floating-accent right-10 top-10 h-20 w-20 bg-sky-300/18" />
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-3">
            <p className="section-kicker">Progress Intelligence</p>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">Your learning performance in one place.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Review engagement trends, course-level effort, weak concepts, and the current progress brief generated for your study portfolio.
            </p>
          </div>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant={data?.ai_progress_summary?.llm_enabled ? 'brand' : 'warning'}>
                <FiZap size={10} /> {progressCoachLabel}
              </Badge>
              <span className="text-xs text-slate-400">
                {data?.ai_progress_summary?.llm_enabled ? data.ai_progress_summary.model : 'Fallback summary'}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {data?.ai_progress_summary?.summary || 'Complete more sessions to unlock a richer progress brief.'}
            </p>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: FiTrendingUp,
            label: 'Learning Velocity',
            value: `${(data?.learning_velocity || 0).toFixed(1)}/hr`,
            sub: 'Concepts per hour',
            bg: 'bg-teal-100 dark:bg-teal-900/30',
            iconClass: 'text-teal-700 dark:text-teal-300'
          },
          {
            icon: FiClock,
            label: 'Total Hours',
            value: `${(data?.total_learning_hours || 0).toFixed(1)}h`,
            sub: 'Time invested',
            bg: 'bg-sky-100 dark:bg-sky-900/30',
            iconClass: 'text-sky-700 dark:text-sky-300'
          },
          {
            icon: FiTarget,
            label: 'Avg Performance',
            value: `${Math.round((data?.avg_performance || 0) * 100)}%`,
            sub: 'Across sessions',
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            iconClass: 'text-orange-700 dark:text-orange-300'
          },
          {
            icon: FiActivity,
            label: 'Total Sessions',
            value: data?.total_sessions || 0,
            sub: 'Tracked learning blocks',
            bg: 'bg-violet-100 dark:bg-violet-900/30',
            iconClass: 'text-violet-700 dark:text-violet-300'
          }
        ].map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-400">{metric.sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${metric.bg}`}>
                <metric.icon className={metric.iconClass} size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        {engagementSeries.length > 0 && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="section-kicker">Trendline</p>
                <h3 className="section-title">Engagement over time</h3>
              </div>
              <Badge variant="brand">Daily signal</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={engagementSeries}>
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Engagement']} />
                <Area type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2.5} fill="url(#engGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {courseBreakdown.length > 0 && (
          <Card className="p-6">
            <div className="mb-4">
              <p className="section-kicker">Course effort</p>
              <h3 className="section-title">Course breakdown</h3>
            </div>
            <div className="space-y-3">
              {courseBreakdown.map((course) => (
                <div key={course.title} className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/55">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                      <p className="text-xs text-slate-400">{course.minutes} min logged</p>
                    </div>
                    <Badge variant={course.engagement >= 70 ? 'success' : 'warning'}>
                      {course.engagement}% engaged
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {timePerConcept.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <p className="section-kicker">Study depth</p>
            <h3 className="section-title">Time per concept</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timePerConcept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={140} />
              <Tooltip formatter={(value) => [`${value} min`, 'Time']} />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {data?.knowledge_gaps?.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <p className="section-kicker">Focus list</p>
            <h3 className="section-title">Knowledge gaps to address</h3>
          </div>
          <div className="space-y-3">
            {data.knowledge_gaps.slice(0, 8).map((concept) => (
              <div key={concept} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                  {concept.replace(/_/g, ' ')}
                </span>
                <div className="flex-1">
                  <ProgressBar value={30} color="warning" />
                </div>
                <span className="text-xs font-semibold text-amber-600">Needs work</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {engagementSeries.length === 0 && timePerConcept.length === 0 && (
        <Card className="p-12 text-center">
          <FiActivity className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">No progress data yet.</p>
          <p className="mt-1 text-sm text-slate-400">Complete lessons to populate your analytics dashboard.</p>
        </Card>
      )}
    </div>
  )
}

export default StudentProgress
