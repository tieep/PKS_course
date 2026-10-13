import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen overflow-hidden bg-linear-to-b from-gray-700 to-gray-800 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-300/15 bg-gray-900/70 shadow-lg shadow-slate-950/15 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-5 px-5 md:px-10">
          <Link className="flex items-center gap-3" to={user?.role === 'ADMIN' ? '/admin' : '/courses'}>
            <span className="grid size-10 rotate-3 place-items-center rounded-xl bg-linear-to-r from-blue-500 to-purple-600 font-['Space_Grotesk'] text-sm font-bold text-white shadow-lg shadow-purple-500/30">
              PK
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-white">
              PKS Course
            </span>
          </Link>

          {user && user.role !== 'ADMIN' && (
            <nav className="ml-10 flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 shadow-inner shadow-slate-950/20">
              <NavLink className={navClass} to="/courses">
                Explore
              </NavLink>
              {user.role === 'STUDENT' && (
                <NavLink className={navClass} to="/my-courses">
                  My courses
                </NavLink>
              )}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">{user.full_name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
                    {user.role}
                  </p>
                </div>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold transition hover:border-blue-300 hover:bg-white/10"
                  onClick={signOut}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                className="rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition hover:from-blue-600 hover:to-purple-700"
                to="/login"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-5 py-12 md:px-10 md:py-16">
        {children}
      </main>
    </div>
  )
}
