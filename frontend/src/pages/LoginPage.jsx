import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { FaShieldAlt, FaEnvelope, FaLock, FaArrowRight, FaSpinner } from 'react-icons/fa'

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
          // Default user landing
          navigate('/info')
        }
      } else {
        setError('Contraseña incorrecta o usuario no encontrado.')
      }
    } catch (err) {
      setError('Error de conexión. Por favor intente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual Brand Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-utpl-blue relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-utpl-blue via-utpl-blue/90 to-blue-900/80"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <FaShieldAlt className="text-3xl text-utpl-gold" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Seguros UTPL</h1>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              Protegemos lo que más te importa.
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Gestiona tus pólizas, reporta siniestros y consulta tus pagos desde una plataforma segura y confiable.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © {new Date().getFullYear()} Seguros UTPL. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-soft border border-gray-100">

          <div className="text-center mb-8 lg:hidden">
            <FaShieldAlt className="text-4xl text-utpl-blue mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">Seguros UTPL</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder a tu cuenta.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md flex items-start gap-2 animate-pulse">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-utpl-blue focus:ring-utpl-blue sm:text-sm py-2.5"
                  placeholder="ejemplo@utpl.edu.ec"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <a href="#" className="text-xs font-medium text-utpl-blue hover:text-utpl-gold transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-utpl-blue focus:ring-utpl-blue sm:text-sm py-2.5"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-utpl-blue hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-utpl-blue transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Iniciando...
                </>
              ) : (
                <>
                  Ingresar <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta aún?{' '}
              <Link to="/register" className="font-semibold text-utpl-blue hover:text-utpl-gold transition-colors">
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
