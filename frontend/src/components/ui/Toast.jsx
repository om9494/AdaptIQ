import React from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi'

const config = {
  success: { icon: FiCheckCircle, cls: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' },
  error:   { icon: FiAlertCircle, cls: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300' },
  info:    { icon: FiInfo, cls: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' },
  warning: { icon: FiAlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300' },
}

const Toast = ({ type = 'info', message, onDismiss }) => {
  const { icon: Icon, cls } = config[type] || config.info
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card animate-slide-in-right min-w-[280px] max-w-sm ${cls}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
          <FiX size={14} />
        </button>
      )}
    </div>
  )
}

export default Toast
