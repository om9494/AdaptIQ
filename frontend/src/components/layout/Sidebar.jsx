import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiHome, FiBook, FiTrendingUp, FiUsers, FiGrid,
  FiPlusCircle, FiBarChart2, FiLogOut,
  FiChevronLeft, FiChevronRight, FiZap
} from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'

const navConfig = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/student/courses',   label: 'My Courses', icon: FiBook },
    { to: '/student/progress',  label: 'Progress',   icon: FiTrendingUp },
  ],
  educator: [
    { to: '/educator/dashboard',   label: 'Dashboard',   icon: FiHome },
    { to: '/educator/courses/new', label: 'New Course',  icon: FiPlusCircle },
    { to: '/educator/assessments', label: 'Assessments', icon: FiGrid },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/admin/users',     label: 'Users',      icon: FiUsers },
    { to: '/admin/analytics', label: 'Analytics',  icon: FiBarChart2 },
  ],
}

const roleGradient = {
  student:  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  educator: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
  admin:    'linear-gradient(135deg,#475569,#334155)',
}

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = navConfig[user?.role] || []
  const grad = roleGradient[user?.role] || roleGradient.student

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{ width: collapsed ? 64 : 256 }}
      className="h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: grad }}
        >
          <FiZap className="text-white" size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">AdaptIq</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        )}
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => [
              'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
            ].join(' ')}
            style={({ isActive }) => isActive ? { background: grad } : {}}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User + actions ── */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: grad }}
            >
              {user?.name?.slice(0, 2)?.toUpperCase() || 'EA'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={[
            'flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all duration-150',
            'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
          ].join(' ')}
        >
          <FiLogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={[
            'flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all duration-150',
            'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
          ].join(' ')}
        >
          {collapsed ? <FiChevronRight size={18} /> : <><FiChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar

