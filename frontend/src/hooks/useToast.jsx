import React, { createContext, useContext, useMemo, useState } from 'react'
import Toast from '../components/ui/Toast'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const push = (type, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const api = useMemo(() => ({
    success: msg => push('success', msg),
    error:   msg => push('error', msg),
    info:    msg => push('info', msg),
    warning: msg => push('warning', msg),
  }), [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast type={t.type} message={t.message} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
