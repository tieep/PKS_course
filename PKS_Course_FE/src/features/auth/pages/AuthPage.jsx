import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../authContext'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={safeRedirect(location.search) || (user.role === 'ADMIN' ? '/admin' : '/courses')} replace />
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isLogin && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      if (isLogin) {
        const signedInUser = await login(form.email, form.password)
        toast.success('Welcome back!')
        navigate(safeRedirect(location.search) || (signedInUser.role === 'ADMIN' ? '/admin' : '/courses'))
      } else {
        const signedInUser = await register(form.fullName, form.email, form.password)
        toast.success('Account created successfully!')
        navigate(safeRedirect(location.search) || (signedInUser.role === 'ADMIN' ? '/admin' : '/courses'))
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid min-h-[75vh] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] max-w-6xl mx-auto py-6">
      {/* Visual Brand Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151b2c] via-[#1c2438] to-[#0f1422] p-8 md:p-12 border border-white/[0.08] shadow-2xl flex flex-col justify-between min-h-[460px]">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#4f46e5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 size-72 rounded-full bg-[#06b6d4]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0e18]/80 text-[#06b6d4] border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="size-2 rounded-full bg-[#06b6d4] animate-pulse" />
            <span>PKS / Learning Portal</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
            Master your next engineering discipline.
          </h1>

          <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-md">
            Hands-on curriculum guided by senior practitioners. Register with confidence on our
            atomic race-condition protected portal.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/[0.08] flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">verified</span>
            <span>Verified Credentials</span>
          </div>
          <div className="size-1 rounded-full bg-slate-600 self-center" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">code</span>
            <span>Production Labs</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#151b2c] p-7 md:p-10 shadow-2xl">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-[10px] font-bold tracking-[2px] text-[#06b6d4] uppercase">
              {isLogin ? 'AUTHENTICATION' : 'NEW REGISTRATION'}
            </p>
            <h2 className="mt-1 font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin
                ? 'Enter your registered credentials to access your courses.'
                : 'Fill in your details to start your enrollment.'}
            </p>
          </div>

          {!isLogin && (
            <FormField
              label="Full Name"
              placeholder="e.g. Nguyen Van An"
              value={form.fullName}
              onChange={(value) => updateField('fullName', value)}
              minLength={2}
              required
            />
          )}

          <FormField
            label="Email Address"
            type="email"
            placeholder="student@example.com"
            value={form.email}
            onChange={(value) => updateField('email', value)}
            required
          />

          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(value) => updateField('password', value)}
            minLength={6}
            required
          />

          {!isLogin && (
            <FormField
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              minLength={6}
              required
            />
          )}

          <button
            className="mt-2 w-full py-3 px-4 rounded-xl bg-[#4f46e5] hover:bg-[#6366f1] text-xs font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
            <Link
              className="font-bold text-[#06b6d4] hover:text-cyan-300 transition-colors"
              to={isLogin ? '/register' : '/login'}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}

function safeRedirect(search) {
  const redirect = new URLSearchParams(search).get('redirect')
  return redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null
}

function FormField({ label, type = 'text', value, placeholder, onChange, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
      <span>{label}</span>
      <input
        className="rounded-xl border border-white/10 bg-[#0f1422] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}
