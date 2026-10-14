import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import { useAuth } from '../../auth/authContext'
import {
  formatFee,
  getCapacityMetrics,
  getInitials,
} from '../../../lib/formatters'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadCourse() {
    try {
      const data = await apiRequest(`/courses/${courseId}`)
      setCourse(data)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    let active = true

    apiRequest(`/courses/${courseId}`)
      .then((data) => {
        if (active) {
          setCourse(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message)
        }
      })

    return () => {
      active = false
    }
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
      toast.success('Congratulations! You have successfully enrolled.')
      await loadCourse()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-200">
        <span className="material-symbols-outlined text-4xl text-rose-400 mb-2">error</span>
        <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2">{error}</h2>
        <p className="text-sm text-slate-400 mb-5">
          The course you requested may have been hidden, deleted, or does not exist.
        </p>
        <Link
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#252f48] text-white hover:bg-[#313b55] text-xs font-semibold transition-all"
          to="/courses"
        >
          <span>← Back to course catalog</span>
        </Link>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto grid place-items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="size-10 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading course details...</span>
        </div>
      </div>
    )
  }

  const { count, capacity, percentage, spotsLeft, isFull, isLimited } = getCapacityMetrics(
    course.enrolled_count,
    course.capacity,
    course.enrollment_status,
  )

  const instructorInitials = getInitials(course.instructor, 'IN')

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          to="/courses"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Main Course Content */}
        <div className="flex flex-col gap-8">
          {/* Header Card */}
          <div className="bg-[#151b2c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-[#06b6d4] text-xs font-semibold tracking-wide border border-cyan-500/20">
                {course.category}
              </span>

              {isFull ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                  Full Cohort
                </span>
              ) : isLimited ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                  Limited Seats ({spotsLeft} spots left)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Open for Enrollment</span>
                </span>
              )}
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              {course.name}
            </h1>

            {/* Instructor Block */}
            <div className="flex items-center gap-4 mt-6 p-4 rounded-xl bg-[#0f1422] border border-white/[0.04]">
              <div className="size-12 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#06b6d4] flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0">
                {instructorInitials}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold text-white">{course.instructor}</span>
                  <span className="material-symbols-outlined text-[#06b6d4] text-[16px]">verified</span>
                </div>
                <span className="text-xs text-slate-400">Lead Technical Instructor • PKS Education</span>
              </div>
            </div>
          </div>

          {/* Course Overview / Syllabus Section */}
          <div className="bg-[#151b2c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">description</span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white">Course Syllabus &amp; Overview</h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {course.description ||
                'This course provides comprehensive, hands-on learning designed to bridge foundational understanding with production engineering execution. Detailed syllabus modules will be guided directly by the instructor.'}
            </div>
          </div>

          {/* Key Course Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#151b2c] border border-white/[0.08]">
              <div className="text-slate-400 text-xs mb-1">Subject Domain</div>
              <div className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-sm sm:text-base">
                {course.category}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151b2c] border border-white/[0.08]">
              <div className="text-slate-400 text-xs mb-1">Maximum Cohort Limit</div>
              <div className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-sm sm:text-base font-mono">
                {course.capacity} Students
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151b2c] border border-white/[0.08] col-span-2 sm:col-span-1">
              <div className="text-slate-400 text-xs mb-1">Registration Status</div>
              <div className="font-['Plus_Jakarta_Sans'] font-semibold text-[#06b6d4] text-sm sm:text-base">
                {isFull ? 'Waitlist Only' : 'Active Intake'}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Enrollment Sidebar Widget */}
        <aside className="sticky top-24 bg-[#151b2c] border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tuition Investment
            </span>
            <div className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-white tracking-tight mt-1">
              {formatFee(course.fee)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">One-time payment • Full lifetime access</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f1422] border border-white/[0.04] flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Class Occupancy</span>
              <span
                className={`font-bold ${
                  isFull ? 'text-rose-400' : isLimited ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {count} / {capacity}
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
              <span>{percentage}% Booked</span>
              <span>{isFull ? '0 spots left' : `${spotsLeft} spots left`}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isFull
                ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-white/5'
                : 'bg-[#4f46e5] text-white hover:bg-[#6366f1] shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:shadow-[0_0_26px_rgba(79,70,229,0.5)]'
            }`}
            disabled={isFull || busy}
            onClick={enroll}
          >
            {busy ? (
              <span>Confirming enrollment...</span>
            ) : isFull ? (
              <span>Cohort is Full</span>
            ) : user ? (
              <>
                <span>Enroll in Course</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </>
            ) : (
              <>
                <span>Sign in to Enroll</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">lock</span>
              <span>Atomic race-condition protected registration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">verified_user</span>
              <span>Official course completion certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff] text-[18px]">support_agent</span>
              <span>Direct instructor mentorship &amp; code reviews</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
