import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiZap, FiArrowRight, FiEye, FiEyeOff, FiBook, FiUsers } from 'react-icons/fi'
import { registerUser } from '../../api/auth'
import { useToast } from '../../hooks/useToast.jsx'
import Button from '../../components/ui/Button'

const Register = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      setLoading(true)
      await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <FiZap size={18} />
          </div>
          <span className="font-bold text-xl">AdaptIq</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Join thousands of<br />learners growing<br />every day.
          </h2>
          <p className="text-white/70 text-lg">
            Create your free account and start your personalized learning journey today.
          </p>
        </div>
        <div className="space-y-3">
          {['AI-personalized learning paths', 'Adaptive quizzes powered by Gemini', 'Real-time progress analytics', 'Gamified badges & rewards'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FiZap className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">AdaptIq</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Free forever. No credit card required.</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'student',  label: 'I\'m a Student',  icon: FiBook,  desc: 'Learn & grow' },
              { value: 'educator', label: 'I\'m an Educator', icon: FiUsers, desc: 'Teach & inspire' },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === r.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <r.icon className={`mb-2 ${form.role === r.value ? 'text-indigo-600' : 'text-slate-400'}`} size={20} />
                <p className={`font-semibold text-sm ${form.role === r.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{r.label}</p>
                <p className="text-xs text-slate-400">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="name" type="text" className="input pl-10" placeholder="John Doe" value={form.name} onChange={onChange} required />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="email" type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="password" type={showPwd ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Min. 6 characters" value={form.password} onChange={onChange} required />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="confirm" type="password" className="input pl-10" placeholder="Repeat password" value={form.confirm} onChange={onChange} required />
              </div>
            </div>
            <Button type="submit" className="w-full" loading={loading} size="lg">
              Create Account <FiArrowRight size={16} />
            </Button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register


