import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiActivity, FiTarget } from 'react-icons/fi'
import { getStudentAnalytics } from '../../api/educator'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'

const StudentAnalytics = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentAnalytics(id).then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner />

  const mastery = (data.knowledge_state || []).map(r => ({
    concept: r.concept.replace(/_/g, ' '),
    value: Math.round(r.mastery_score * 100)
  }))

  const engagementSeries = (data.sessions || []).slice(-20).map((s, i) => ({
    session: i + 1,
    score: Math.round((s.engagement_score || 0) * 100)
  }))

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Student Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">{data.student?.name}</p>
        </div>
      </div>

      {/* Student info */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center">
            {data.student?.name?.slice(0, 2)?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">{data.student?.name}</p>
            <p className="text-slate-400 text-sm">{data.student?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="brand">{data.sessions?.length || 0} sessions</Badge>
              <Badge variant="success">{mastery.length} concepts tracked</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Radar */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Concept Mastery</h3>
          {mastery.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={mastery}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="concept" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Mastery" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={v => [`${v}%`, 'Mastery']} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No mastery data yet</div>
          )}
        </Card>

        {/* Engagement trend */}
        <Card className="p-6">
          <h3 className="section-title mb-4">Engagement Trend</h3>
          {engagementSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Session', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Engagement']} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No session data yet</div>
          )}
        </Card>
      </div>

      {/* Mastery breakdown */}
      {mastery.length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-4">Concept Mastery Breakdown</h3>
          <div className="space-y-3">
            {mastery.map(m => (
              <div key={m.concept}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{m.concept}</span>
                  <span className={`font-bold ${m.value >= 70 ? 'text-green-600' : m.value >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{m.value}%</span>
                </div>
                <ProgressBar value={m.value} color={m.value >= 70 ? 'success' : m.value >= 40 ? 'warning' : 'danger'} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Session history */}
      {data.sessions?.length > 0 && (
        <Card className="p-6">
          <h3 className="section-title mb-4">Session History</h3>
          <div className="space-y-2">
            {data.sessions.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date(s.started_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400">{Math.round(s.duration_minutes || 0)} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.engagement_score >= 0.7 ? 'success' : 'warning'}>
                    {Math.round((s.engagement_score || 0) * 100)}%
                  </Badge>
                  {s.completed && <Badge variant="brand">Done</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default StudentAnalytics
