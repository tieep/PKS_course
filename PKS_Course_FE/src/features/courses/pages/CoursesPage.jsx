import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import { useAuth } from '../../auth/authContext'
import CourseCard from '../components/CourseCard'

export default function CoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyCourseId, setBusyCourseId] = useState(null)

  async function fetchCourses() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    const data = await apiRequest(`/courses?${params.toString()}`)
    setCourses(data)
    setError('')
  }

  useEffect(() => {
    let active = true
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    apiRequest(`/courses?${params.toString()}`)
      .then((data) => {
        if (active) {
          setCourses(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, category])

  useEffect(() => {
    let active = true
    apiRequest('/courses')
      .then((data) => {
        if (active) setCategories([...new Set(data.map((c) => c.category))])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  async function handleEnroll(courseId) {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`)
      return
    }

    if (user.role !== 'STUDENT') {
      toast.error('Only student accounts can enroll in courses.')
      return
    }

    setBusyCourseId(courseId)
    try {
      await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' })
      toast.success('Enrollment confirmed successfully!')
      await fetchCourses()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusyCourseId(null)
    }
  }

  // Filter courses by status on client
  const filteredCourses = courses.filter((course) => {
    const isFull = course.enrollment_status === 'FULL' || (course.enrolled_count >= course.capacity)
    if (statusFilter === 'available') return !isFull
    if (statusFilter === 'full') return isFull
    return true
  })

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner Component */}
      <section className="relative rounded-2xl bg-gradient-to-r from-[#151b2c] via-[#1c2438] to-[#151b2c] p-7 md:p-10 border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#4f46e5]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-72 h-72 bg-[#06b6d4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col max-w-2xl gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0e18]/80 text-[#06b6d4] w-fit border border-cyan-500/20 shadow-sm text-xs">
              <span className="size-2 rounded-full bg-[#06b6d4] animate-pulse" />
              <span className="font-semibold uppercase tracking-wider">Spring 2026 Term</span>
              <span className="text-white/30">•</span>
              <span className="text-slate-300 font-mono">
                {courses.length} courses open for enrollment
              </span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mt-1">
              Explore Tech Courses{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] via-[#c3c0ff] to-[#8b5cf6]">
                2026
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Practitioner-led roadmaps designed for engineers. Build foundational confidence in
              distributed systems, modern RESTful APIs, database internals, and fullstack frameworks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">verified</span>
                <span>Verified Certification</span>
              </div>
              <div className="size-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">terminal</span>
                <span>Production Code Labs</span>
              </div>
              <div className="size-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">group</span>
                <span>Limited Cohort Sizing</span>
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="pt-2">
                <Link
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4f46e5]/20 hover:bg-[#4f46e5]/30 text-indigo-300 border border-indigo-400/30 text-xs font-bold transition-all"
                  to="/admin"
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  <span>Manage courses in Admin Workspace →</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Metrics Widget */}
          <div className="flex flex-col gap-3 w-full lg:w-72 bg-[#0a0e18]/80 backdrop-blur-md p-5 rounded-xl border border-white/[0.08] shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Course Catalog</span>
              <span className="font-mono text-[#06b6d4] font-bold">{courses.length} Active</span>
            </div>
            <div className="w-full bg-[#1c2438] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] h-full rounded-full w-full" />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">System Uptime</span>
              <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>100% Online</span>
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="material-symbols-outlined text-[#c3c0ff] text-[18px]">bolt</span>
                <span>Early Enrollment</span>
              </div>
              <span className="font-mono text-[11px] text-[#c3c0ff] bg-[#4f46e5]/30 px-2 py-0.5 rounded border border-indigo-400/20">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Filter & Search Suite */}
      <section className="flex flex-col gap-4 bg-[#0f1422] p-4 rounded-xl border border-white/[0.08] shadow-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="w-full bg-[#1c2438] text-white placeholder:text-slate-500 pl-11 pr-14 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4f46e5] border border-white/[0.06] transition-all"
              placeholder="Search by course name or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-400 bg-[#0b0f19] px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </span>
          </div>

          {/* Category Filter Pills & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Pills */}
            <div className="flex items-center bg-[#151b2c] p-1 rounded-lg gap-1 border border-white/[0.06] overflow-x-auto max-w-full">
              <button
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  category === ''
                    ? 'bg-[#4f46e5] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setCategory('')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-[#4f46e5] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                className="appearance-none bg-[#1c2438] text-slate-200 text-xs font-semibold pl-3 pr-8 py-2.5 rounded-lg border border-white/[0.06] outline-none cursor-pointer focus:ring-2 focus:ring-[#4f46e5]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="available">Available only</option>
                <option value="full">Full only</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Course Grid / States */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-400 text-[22px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-[#151b2c] border border-white/[0.06] animate-pulse p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-24 bg-white/5 rounded-full" />
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="h-7 w-3/4 bg-white/10 rounded mb-3" />
                <div className="h-4 w-full bg-white/5 rounded mb-2" />
                <div className="h-4 w-2/3 bg-white/5 rounded mb-6" />
                <div className="h-16 w-full bg-white/5 rounded-xl mb-6" />
                <div className="h-3 w-full bg-white/5 rounded-full" />
              </div>
              <div className="h-12 w-full bg-white/5 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#151b2c]/40 p-12 text-center text-slate-400">
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-3">search_off</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">No courses match your criteria</h2>
          <p className="mt-2 text-sm text-slate-400">
            Try adjusting your search query, or clear active category filters.
          </p>
          {(search || category || statusFilter !== 'all') && (
            <button
              className="mt-5 px-4 py-2 rounded-lg bg-[#252f48] text-white hover:bg-[#313b55] text-xs font-semibold transition-all border border-white/10"
              onClick={() => {
                setSearch('')
                setCategory('')
                setStatusFilter('all')
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              busy={busyCourseId === course.id}
              enrollLabel={!user ? 'Log in to enroll' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
