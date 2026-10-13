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
        toast.success('Welcome back.')
        navigate(safeRedirect(location.search) || (signedInUser.role === 'ADMIN' ? '/admin' : '/courses'))
      } else {
        const signedInUser = await register(form.fullName, form.email, form.password)
        toast.success('Your account is ready.')
        navigate(safeRedirect(location.search) || (signedInUser.role === 'ADMIN' ? '/admin' : '/courses'))
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid min-h-[70vh] items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white md:p-12">
        <div className="absolute -right-10 -top-10 size-44 rounded-full bg-purple-400/40" />
        <div className="absolute -bottom-20 -left-10 size-52 rounded-full border-[24px] border-blue-300/50" />
        <div className="relative max-w-xl">
          <p className="mb-12 text-[11px] font-bold tracking-[2px] text-blue-100">PKS / LEARNING SYSTEM</p>
          <h1 className="font-['Space_Grotesk'] text-5xl font-semibold leading-[.98] tracking-[-2px] md:text-7xl">
            Make your next skill count.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-[#c8d0c8]">
            Find focused courses, learn from experienced instructors, and keep your progress in one calm workspace.
          </p>
        </div>
      </div>

      <form className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-7 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,.22)] md:p-9" onSubmit={handleSubmit}>
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-blue-600">{isLogin ? 'WELCOME BACK' : 'NEW ACCOUNT'}</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-tight">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </h2>
        </div>

        {!isLogin && <FormField label="Full name" value={form.fullName} onChange={(value) => updateField('fullName', value)} minLength={2} required />}
        <FormField label="Email" type="email" value={form.email} onChange={(value) => updateField('email', value)} required />
        <FormField label="Password" type="password" value={form.password} onChange={(value) => updateField('password', value)} minLength={6} required />
        {!isLogin && <FormField label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => updateField('confirmPassword', value)} minLength={6} required />}

        <button className="mt-2 rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Working...' : isLogin ? 'Sign in' : 'Create account'}
        </button>
        <p className="text-center text-sm text-[#66716e]">
          {isLogin ? 'New here?' : 'Already registered?'}{' '}
          <Link className="font-bold text-blue-600 hover:text-purple-600 hover:underline" to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </form>
    </section>
  )
}

function safeRedirect(search) {
  const redirect = new URLSearchParams(search).get('redirect')
  return redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null
}

function FormField({ label, type = 'text', value, onChange, ...props }) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#66716e]">
      {label}
      <input
        className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}
