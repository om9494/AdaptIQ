import React, { useEffect, useState } from 'react'
import { FiAward, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import { getAssessments } from '../../api/educator'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'

const Assessments = () => {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssessments().then(r => setAssessments(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const avgScore = assessments.length
    ? Math.round(assessments.reduce((a, b) => a + (b.score || 0), 0) / assessments.length * 100)
    : 0

  const passRate = assessments.length
    ? Math.round(assessments.filter(a => (a.score || 0) >= 0.7).length / assessments.length * 100)
    : 0

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Assessments</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Quiz results from your courses.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FiAward,      label: 'Total Quizzes', value: assessments.length, bg: 'bg-indigo-100 dark:bg-indigo-900/30', ic: 'text-indigo-600 dark:text-indigo-400' },
          { icon: FiTrendingUp, label: 'Average Score', value: `${avgScore}%`,     bg: 'bg-green-100 dark:bg-green-900/30',   ic: 'text-green-600 dark:text-green-400' },
          { icon: FiAward,      label: 'Pass Rate',     value: `${passRate}%`,     bg: 'bg-amber-100 dark:bg-amber-900/30',   ic: 'text-amber-600 dark:text-amber-400' },
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

      {/* List */}
      {assessments.length === 0 ? (
        <Card className="p-12 text-center">
          <FiAward className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">No assessments yet</p>
          <p className="text-slate-400 text-sm mt-1">Students will appear here after taking quizzes.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-700">
          {assessments.map(a => {
            const score = Math.round((a.score || 0) * 100)
            const passed = score >= 70
            return (
              <div key={a.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <FiAward className={passed ? 'text-green-600' : 'text-amber-600'} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={passed ? 'success' : 'warning'}>{passed ? 'Passed' : 'Failed'}</Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FiCalendar size={10} /> {new Date(a.taken_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ProgressBar value={score} color={passed ? 'success' : 'warning'} />
                </div>
                <span className={`text-xl font-extrabold ${passed ? 'text-green-600' : 'text-amber-600'}`}>{score}%</span>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

export default Assessments
