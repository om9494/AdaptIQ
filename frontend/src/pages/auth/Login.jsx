import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock, FiZap, FiArrowRight, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast.jsx'
import Button from '../../components/ui/Button'

const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'student1@adaptiq.com', password: 'student123', role: 'student' },
  { label: 'Educator', email: 'educator1@adaptiq.com', password: 'educator123', role: 'educator' },
  { label: 'Admin', email: 'admin@adaptiq.com', password: 'admin123', role: 'admin' },
]

const LOGIN_BENEFITS = [
  'Continue through guided course lessons in a clearer learning order.',
  'Review checkpoint quizzes and progress summaries from one place.',
  'Return to a calmer dashboard without fake platform statistics.'
]

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = await login(email, password)
      toast.success(`Welcome back, ${data.user.name}!`)
      const role = data.user.role
      if (role === 'student') navigate('/student/dashboard')
      if (role === 'educator') navigate('/educator/dashboard')
      if (role === 'admin') navigate('/admin/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <FiZap size={18} />
          </div>
          <span className="font-bold text-xl">AdaptIq</span>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Your personalized
            <br />
            learning journey
            <br />
            starts here.
          </h2>
          <p className="text-white/70 text-lg">
            AI-powered adaptive learning that meets you exactly where you are.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Why sign in</p>
          {LOGIN_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/16">
                <FiCheckCircle size={16} />
              </div>
              <p className="text-sm leading-6 text-white/82">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FiZap className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">AdaptIq</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to continue your learning journey.</p>

          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick demo access</p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => fillDemo(acc)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Sign In <FiArrowRight size={16} />
            </Button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
