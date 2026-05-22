import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { FiBell, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'
import api from '../../api/axios'

const routeTitles = {
  '/student/dashboard':  'Dashboard',
  '/student/courses':    'Browse Courses',
  '/student/progress':   'My Progress',
  '/educator/dashboard': 'Educator Dashboard',
  '/educator/courses/new': 'Create Course',
  '/educator/assessments': 'Assessments',
  '/admin/dashboard':    'Admin Dashboard',
  '/admin/users':        'User Management',
  '/admin/analytics':    'Platform Analytics',
}

const Navbar = ({ onMenuToggle, dark, onDarkToggle }) => {
  const location = useLocation()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    if (user?.role !== 'student') return
    api.get('/student/notifications').then(r => setNotifications(r.data.data || [])).catch(() => {})
  }, [user])

  const title = Object.entries(routeTitles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'AdaptIq'

  return (
    <header className="navbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          aria-label="Toggle menu"
        >
          <FiMenu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onDarkToggle}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        {user?.role === 'student' && (
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-modal border border-slate-100 dark:border-slate-700 z-50 animate-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <FiX size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">All caught up!</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {user?.name?.slice(0, 2)?.toUpperCase() || 'EA'}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar

