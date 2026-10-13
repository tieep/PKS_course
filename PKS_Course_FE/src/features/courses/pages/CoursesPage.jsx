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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyCourseId, setBusyCourseId] = useState(null)

  async function fetchCourses() {
    const params = new URLSearchParams({ search, category })
    const data = await apiRequest(`/courses?${params.toString()}`)
    setCourses(data)
    setError('')
  }

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ search, category })

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
        if (active) setCategories([...new Set(data.map((course) => course.category))])
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
      toast.success('Enrollment confirmed.')
      await fetchCourses()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setBusyCourseId(null)
    }
  }

  return (
    <>
      <PageHeader courseCount={courses.length} isAdmin={user?.role === 'ADMIN'} />

      <CourseFilters
        search={search}
        category={category}
        categories={categories}
        onSearch={setSearch}
        onCategory={setCategory}
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
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
    </>
  )
}

function PageHeader({ courseCount, isAdmin }) {
  return (
    <header className="mb-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
      <div>
        <p className="mb-4 text-[11px] font-bold tracking-[2px] text-blue-300">
          STUDENT CATALOG / 2026
        </p>
        <h1 className="max-w-3xl font-['Space_Grotesk'] text-5xl font-semibold leading-[.95] tracking-[-2px] text-white md:text-7xl">
          Choose your next course.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
          Short, practical paths for deliberate progress.
        </p>
        {isAdmin && (
          <Link
            className="mt-5 inline-flex rounded-xl border border-blue-300/40 bg-blue-500/15 px-4 py-2.5 text-sm font-bold text-blue-100 transition hover:border-purple-300/60 hover:bg-purple-500/20 hover:text-white"
            to="/admin"
          >
            Open admin workspace →
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 px-6 py-5 text-white shadow-lg shadow-purple-500/20 md:min-w-36">
        <strong className="block font-['Space_Grotesk'] text-4xl">{courseCount}</strong>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
          visible courses
        </span>
      </div>
    </header>
  )
}

function CourseFilters({ search, category, categories, onSearch, onCategory }) {
  return (
    <section className="mb-7 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px]">
      <label className="grid gap-2 text-xs font-bold text-slate-300">
        Search courses or instructors
        <input
          className="rounded-xl border border-white/10 bg-[#111b31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15"
          placeholder="Try React or Nguyen..."
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      <label className="grid gap-2 text-xs font-bold text-slate-300">
        Category
        <select
          className="rounded-xl border border-white/10 bg-[#111b31] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          value={category}
          onChange={(event) => onCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </section>
  )
}

function LoadingState() {
  return (
    <div className="grid min-h-48 place-items-center text-sm font-semibold text-slate-400">
      Loading courses...
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 py-16 text-center text-slate-400">
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">No courses found</h2>
      <p className="mt-2">Try clearing your search or selecting another category.</p>
    </div>
  )
}

function ErrorMessage({ message }) {
  return (
    <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
      {message}
    </div>
  )
}
