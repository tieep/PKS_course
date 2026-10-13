import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import { useAuth } from '../../auth/authContext'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadCourse() {
    try {
      setCourse(await apiRequest(`/courses/${courseId}`))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest(`/courses/${courseId}`)
      .then((data) => { if (active) { setCourse(data); setError('') } })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [courseId])

  async function enroll() {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`)
      return
    }
    if (user.role !== 'STUDENT') {
      toast.error('Only student accounts can enroll in courses.')
      return
    }
    setBusy(true)
    try {
      await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' })
      toast.success('Enrollment confirmed.')
      await loadCourse()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <section className="rounded-2xl border border-red-300/40 bg-red-500/10 p-7 text-red-100"><p className="font-bold">{error}</p><Link className="mt-4 inline-block font-bold underline" to="/courses">Back to courses</Link></section>
  if (!course) return <div className="grid min-h-64 place-items-center text-sm font-semibold text-slate-200">Loading course...</div>

  const isFull = course.enrollment_status === 'FULL'
  return <section className="mx-auto max-w-4xl"><Link className="text-sm font-bold text-blue-200 hover:text-white" to="/courses">← Back to courses</Link><article className="mt-6 overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl"><div className="h-3 bg-linear-to-r from-blue-500 to-purple-600" /><div className="grid gap-10 p-7 md:grid-cols-[1fr_260px] md:p-12"><div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">{course.category}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{isFull ? 'Full' : 'Open for enrollment'}</span></div><h1 className="mt-7 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight md:text-5xl">{course.name}</h1><p className="mt-4 text-base text-slate-500">Instructor: {course.instructor}</p><p className="mt-8 whitespace-pre-line text-base leading-8 text-slate-600">{course.description || 'Course description will be updated soon.'}</p></div><aside className="rounded-2xl bg-slate-50 p-6"><p className="text-sm font-semibold text-slate-500">Fee</p><p className="mt-2 text-2xl font-bold text-blue-700">{formatFee(course.fee)}</p><p className="mt-7 text-sm text-slate-500">Enrollment</p><p className="mt-1 font-semibold">{course.enrolled_count} / {course.capacity} students</p><button className="mt-7 w-full rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isFull || busy} onClick={enroll}>{busy ? 'Joining...' : isFull ? 'Course full' : user ? 'Enroll now' : 'Log in to enroll'}</button></aside></div></article></section>
}

function formatFee(fee) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(fee || 0))
}
