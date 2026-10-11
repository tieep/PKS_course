import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-[#6a7771]">Loading your session...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/courses" replace />
  return children
}
