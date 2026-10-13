import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'

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

  async function loadCourses() {
    setLoading(true)
    try {
      setCourses(await apiRequest('/admin/courses'))
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
      await apiRequest(
        isEditing ? `/admin/courses/${form.id}` : '/admin/courses',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(form),
        },
      )
      toast.success(isEditing ? 'Course updated.' : 'Course created.')
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
      toast.success('Course deleted.')
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
      setStudents(await apiRequest(`/admin/courses/${course.id}/students`))
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-slate-950/15 p-7 shadow-lg shadow-slate-950/10 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[2px] text-blue-200">ADMIN WORKSPACE</p>
          <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-[-1.5px] text-white md:text-5xl">Course management</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">Manage the catalog, enrollment capacity, visibility and student records.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-blue-600 hover:to-purple-700" onClick={openCreate}>+ Create course</button>
      </header>

      <div className="grid items-stretch gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
        <AdminSidebar courseCount={courses.length} />
        <section className="min-w-0">
          <CourseTable
            courses={courses}
            loading={loading}
            onEdit={openEdit}
            onDelete={setCourseToDelete}
            onStudents={openStudents}
            onToggleVisibility={toggleVisibility}
          />
        </section>
      </div>

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
    </>
  )
}

function AdminSidebar({ courseCount }) {
  return (
    <aside className="h-full rounded-3xl border border-white/10 bg-slate-950/25 p-4 shadow-xl shadow-slate-950/15">
      <div className="border-b border-white/10 px-3 pb-5">
        <p className="text-[10px] font-bold tracking-[2px] text-blue-200">PKS COURSE</p>
        <h2 className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
          Admin console
        </h2>
      </div>

      <nav className="mt-5 grid gap-2">
        <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/30">
          <span>Course management</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{courseCount}</span>
        </div>

        <Link
          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          to="/courses"
        >
          <span>Home</span>
          {/* <span>→</span> */}
        </Link>
      </nav>

      <div className="mt-6 border-t border-white/10 px-3 pt-5">
        <p className="text-xs leading-relaxed text-slate-400">
          Use Students in the table to open each course’s enrollment list.
        </p>
      </div>
    </aside>
  )
}

function CourseTable({ courses, loading, onEdit, onDelete, onStudents, onToggleVisibility }) {
  if (loading) {
    return <div className="grid min-h-48 place-items-center text-sm font-semibold text-slate-200">Loading courses...</div>
  }

  if (courses.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/25 p-12 text-center text-slate-300">No courses yet. Create the first course to start the catalog.</div>
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-3xl border border-white/20 bg-white shadow-[0_14px_36px_rgba(15,23,42,.18)] md:block">
      <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-sm text-slate-900">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[13%]" />
          <col className="w-[15%]" />
          <col className="w-[14%]" />
          <col className="w-[13%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-6 py-4">Course</th>
            <th className="px-4 py-4">Category</th>
            <th className="px-4 py-4">Fee</th>
            <th className="px-4 py-4 text-center">Capacity</th>
            <th className="px-4 py-4 text-center">Visibility</th>
            <th className="px-4 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/45" key={course.id}>
              <td className="px-6 py-5">
                <p className="font-['Space_Grotesk'] text-base font-semibold">{course.name}</p>
                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{course.instructor}</p>
              </td>
              <td className="px-4 py-5">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{course.category}</span>
              </td>
              <td className="px-4 py-5 font-semibold text-blue-700">{formatFee(course.fee)}</td>
              <td className="px-4 py-5 text-center whitespace-nowrap">
                <span className="font-semibold">{course.enrolled_count} / {course.capacity}</span>
                <span className="block text-xs text-slate-500">enrolled</span>
              </td>
              <td className="px-4 py-5 text-center">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${course.is_hidden ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                  {course.is_hidden ? 'Hidden' : 'Visible'}
                </span>
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-wrap justify-center gap-1">
                  <ActionButton onClick={() => onEdit(course)}>Edit</ActionButton>
                  <ActionButton onClick={() => onStudents(course)}>Students</ActionButton>
                  <ActionButton onClick={() => onToggleVisibility(course)}>{course.is_hidden ? 'Show' : 'Hide'}</ActionButton>
                  <button className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50" onClick={() => onDelete(course)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {courses.map((course) => (
          <MobileCourseCard
            key={course.id}
            course={course}
            onEdit={onEdit}
            onDelete={onDelete}
            onStudents={onStudents}
            onToggleVisibility={onToggleVisibility}
          />
        ))}
      </div>
    </>
  )
}

