import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  async function signOut() { await logout(); navigate('/login') }
  return <div className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,#e4edc9_0,transparent_25rem),#f3f5ee] text-[#1c2a29]">
    <header className="sticky top-0 z-10 flex min-h-[76px] flex-wrap items-center gap-5 border-b border-[#dce3d9] bg-[#fbfcf7]/85 px-5 backdrop-blur-md md:gap-10 md:px-[5vw]">
      <Link className="flex items-center gap-2.5 font-['Space_Grotesk'] font-bold" to="/courses"><span className="grid size-8 place-items-center rounded-lg bg-[#213936] text-xs text-[#bfdc72]">PK</span><span>Course Portal</span></Link>
      <nav className="order-3 flex w-full gap-5 text-sm text-[#6a7771] md:order-none md:w-auto md:flex-1"><Link to="/courses">Explore</Link>{user?.role === 'STUDENT' && <Link to="/my-courses">My courses</Link>}{user?.role === 'ADMIN' && <Link to="/admin">Admin desk</Link>}</nav>
      <div className="ml-auto flex items-center gap-3">{user ? <><span className="hidden text-xs text-[#6a7771] sm:inline">{user.full_name} <b className="ml-1 text-[#1c2a29]">{user.role}</b></span><button className="rounded-md px-3 py-2 text-sm font-bold hover:bg-[#e7f1d2]" onClick={signOut}>Log out</button></> : <Link className="rounded-md bg-[#213936] px-4 py-2.5 text-sm font-bold text-[#f4f7e9]" to="/login">Log in</Link>}</div>
    </header>
    <main className="mx-auto w-[calc(100%-28px)] max-w-6xl py-12 md:w-[calc(100%-80px)] md:py-[72px]">{children}</main>
  </div>
}
