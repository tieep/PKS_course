import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import { formatDate, formatFee, getInitials } from '../../../lib/formatters'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/me/enrollments')
      .then(setCourses)
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06b6d4] mb-2">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Student Dashboard</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-white tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your verified enrollments, registration schedules, and access learning portals.
          </p>
        </div>

        {courses && courses.length > 0 && (
          <div className="flex items-center gap-3 bg-[#151b2c] border border-white/[0.08] px-4 py-2.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Enrolled:</span>
            <span className="text-[#06b6d4] font-bold text-sm">{courses.length} courses</span>
          </div>
        )}
      </header>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {!error && !courses && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-[#151b2c] border border-white/[0.06] animate-pulse p-6"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!error && courses?.length === 0 && <EmptyEnrollments />}

      {/* Enrolled Courses Grid */}
      {!error && courses?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <EnrollmentCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function EnrollmentCard({ course }) {
  const instructorInitials = getInitials(course.instructor, 'IN')

  return (
    <article className="flex flex-col justify-between bg-[#151b2c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-[#06b6d4] text-xs font-semibold tracking-wide border border-cyan-500/20">
            {course.category}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span>{course.status || 'ENROLLED'}</span>
          </span>
        </div>

        <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2 line-clamp-1">
          {course.name}
        </h2>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-4 text-xs text-slate-400">
          <div className="size-6 rounded-full bg-[#4f46e5]/40 text-indigo-200 flex items-center justify-center font-bold text-[10px]">
            {instructorInitials}
          </div>
          <span>Instructor: <strong className="text-slate-200">{course.instructor}</strong></span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6">
          {course.description || 'Verified course registration.'}
        </p>

        {/* Course Details Info Table */}
        <dl className="grid gap-2 border-t border-white/[0.06] pt-4 text-xs font-mono">
          <div className="flex justify-between items-center">
            <dt className="text-slate-400">Tuition Paid</dt>
            <dd className="font-bold text-white">{formatFee(course.fee)}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-400">Enrolled Date</dt>
            <dd className="font-medium text-[#06b6d4]">{formatDate(course.enrolled_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.06]">
        <Link
          className="w-full py-2.5 px-4 rounded-xl bg-[#252f48] text-slate-200 hover:text-white hover:bg-[#313b55] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-white/[0.06]"
          to={`/courses/${course.id}`}
        >
          <span>View Course Details</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  )
}

function EmptyEnrollments() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-[#151b2c]/40 px-6 py-16 text-center text-slate-400 max-w-xl mx-auto my-6">
      <div className="size-16 rounded-2xl bg-[#1c2438] flex items-center justify-center mx-auto mb-4 text-[#06b6d4]">
        <span className="material-symbols-outlined text-3xl">auto_stories</span>
      </div>
      <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white">
        Your learning shelf is empty
      </h2>
      <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
        You haven&apos;t enrolled in any courses yet. Browse our catalog and start expanding your tech skills.
      </p>
      <Link
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] hover:bg-[#6366f1] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] transition-all"
        to="/courses"
      >
        <span>Explore Available Courses</span>
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </Link>
    </div>
  )
}
