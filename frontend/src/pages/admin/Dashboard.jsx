import React, { useEffect, useState } from 'react'
import { FiUsers, FiBookOpen, FiActivity, FiTrendingUp, FiUserCheck, FiPercent } from 'react-icons/fi'
import { getAdminDashboard } from '../../api/admin'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899']

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const roleData = [
    { label: 'Students',  value: data.role_counts?.student  || 0 },
    { label: 'Educators', value: data.role_counts?.educator || 0 },
    { label: 'Admins',    value: data.role_counts?.admin    || 0 },
  ]

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Platform Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time platform metrics and analytics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: FiUsers,      label: 'Total Users',       value: data.total_users,                           bg: 'bg-indigo-100 dark:bg-indigo-900/30', ic: 'text-indigo-600 dark:text-indigo-400' },
          { icon: FiBookOpen,   label: 'Active Courses',    value: data.active_courses,                        bg: 'bg-green-100 dark:bg-green-900/30',   ic: 'text-green-600 dark:text-green-400' },
          { icon: FiActivity,   label: 'Sessions Today',    value: data.sessions_today,                        bg: 'bg-amber-100 dark:bg-amber-900/30',   ic: 'text-amber-600 dark:text-amber-400' },
          { icon: FiTrendingUp, label: 'Avg Mastery',       value: `${Math.round(data.avg_mastery * 100)}%`,   bg: 'bg-violet-100 dark:bg-violet-900/30', ic: 'text-violet-600 dark:text-violet-400' },
          { icon: FiUserCheck,  label: 'Total Enrollments', value: data.total_assignments,                     bg: 'bg-sky-100 dark:bg-sky-900/30',       ic: 'text-sky-600 dark:text-sky-400' },
          { icon: FiPercent,    label: 'Avg Completion',    value: `${Math.round(data.avg_completion || 0)}%`, bg: 'bg-pink-100 dark:bg-pink-900/30',     ic: 'text-pink-600 dark:text-pink-400' },
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

      {/* Role distribution */}
      <Card className="p-6">
        <h3 className="section-title mb-4">Users by Role</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={roleData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default AdminDashboard