function MobileCourseCard({ course, onEdit, onDelete, onStudents, onToggleVisibility }) {
  return (
    <article className="rounded-2xl border border-white/20 bg-white p-5 text-slate-900 shadow-[0_10px_28px_rgba(15,23,42,.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-['Space_Grotesk'] text-lg font-semibold">{course.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{course.instructor}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${course.is_hidden ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
          {course.is_hidden ? 'Hidden' : 'Visible'}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-sm">
        <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Category</dt><dd className="mt-1 font-semibold text-blue-700">{course.category}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Fee</dt><dd className="mt-1 font-semibold text-blue-700">{formatFee(course.fee)}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Capacity</dt><dd className="mt-1 font-semibold">{course.enrolled_count} / {course.capacity} enrolled</dd></div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ActionButton onClick={() => onEdit(course)}>Edit</ActionButton>
        <ActionButton onClick={() => onStudents(course)}>Students</ActionButton>
        <ActionButton onClick={() => onToggleVisibility(course)}>{course.is_hidden ? 'Show course' : 'Hide course'}</ActionButton>
        <button className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50" onClick={() => onDelete(course)}>Delete</button>
      </div>
    </article>
  )
}

function ActionButton({ children, onClick }) {
  return <button className="rounded-lg px-2.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 hover:text-purple-700" onClick={onClick}>{children}</button>
}

function CourseModal({ form, loading, isEditing, onChange, onSubmit, onClose }) {
  return (
    <Modal onClose={onClose}>
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[2px] text-blue-600">{isEditing ? 'EDIT COURSE' : 'NEW COURSE'}</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">{isEditing ? 'Update course' : 'Create course'}</h2>
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50" type="button" onClick={onClose}>Close</button>
        </div>

        <AdminField label="Course name" value={form.name} onChange={(value) => onChange('name', value)} required />
        <AdminField label="Category" value={form.category} onChange={(value) => onChange('category', value)} required />
        <AdminField label="Instructor" value={form.instructor} onChange={(value) => onChange('instructor', value)} required />

        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Description
          <textarea className="min-h-28 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15" value={form.description} onChange={(event) => onChange('description', event.target.value)} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Fee (VND)" type="number" min="0" step="1000" value={form.fee} onChange={(value) => onChange('fee', value)} required />
          <AdminField label="Capacity" type="number" min="1" value={form.capacity} onChange={(value) => onChange('capacity', value)} required />
        </div>

        <button className="rounded-xl bg-linear-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:from-blue-600 hover:to-purple-700 disabled:opacity-40" disabled={loading}>
          {isEditing ? 'Save changes' : 'Create course'}
        </button>
      </form>
    </Modal>
  )
}

function AdminField({ label, type = 'text', value, onChange, ...props }) {
  return (
    <label className="grid gap-2 text-xs font-bold text-slate-600">
      {label}
      <input
        className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

function formatFee(fee) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(fee || 0))
}

function StudentModal({ course, students, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[2px] text-blue-600">ENROLLMENTS</p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">{course.name}</h2>
        </div>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50" onClick={onClose}>Close</button>
      </div>
      {students.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No students enrolled yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Enrolled at</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{students.map((student) => <tr className="border-b border-slate-100" key={student.id}><td className="px-4 py-4 font-semibold">{student.full_name}</td><td className="px-4 py-4 text-slate-500">{student.email}</td><td className="px-4 py-4 text-slate-500">{student.course_name || course.name}</td><td className="px-4 py-4 text-slate-500">{new Date(student.enrolled_at).toLocaleDateString()}</td><td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{student.status || 'ENROLLED'}</span></td></tr>)}</tbody></table></div>}
    </Modal>
  )
}

function DeleteModal({ course, onCancel, onConfirm }) {
  return <Modal onClose={onCancel}><p className="text-xs font-bold uppercase tracking-widest text-red-500">Delete course</p><h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold">Delete “{course.name}”?</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">This action cannot be undone. Courses with enrolled students will be rejected by the server.</p><div className="mt-7 flex justify-end gap-3"><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold" onClick={onCancel}>Cancel</button><button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600" onClick={onConfirm}>Delete course</button></div></Modal>
}

function Modal({ children, onClose, wide = false }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/70 bg-white p-6 text-slate-900 shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>{children}</div></div>
}
