import React from 'react'

const ProgressBar = ({ value = 0, max = 100, className = '', showLabel = false, color = 'brand' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    brand:   'from-indigo-500 to-indigo-600',
    success: 'from-green-400 to-green-500',
    warning: 'from-amber-400 to-amber-500',
    danger:  'from-red-400 to-red-500',
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color] || colors.brand} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-10 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar
