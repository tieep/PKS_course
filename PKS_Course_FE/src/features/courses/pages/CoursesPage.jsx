import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../../lib/api'
import CourseCard from '../components/CourseCard'

export default function CoursesPage() {
  const [courses, setCourses] = useState([]); const [search, setSearch] = useState(''); const [category, setCategory] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(null)
  async function load() { setLoading(true); try { setCourses(await apiRequest(`/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`)); setError('') } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => {
    let active = true
    apiRequest(`/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`)
      .then(data => { if (active) { setCourses(data); setError(''); setLoading(false) } })
      .catch(err => { if (active) { setError(err.message); setLoading(false) } })
    return () => { active = false }
  }, [search, category])
  async function enroll(id) { setBusy(id); try { await apiRequest(`/courses/${id}/enroll`, { method: 'POST' }); toast.success('Enrollment confirmed.'); load() } catch (err) { toast.error(err.message) } finally { setBusy(null) } }
  const categories = [...new Set(courses.map(course => course.category))]
  return <><PageHeader count={courses.length} /><section className="mb-6 flex flex-col items-stretch gap-4 rounded-xl border border-[#dce3d9] bg-white/50 p-4 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-semibold text-[#6a7771]">Search<input className="mt-2 w-full rounded-md border border-[#dce3d9] bg-[#fbfcf7] px-3 py-2.5 outline-none focus:ring-4 focus:ring-[#bfdc72]/30" placeholder="Course or instructor" value={search} onChange={e => setSearch(e.target.value)} /></label><label className="text-xs font-semibold text-[#6a7771]">Category<select className="mt-2 w-full rounded-md border border-[#dce3d9] bg-[#fbfcf7] px-3 py-2.5 sm:w-48" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label></section>{error && <div className="mb-4 rounded-md border border-[#efc0b5] bg-[#fff0ec] p-3 text-sm text-[#a24735]">{error}</div>}{loading ? <div className="grid min-h-40 place-items-center text-sm text-[#6a7771]">Loading courses...</div> : courses.length === 0 ? <div className="py-16 text-center text-[#6a7771]"><h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#1c2a29]">No courses found</h2><p>Try clearing your search or selecting another category.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <CourseCard key={course.id} course={course} onEnroll={enroll} busy={busy === course.id} />)}</div>}</>
}

function PageHeader({ count }) { return <section className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-3 text-[11px] font-bold tracking-[1.8px] text-[#7b8a6e]">STUDENT CATALOG</p><h1 className="font-['Space_Grotesk'] text-5xl font-semibold leading-none tracking-[-2px] md:text-7xl">Choose your next course.</h1><p className="mt-4 text-lg text-[#6a7771]">A focused catalog for deliberate progress.</p></div><div className="border-l-4 border-[#bfdc72] px-5"><strong className="font-['Space_Grotesk'] text-4xl">{count}</strong><span className="block text-xs text-[#6a7771]">visible courses</span></div></section> }
