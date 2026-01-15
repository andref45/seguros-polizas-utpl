import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import AdminLayout from './AdminLayout'
import { useAuth } from '../../store/AuthContext'
import { ROLES } from '../../constants/roles.js'

export default function Layout() {
  const { user } = useAuth()

  // Determine if user is Admin
  const isAdmin = user?.role === ROLES.ADMIN || user?.app_metadata?.role === ROLES.ADMIN

  if (isAdmin) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
