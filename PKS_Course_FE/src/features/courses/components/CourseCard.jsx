export default function CourseCard({ course, onEnroll, busy }) {
  const full = course.enrollment_status === 'FULL'
  return <article className="flex min-h-64 flex-col rounded-xl border border-[#dce3d9] bg-[#fbfcf7] p-6 shadow-[0_20px_50px_rgba(31,54,43,.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(31,54,43,.13)]">
    <div className="flex items-center justify-between"><span className="rounded-full bg-[#e7f1d2] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#58713e]">{course.category}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${full ? 'border-[#efb0a1] text-[#e36d4f]' : 'border-[#bbd68f] text-[#50713f]'}`}>{full ? 'Full' : 'Open'}</span></div>
    <h3 className="mt-8 font-['Space_Grotesk'] text-2xl font-semibold tracking-tight">{course.name}</h3><p className="mt-1 text-sm text-[#6a7771]">Led by {course.instructor}</p><p className="my-5 text-sm leading-relaxed text-[#6a7771]">{course.description || 'A practical path to build confidence through guided learning.'}</p>
    <div className="mt-auto flex items-center justify-between text-xs text-[#6a7771]"><span>{course.enrolled_count ?? 0} / {course.capacity} enrolled</span>{onEnroll && <button className="rounded-md bg-[#bfdc72] px-3 py-2 text-xs font-bold text-[#213936] disabled:cursor-not-allowed disabled:opacity-50" disabled={full || busy} onClick={() => onEnroll(course.id)}>{busy ? 'Joining...' : full ? 'Full' : 'Enroll'}</button>}</div>
  </article>
}
