import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import api from '../services/api'
import { FaFileContract, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle, FaShieldAlt, FaArrowRight, FaClock } from 'react-icons/fa'

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

      const [polizasRes, pagosPendientesRes, misPagosRes, siniestrosRes] = await Promise.all([
        api.get('/polizas/mis-polizas'),
        api.get('/pagos/pendientes'),
        api.get('/pagos/mis-pagos'),
        api.get('/siniestros/mis-siniestros')
      ])

      const polizas = polizasRes.data.data || []
      const polizasActivas = polizas.filter(p => p.estado === 'activa')
      const pagosPendientes = pagosPendientesRes.data.data || []
      const todosPagos = misPagosRes.data.data || []
      const pagosRealizados = todosPagos.filter(p => p.estado === 'pagado')
      const totalPagado = pagosRealizados.reduce((sum, pago) => sum + Number(pago.monto || 0), 0)
      const siniestros = siniestrosRes.data.data || []
      const siniestrosAbiertos = siniestros.filter(s => ['Reportado', 'En_tramite'].includes(s.estado))

      setStats({
        polizasActivas: polizasActivas.length,
        pagosPendientes: pagosPendientes.length,
        siniestrosAbiertos: siniestrosAbiertos.length,
        totalPagado: totalPagado
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
      // Suppressing error for demo/mock flows if API fails
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-brand-text-secondary text-sm">Cargando su información personal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-utpl-blue to-blue-900 rounded-xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hola, {user?.nombres?.split(' ')[0]}</h1>
          <p className="text-blue-100 opacity-90 max-w-lg">
            Bienvenido al portal de asegurados de la UTPL. Aquí puedes gestionar tus pólizas, realizar pagos y reportar siniestros con total seguridad.
          </p>
        </div>
        <div className="hidden md:block opacity-80">
          <FaShieldAlt className="text-8xl text-utpl-gold" />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Polizas Card */}
        <Link to="/mis-polizas" className="card hover:shadow-xl transition-shadow border-t-4 border-t-utpl-blue group cursor-pointer p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-utpl-blue group-hover:text-white transition-colors">
              <FaFileContract className="text-xl text-utpl-blue group-hover:text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mis Pólizas</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{stats.polizasActivas}</span>
            <span className="text-sm text-gray-500">Activas</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Cobertura vigente actual</p>
        </Link>

        {/* Pagos Pendientes Card */}
        <Link to="/pagos" className="card hover:shadow-xl transition-shadow border-t-4 border-t-utpl-gold group cursor-pointer p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg group-hover:bg-utpl-gold group-hover:text-white transition-colors">
              <FaMoneyBillWave className="text-xl text-utpl-gold group-hover:text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Por Pagar</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{stats.pagosPendientes}</span>
            <span className="text-sm text-gray-500">Pendientes</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Evita la suspensión del servicio</p>
        </Link>

        {/* Siniestros Card */}
        <Link to="/siniestros" className="card hover:shadow-xl transition-shadow border-t-4 border-t-red-500 group cursor-pointer p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
              <FaExclamationTriangle className="text-xl text-red-500 group-hover:text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Siniestros</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{stats.siniestrosAbiertos}</span>
            <span className="text-sm text-gray-500">En Curso</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Reclamaciones activas</p>
        </Link>

        {/* Total Pagado */}
        <div className="card p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <FaCheckCircle className="text-xl text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Histórico</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">${stats.totalPagado.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Total pagado en primas</p>
        </div>

      </div>

      {/* Quick Actions & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 card bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Acciones Frecuentes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/siniestros" className="group p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <FaExclamationTriangle />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">Reportar Siniestro</h4>
                <p className="text-xs text-gray-500">Iniciar nuevo reclamo</p>
              </div>
              <FaArrowRight className="ml-auto text-gray-300 group-hover:text-blue-500" />
            </Link>

            <Link to="/pagos" className="group p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <FaMoneyBillWave />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-700">Realizar Pago</h4>
                <p className="text-xs text-gray-500">Pagar primas pendientes</p>
              </div>
              <FaArrowRight className="ml-auto text-gray-300 group-hover:text-green-500" />
            </Link>

            <Link to="/mis-polizas" className="group p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <FaFileContract />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">Ver Certificado</h4>
                <p className="text-xs text-gray-500">Descargar documentación</p>
              </div>
              <FaArrowRight className="ml-auto text-gray-300 group-hover:text-purple-500" />
            </Link>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="card bg-gray-50 rounded-lg p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <FaClock className="text-utpl-gold" /> Recordatorios
          </h3>
          <ul className="space-y-4">
            <li className="text-sm text-gray-600 pb-3 border-b border-gray-200">
              <span className="block font-semibold text-gray-800 mb-1">Vencimiento Mensual</span>
              Recuerda que tus primas vencen el día 5 de cada mes.
            </li>
            <li className="text-sm text-gray-600 pb-3 border-b border-gray-200">
              <span className="block font-semibold text-gray-800 mb-1">Reporte 24h</span>
              Los siniestros deben ser reportados dentro de las 24 horas del suceso.
            </li>
            <li className="text-sm text-gray-600">
              <span className="block font-semibold text-gray-800 mb-1">Soporte</span>
              ¿Dudas? Escríbenos a <a href="#" className="text-utpl-blue underline">ayuda@segurosutpl.edu.ec</a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}
