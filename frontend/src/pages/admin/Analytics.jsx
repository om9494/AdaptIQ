import React, { useEffect, useState } from 'react'
import { getAdminAnalytics } from '../../api/admin'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4']

const AdminAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminAnalytics().then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const dau = (data.daily_active_users || []).map(d => ({ date: d.date?.slice(5), users: d.active_users }))
  const mastery = (data.mastery_growth || []).map(d => ({ date: d.date?.slice(5), value: Math.round(d.value * 100) }))

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Platform Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">90-day platform performance overview.</p>
      </div>

      {/* DAU */}
      <Card className="p-6">
        <h3 className="section-title mb-4">Daily Active Users</h3>
        {dau.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dau}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#dauGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content usage */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Content Usage by Subject</h3>
          {data.content_usage_by_subject?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.content_usage_by_subject} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.content_usage_by_subject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
        </Card>

        {/* Mastery growth */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Average Mastery Growth</h3>
          {mastery.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mastery}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Mastery']} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
        </Card>

        {/* Assignment completion */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Course Completion Rates</h3>
          {data.assignment_completion?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.assignment_completion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                <Tooltip formatter={v => [`${v}%`, 'Completion']} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
        </Card>

        {/* Quiz performance */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Quiz Performance by Course</h3>
          {data.quiz_performance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.quiz_performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                <Tooltip formatter={v => [`${v}%`, 'Score']} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">No data yet</p>}
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
