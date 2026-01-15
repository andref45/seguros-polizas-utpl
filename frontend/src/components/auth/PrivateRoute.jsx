import { Navigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role verification (if allowedRoles is provided)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.app_metadata?.role || user.role // Handle Supabase logic
    if (!allowedRoles.includes(userRole)) {
      // If user logs in but has insufficient role, redirect to a "safe" page or home
      // For now, redirect to /mis-polizas or just allow them to fall through to a 403 page
      // Ideally: <Navigate to="/unauthorized" /> but for MVP redirect to dashboard/home if accessible or login
      return <Navigate to="/mis-polizas" replace />
    }
  }

  return children
}
