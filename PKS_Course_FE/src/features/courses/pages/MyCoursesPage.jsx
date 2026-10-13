import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/me/enrollments')
      .then(setCourses)
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <>
      <header className="mb-10">
        <p className="mb-4 text-[11px] font-bold tracking-[2px] text-blue-300">YOUR LEARNING</p>
        <h1 className="font-['Space_Grotesk'] text-5xl font-semibold tracking-[-2px] text-white md:text-6xl">My courses.</h1>
        <p className="mt-5 text-lg text-slate-400">Everything you have chosen to learn.</p>
      </header>

      {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}
      {!error && !courses && <div className="grid min-h-48 place-items-center text-sm font-semibold text-slate-400">Loading your courses...</div>}
      {!error && courses?.length === 0 && <EmptyEnrollments />}
      {!error && courses?.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <EnrollmentCard key={course.id} course={course} />)}</div>}
    </>
  )
}

function EnrollmentCard({ course }) {
  return <article className="rounded-2xl border border-white/15 bg-white p-6 text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,.18)]">
    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700">{course.category}</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{course.status || 'ENROLLED'}</span></div>
    <h2 className="mt-7 font-['Space_Grotesk'] text-2xl font-semibold">{course.name}</h2>
    <p className="mt-2 text-sm text-slate-500">Led by {course.instructor}</p>
    <p className="mt-5 text-sm leading-relaxed text-slate-500">{course.description}</p>
    <dl className="mt-6 grid gap-2 border-t border-slate-100 pt-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Fee</dt><dd className="font-bold text-blue-700">{formatFee(course.fee)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Enrolled on</dt><dd className="font-semibold">{formatEnrollmentDate(course.enrolled_at)}</dd></div></dl>
  </article>
}

function formatFee(fee) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(fee || 0))
}

function formatEnrollmentDate(value) {
  if (!value) return '—'
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value))
  const valueFor = (type) => parts.find((part) => part.type === type)?.value
  return `${valueFor('year')}-${valueFor('month')}-${valueFor('day')}`
}

function EmptyEnrollments() {
    return <div className="rounded-2xl border border-dashed border-white/20 px-6 py-16 text-center text-slate-400"><h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">Your learning shelf is empty.</h2><p className="mt-2">Explore the catalog and choose a course to get started.</p><Link className="mt-6 inline-flex rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-purple-500/20" to="/courses">Explore courses</Link></div>
}
