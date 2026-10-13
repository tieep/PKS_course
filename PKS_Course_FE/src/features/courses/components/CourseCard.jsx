import { Link } from 'react-router-dom'

export default function CourseCard({ course, onEnroll, busy, enrollLabel }) {
  const isFull = course.enrollment_status === 'FULL'
  const count = course.enrolled_count ?? 0

  return (
    <article className="group flex min-h-[285px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,.18)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_45px_rgba(15,23,42,.28)]">
      <div className="h-2 bg-linear-to-r from-blue-500 to-purple-600" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700">{course.category}</span>
          <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>{isFull ? 'Full' : 'Open'}</span>
        </div>
        <h3 className="mt-8 font-['Space_Grotesk'] text-2xl font-semibold leading-tight tracking-tight">{course.name}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">Led by {course.instructor}</p>
        <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-slate-500">{course.description || 'A practical path to build confidence through guided learning.'}</p>
        <p className="mt-4 text-base font-bold text-blue-700">{formatFee(course.fee)}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <div><span className="block text-xs font-semibold text-slate-500">{count} / {course.capacity} enrolled</span><Link className="mt-1 inline-block text-xs font-bold text-blue-600 hover:text-purple-600" to={`/courses/${course.id}`}>View details →</Link></div>
          {onEnroll && <button className={`rounded-full px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isFull ? 'bg-slate-300 text-slate-500' : 'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`} disabled={isFull || busy} onClick={() => onEnroll(course.id)}>{busy ? 'Joining...' : isFull ? 'Full' : enrollLabel || 'Enroll'}</button>}
        </div>
      </div>
    </article>
  )
}

function formatFee(fee) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(fee || 0))
}
