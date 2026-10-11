import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../lib/api'
import CourseCard from '../components/CourseCard'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState(null); const [error, setError] = useState('')
  useEffect(() => { apiRequest('/me/enrollments').then(setCourses).catch(err => setError(err.message)) }, [])
  if (error) return <div className="rounded-md border border-[#efc0b5] bg-[#fff0ec] p-3 text-sm text-[#a24735]">{error}</div>
  if (!courses) return <div className="grid min-h-40 place-items-center text-sm text-[#6a7771]">Loading your courses...</div>
  return <><div className="mb-10"><p className="mb-3 text-[11px] font-bold tracking-[1.8px] text-[#7b8a6e]">YOUR LEARNING</p><h1 className="font-['Space_Grotesk'] text-5xl font-semibold tracking-[-2px]">My courses.</h1><p className="mt-4 text-lg text-[#6a7771]">Everything you have chosen to learn.</p></div>{courses.length === 0 ? <div className="py-16 text-center text-[#6a7771]"><h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#1c2a29]">Your learning shelf is empty.</h2><p>Explore the catalog to get started.</p><Link className="mt-5 inline-flex rounded-md bg-[#213936] px-4 py-3 text-sm font-bold text-white" to="/courses">Explore courses</Link></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <CourseCard key={course.id} course={{ ...course, enrolled_count: 1, enrollment_status: 'ENROLLED' }} />)}</div>}</>
}
