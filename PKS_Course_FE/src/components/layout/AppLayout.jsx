import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'
import { getInitials } from '../../lib/formatters'

const navClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? 'bg-[#4f46e5] text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] font-semibold'
      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
  }`

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await logout()
    navigate('/login')
  }

  const userInitials = getInitials(user?.full_name, 'U')

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#dfe2f1] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              className="flex items-center gap-3 focus:outline-none group"
              to={user?.role === 'ADMIN' ? '/admin' : '/courses'}
            >
              <div className="size-9 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#06b6d4] flex items-center justify-center font-bold text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] group-hover:shadow-[0_0_24px_rgba(79,70,229,0.5)] transition-all">
                <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-tight">PK</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  PKS Course
                </span>
                <span className="text-[10px] text-[#06b6d4] uppercase tracking-wider font-semibold leading-none">
                  Enrollment Portal
                </span>
              </div>
            </Link>

            {/* Nav pills for Student / Guest (Hidden for Admin as requested) */}
            {user?.role !== 'ADMIN' && (
              <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#0f1422] border border-white/[0.08]">
                <NavLink className={navClass} to="/courses">
                  Explore Courses
                </NavLink>
                {user?.role === 'STUDENT' && (
                  <NavLink className={navClass} to="/my-courses">
                    My Courses
                  </NavLink>
                )}
              </nav>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-[#4f46e5] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-white leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#06b6d4]">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10 text-xs font-semibold transition-all focus:outline-none"
                  onClick={signOut}
                  title="Sign out"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <Link
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#6366f1] text-white text-sm font-semibold shadow-[0_0_16px_rgba(79,70,229,0.35)] transition-all"
                to="/login"
              >
                <span>Sign in</span>
                <span className="material-symbols-outlined text-[16px]">login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 lg:px-10 py-8 lg:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#070a12] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PKS Technology &amp; Education. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Enterprise Learning System</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Online
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
