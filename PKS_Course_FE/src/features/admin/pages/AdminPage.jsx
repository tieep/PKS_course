import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import { formatDate, formatFee } from '../../../lib/formatters'

const emptyCourse = {
  name: '',
  category: 'Frontend',
  description: '',
  instructor: '',
  fee: 0,
  isHidden: false,
  capacity: 20,
}

export default function AdminPage() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(emptyCourse)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')

  async function loadCourses() {
    setLoading(true)
    try {
      const data = await apiRequest('/admin/courses')
      setCourses(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    apiRequest('/admin/courses')
      .then((data) => {
        if (active) setCourses(data)
      })
      .catch((error) => {
        if (active) toast.error(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function updateField(field, value) {
    const numericFields = ['capacity', 'fee']
    setForm((current) => ({
      ...current,
      [field]: numericFields.includes(field) ? Number(value) : value,
    }))
  }

  function openCreate() {
    setForm(emptyCourse)
    setFormOpen(true)
  }

  function openEdit(course) {
    setForm({ ...course, isHidden: Boolean(course.is_hidden) })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setForm(emptyCourse)
  }

  async function saveCourse(event) {
    event.preventDefault()
    const isEditing = Boolean(form.id)

    try {
      await apiRequest(isEditing ? `/admin/courses/${form.id}` : '/admin/courses', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      toast.success(isEditing ? 'Course updated successfully.' : 'Course created successfully.')
      closeForm()
      await loadCourses()
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function toggleVisibility(course) {
    try {
      await apiRequest(`/admin/courses/${course.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isHidden: !course.is_hidden }),
      })
      toast.success(course.is_hidden ? 'Course is now visible.' : 'Course is now hidden.')
      await loadCourses()
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function deleteCourse(courseId) {
    try {
      await apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' })
      toast.success('Course deleted successfully.')
      await loadCourses()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCourseToDelete(null)
    }
  }

  async function openStudents(course) {
    setSelectedCourse(course)
    try {
      const data = await apiRequest(`/admin/courses/${course.id}/students`)
      setStudents(data)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Filtered course calculations
  const totalCourses = courses.length
  const visibleCourses = courses.filter((c) => !c.is_hidden).length
  const hiddenCourses = courses.filter((c) => c.is_hidden).length
  const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)
  const totalCapacity = courses.reduce((sum, c) => sum + (c.capacity || 0), 0)
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter

    const matchesVisibility =
      visibilityFilter === 'all' ||
      (visibilityFilter === 'visible' && !c.is_hidden) ||
      (visibilityFilter === 'hidden' && c.is_hidden)

    return matchesSearch && matchesCategory && matchesVisibility
  })

  return (
    <div className="flex flex-col gap-8">
      {/* Admin Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06b6d4] mb-2">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Administrative Console</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Course Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure catalog offerings, capacity limits, visibility states, and review enrolled cohorts.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] hover:bg-[#6366f1] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] transition-all shrink-0"
          onClick={openCreate}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Course</span>
        </button>
      </header>

      {/* KPI Metric Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Courses */}
        <div className="p-5 rounded-2xl bg-[#151b2c] border border-white/[0.08] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Courses</span>
            <span className="material-symbols-outlined text-[#c3c0ff] text-[20px]">library_books</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-white">{totalCourses}</span>
            <span className="text-xs font-mono text-slate-400">in repository</span>
          </div>
          <div className="w-full bg-[#252f48] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#4f46e5] h-full rounded-full w-full" />
          </div>
        </div>

        {/* Metric 2: Visible Courses */}
        <div className="p-5 rounded-2xl bg-[#151b2c] border border-white/[0.08] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active &amp; Visible</span>
            <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">visibility</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#06b6d4]">{visibleCourses}</span>
            <span className="text-xs font-mono text-slate-400">/ {totalCourses} courses</span>
          </div>
          <div className="w-full bg-[#252f48] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#06b6d4] h-full rounded-full"
              style={{ width: `${totalCourses > 0 ? (visibleCourses / totalCourses) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Hidden Courses */}
        <div className="p-5 rounded-2xl bg-[#151b2c] border border-white/[0.08] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Hidden / Archived</span>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">visibility_off</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-slate-400">{hiddenCourses}</span>
            <span className="text-xs font-mono text-slate-500">hidden from public</span>
          </div>
          <div className="w-full bg-[#252f48] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-slate-500 h-full rounded-full"
              style={{ width: `${totalCourses > 0 ? (hiddenCourses / totalCourses) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Total Occupancy */}
        <div className="p-5 rounded-2xl bg-[#151b2c] border border-white/[0.08] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Seat Occupancy</span>
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">group</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-white">{totalEnrolled}</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              / {totalCapacity} ({overallOccupancy}%)
            </span>
          </div>
          <div className="w-full bg-[#252f48] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${overallOccupancy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="bg-[#0f1422] p-4 rounded-xl border border-white/[0.08] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#1c2438] text-white placeholder:text-slate-500 text-xs outline-none focus:ring-2 focus:ring-[#4f46e5] border border-white/[0.06]"
              placeholder="Search by course or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-[#1c2438] text-slate-200 text-xs font-semibold pl-3 pr-8 py-2 rounded-lg border border-white/[0.06] outline-none cursor-pointer focus:ring-2 focus:ring-[#4f46e5]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Fullstack">Fullstack</option>
              <option value="Database">Database</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Visibility Filter Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-[#151b2c] border border-white/[0.06]">
            <button
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                visibilityFilter === 'all'
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setVisibilityFilter('all')}
            >
              All ({totalCourses})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                visibilityFilter === 'visible'
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setVisibilityFilter('visible')}
            >
              Visible ({visibleCourses})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                visibilityFilter === 'hidden'
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setVisibilityFilter('hidden')}
            >
              Hidden ({hiddenCourses})
            </button>
          </div>
        </div>

        <Link
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
          to="/courses"
        >
          <span>View Public Catalog</span>
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </Link>
      </div>

      {/* Course Data Table & Mobile List */}
      <section>
        {loading ? (
          <div className="h-64 rounded-2xl bg-[#151b2c] border border-white/[0.08] grid place-items-center text-sm text-slate-400 animate-pulse">
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#151b2c]/40 p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">folder_off</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white">No courses match your criteria</h2>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151b2c] shadow-xl">
              <table className="w-full table-fixed border-collapse text-left text-xs text-slate-200">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="border-b border-white/[0.08] bg-[#0f1422] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Course Details</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Tuition</th>
                    <th className="px-4 py-4">Enrollment Ratio</th>
                    <th className="px-4 py-4 text-center">Visibility</th>
                    <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredCourses.map((c) => (
                    <tr className="hover:bg-[#1c2438]/60 transition-colors" key={c.id}>
                      <td className="px-5 py-4">
                        <p className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Instructor: {c.instructor}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-[#06b6d4] text-[11px] font-semibold border border-cyan-500/20">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-white">{formatFee(c.fee)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5 font-mono">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">
                              {c.enrolled_count} / {c.capacity}
                            </span>
                            <span className="text-slate-500 font-bold">
                              {c.capacity > 0 ? Math.round((c.enrolled_count / c.capacity) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-[#252f48] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.enrolled_count >= c.capacity ? 'bg-rose-500' : 'bg-emerald-400'
                              }`}
                              style={{
                                width: `${c.capacity > 0 ? Math.min(100, (c.enrolled_count / c.capacity) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            c.is_hidden
                              ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${c.is_hidden ? 'bg-slate-400' : 'bg-emerald-400'}`}
                          />
                          <span>{c.is_hidden ? 'Hidden' : 'Visible'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => openEdit(c)}
                            title="Edit course"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-[#06b6d4] hover:bg-cyan-500/10 transition-colors"
                            onClick={() => openStudents(c)}
                            title="View enrolled students"
                          >
                            <span className="material-symbols-outlined text-[18px]">group</span>
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => toggleVisibility(c)}
                            title={c.is_hidden ? 'Make visible' : 'Hide from catalog'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {c.is_hidden ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                            onClick={() => setCourseToDelete(c)}
                            title="Delete course"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="grid gap-4 md:hidden">
              {filteredCourses.map((c) => (
                <article
                  className="rounded-2xl border border-white/[0.08] bg-[#151b2c] p-5 shadow-lg flex flex-col gap-4"
                  key={c.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white">{c.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{c.instructor}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.is_hidden
                          ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {c.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs font-mono border-y border-white/[0.06] py-3">
                    <div>
                      <dt className="text-slate-500">Category</dt>
                      <dd className="text-white font-semibold mt-0.5">{c.category}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Tuition</dt>
                      <dd className="text-[#06b6d4] font-bold mt-0.5">{formatFee(c.fee)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500">Capacity</dt>
                      <dd className="text-white font-semibold mt-0.5">
                        {c.enrolled_count} / {c.capacity} students
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      className="flex-1 py-2 px-3 rounded-lg bg-[#252f48] text-white text-xs font-semibold hover:bg-[#313b55]"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/20 text-[#06b6d4] text-xs font-semibold hover:bg-cyan-500/30 border border-cyan-500/30"
                      onClick={() => openStudents(c)}
                    >
                      Students
                    </button>
                    <button
                      className="py-2 px-3 rounded-lg bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
                      onClick={() => toggleVisibility(c)}
                    >
                      {c.is_hidden ? 'Show' : 'Hide'}
                    </button>
                    <button
                      className="py-2 px-3 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 border border-rose-500/20"
                      onClick={() => setCourseToDelete(c)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Modals */}
      {formOpen && (
        <CourseModal
          form={form}
          loading={loading}
          isEditing={Boolean(form.id)}
          onChange={updateField}
          onSubmit={saveCourse}
          onClose={closeForm}
        />
      )}

      {selectedCourse && (
        <StudentModal
          course={selectedCourse}
          students={students}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {courseToDelete && (
        <DeleteModal
          course={courseToDelete}
          onCancel={() => setCourseToDelete(null)}
          onConfirm={() => deleteCourse(courseToDelete.id)}
        />
      )}
    </div>
  )
}

function CourseModal({ form, loading, isEditing, onChange, onSubmit, onClose }) {
  return (
    <Modal onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-[10px] font-bold tracking-[2px] text-[#06b6d4] uppercase">
              {isEditing ? 'UPDATE SPECIFICATIONS' : 'NEW COURSE DEFINITION'}
            </p>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white mt-1">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h2>
          </div>
          <button
            className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            type="button"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <AdminField
          label="Course Name"
          value={form.name}
          onChange={(value) => onChange('name', value)}
          placeholder="e.g. Distributed Systems Architecture"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
            <span>Category</span>
            <select
              className="rounded-xl border border-white/10 bg-[#0f1422] px-4 py-2.5 text-xs text-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 cursor-pointer"
              value={form.category}
              onChange={(e) => onChange('category', e.target.value)}
              required
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Fullstack">Fullstack</option>
              <option value="Database">Database</option>
            </select>
          </label>

          <AdminField
            label="Lead Instructor"
            value={form.instructor}
            onChange={(value) => onChange('instructor', value)}
            placeholder="e.g. Le Minh Hoang"
            required
          />
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
          <span>Course Description</span>
          <textarea
            className="min-h-24 rounded-xl border border-white/10 bg-[#0f1422] px-4 py-3 text-xs text-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 resize-y"
            placeholder="Outline course objectives, scope and prerequisites..."
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Tuition Fee (VND)"
            type="number"
            min="0"
            step="1000"
            value={form.fee}
            onChange={(value) => onChange('fee', value)}
            required
          />
          <AdminField
            label="Cohort Capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(value) => onChange('capacity', value)}
            required
          />
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#6366f1] text-xs font-bold text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] transition-all disabled:opacity-50"
            disabled={loading}
          >
            {isEditing ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function AdminField({ label, type = 'text', value, onChange, placeholder, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
      <span>{label}</span>
      <input
        className="rounded-xl border border-white/10 bg-[#0f1422] px-4 py-2.5 text-xs text-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 placeholder:text-slate-500"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

function StudentModal({ course, students, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-[10px] font-bold tracking-[2px] text-[#06b6d4] uppercase">
              REGISTERED COHORT ROSTER
            </p>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white mt-1">
              {course.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Total Enrolled: {students.length} / {course.capacity} students
            </p>
          </div>
          <button
            className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">person_off</span>
            <p className="font-semibold text-sm text-slate-300">No students enrolled yet</p>
            <p className="text-xs text-slate-500 mt-1">This cohort is currently open and awaiting registrations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0f1422]">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-[#151b2c] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3 text-center">Enrollment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {students.map((student) => (
                  <tr className="hover:bg-white/[0.02] transition-colors" key={student.id}>
                    <td className="px-4 py-3.5 font-semibold text-white">{student.full_name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">{student.email}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {formatDate(student.enrolled_at)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                        {student.status || 'CONFIRMED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            className="px-4 py-2 rounded-xl bg-[#252f48] text-white hover:bg-[#313b55] text-xs font-semibold transition-all"
            onClick={onClose}
          >
            Close Roster
          </button>
        </div>
      </div>
    </Modal>
  )
}

function DeleteModal({ course, onCancel, onConfirm }) {
  return (
    <Modal onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
            Delete “{course.name}”?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            This action is irreversible. If students are currently enrolled in this course,
            the backend server will strictly prevent deletion to preserve data integrity.
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg transition-all"
            onClick={onConfirm}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#070a12]/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#1c2438] p-6 text-slate-200 shadow-2xl ${
          wide ? 'max-w-4xl' : 'max-w-xl'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
