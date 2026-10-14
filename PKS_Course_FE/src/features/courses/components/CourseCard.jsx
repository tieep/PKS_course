import { Link } from 'react-router-dom'
import {
  formatFee,
  getCapacityMetrics,
  getCategoryIcon,
  getInitials,
} from '../../../lib/formatters'

export default function CourseCard({ course, onEnroll, busy, enrollLabel }) {
  const { count, capacity, percentage, spotsLeft, isFull, isLimited } = getCapacityMetrics(
    course.enrolled_count,
    course.capacity,
    course.enrollment_status,
  )

  const instructorInitials = getInitials(course.instructor, 'IN')
  const categoryIcon = getCategoryIcon(course.category)

  return (
    <article className="flex flex-col justify-between bg-[#151b2c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
      <div>
        {/* Category & Status Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-[#06b6d4] text-xs font-semibold tracking-wide flex items-center gap-1.5 border border-cyan-500/20">
            <span className="material-symbols-outlined text-[15px]">{categoryIcon}</span>
            <span>{course.category}</span>
          </span>

          {isFull ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
              <span className="size-1.5 rounded-full bg-rose-400" />
              <span>Full</span>
            </span>
          ) : isLimited ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{spotsLeft} left</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Available</span>
            </span>
          )}
        </div>

        {/* Course Title */}
        <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-1">
          {course.name}
        </h3>

        {/* Short Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2 min-h-10">
          {course.description || 'Hands-on practical curriculum to master engineering confidence.'}
        </p>

        {/* Instructor Block */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1422] border border-white/[0.04] mb-5">
          <div className="size-9 rounded-full bg-[#4f46e5]/30 text-indigo-300 border border-[#4f46e5]/40 flex items-center justify-center font-bold text-xs shrink-0">
            {instructorInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-200 truncate">
              {course.instructor}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Lead Instructor</span>
          </div>
        </div>

        {/* Capacity Indicator & Progress Bar */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#06b6d4]">group</span>
              Capacity
            </span>
            <span
              className={`font-bold ${
                isFull ? 'text-rose-400' : isLimited ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {count} / {capacity} students
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#252f48] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-rose-500' : isLimited ? 'bg-amber-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>{percentage}% Filled</span>
            <span>{isFull ? 'Waitlist only' : `${spotsLeft} seats open`}</span>
          </div>
        </div>
      </div>

      {/* Footer: Tuition & Actions */}
      <div className="-mx-6 -mb-6 p-5 rounded-b-2xl bg-[#1c2438]/50 border-t border-white/[0.06] flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Tuition Fee
          </span>
          <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white tracking-tight">
            {formatFee(course.fee)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            className="py-2.5 px-3 rounded-lg bg-[#252f48] text-slate-200 hover:text-white hover:bg-[#313b55] text-xs font-semibold transition-all text-center border border-white/[0.06]"
            to={`/courses/${course.id}`}
          >
            Details
          </Link>

          {onEnroll && (
            <button
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                isFull
                  ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-white/5'
                  : 'bg-[#4f46e5] text-white hover:bg-[#6366f1] shadow-[0_0_16px_rgba(79,70,229,0.35)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]'
              }`}
              disabled={isFull || busy}
              onClick={() => onEnroll(course.id)}
            >
              <span>{busy ? 'Enrolling...' : isFull ? 'Full' : enrollLabel || 'Enroll'}</span>
              {!isFull && !busy && (
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
