import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { supabase } from '../services/supabaseClient'
import { FaFileContract, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    polizasActivas: 0,
    pagosPendientes: 0,
    siniestrosAbiertos: 0,
    totalPagado: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Obtener pólizas activas
      const { data: polizas, error: polizasError } = await supabase
        .from('polizas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('estado', 'activa')

      if (polizasError) throw polizasError

      // Obtener pagos pendientes
      const { data: pagosPendientes, error: pagosPendientesError } = await supabase
        .from('pagos')
        .select('*, polizas!inner(*)')
        .eq('polizas.usuario_id', user.id)
        .eq('estado', 'pendiente')

      if (pagosPendientesError) throw pagosPendientesError

      // Obtener pagos realizados
      const { data: pagosRealizados, error: pagosRealizadosError } = await supabase
        .from('pagos')
        .select('monto, polizas!inner(*)')
        .eq('polizas.usuario_id', user.id)
        .eq('estado', 'pagado')

      if (pagosRealizadosError) throw pagosRealizadosError

      // Obtener siniestros abiertos
      const { data: siniestros, error: siniestrosError } = await supabase
        .from('siniestros')
        .select('*, polizas!inner(*)')
        .eq('polizas.usuario_id', user.id)
        .in('estado', ['pendiente', 'en_revision'])

      if (siniestrosError) throw siniestrosError

      const totalPagado = pagosRealizados?.reduce((sum, pago) => sum + Number(pago.monto || 0), 0) || 0

      setStats({
        polizasActivas: polizas?.length || 0,
        pagosPendientes: pagosPendientes?.length || 0,
        siniestrosAbiertos: siniestros?.length || 0,
        totalPagado: totalPagado
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión de pólizas</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/mis-polizas"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pólizas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.polizasActivas}</p>
            </div>
            <FaFileContract className="text-4xl text-blue-500" />
          </div>
        </Link>

        <Link
          to="/pagos"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pagosPendientes}</p>
            </div>
            <FaExclamationTriangle className="text-4xl text-yellow-500" />
          </div>
        </Link>

        <Link
          to="/siniestros"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Siniestros Abiertos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.siniestrosAbiertos}</p>
            </div>
            <FaExclamationTriangle className="text-4xl text-red-500" />
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pagado</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalPagado.toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-4xl text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link
              to="/polizas"
              className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <p className="font-medium text-blue-900">Contratar Nueva Póliza</p>
              <p className="text-sm text-blue-700">Explora nuestros tipos de pólizas disponibles</p>
            </Link>
            <Link
              to="/pagos"
              className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <p className="font-medium text-green-900">Registrar Pago</p>
              <p className="text-sm text-green-700">Mantén tus pólizas al día</p>
            </Link>
            <Link
              to="/perfil"
              className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
            >
              <p className="font-medium text-purple-900">Ver Mi Perfil</p>
              <p className="text-sm text-purple-700">Actualiza tu información personal</p>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-500 text-xl mt-1" />
              <div>
                <p className="font-medium text-gray-900">Cobertura Completa</p>
                <p className="text-sm text-gray-600">Todas nuestras pólizas incluyen cobertura integral</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-500 text-xl mt-1" />
              <div>
                <p className="font-medium text-gray-900">Coaseguro 20%</p>
                <p className="text-sm text-gray-600">El usuario paga el 20% del siniestro</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-500 text-xl mt-1" />
              <div>
                <p className="font-medium text-gray-900">Vigencia 365 días</p>
                <p className="text-sm text-gray-600">Todas las pólizas tienen vigencia de 1 año</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
