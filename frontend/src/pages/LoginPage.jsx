import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/dashboard')
        } else {
          navigate('/info')
        }
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Pólizas
            </h1>
            <p className="text-gray-600">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
