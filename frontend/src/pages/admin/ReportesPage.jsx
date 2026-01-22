import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FaChartBar, FaFileDownload, FaUsers, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'

export default function ReportesPage() {
    const [stats, setStats] = useState(null)
    const [nomina, setNomina] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [resGeneral, resNomina] = await Promise.all([
                api.get('/reportes/general'),
                api.get('/reportes/nomina')
            ])
            setStats(resGeneral.data.data)
            setNomina(resNomina.data.data)
        } catch (error) {
            console.error('Error cargando reportes:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        if (!nomina.length) return

        const headers = ["ID", "Empleado", "Cédula", "Tipo Usuario", "Total Prima", "Descuento Rol", "Aporte UTPL", "Detalle"]
        const rows = nomina.map(n => [
            n.id,
            n.empleado,
            `"${n.cedula}"`, // Force string for CSV
            n.tipo,
            n.total_prima,
            n.descuento_rol,
            n.aporte_utpl,
            n.detalle
        ])

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `reporte-nomina-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    if (loading) return <div className="p-8 text-center">Cargando reportes...</div>

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel de Reportes e Inteligencia</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-utpl-blue flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pólizas Activas</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats?.activePolicies}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full">
                        <FaClipboardList className="text-utpl-blue text-2xl" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Siniestros (Mes Actual)</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats?.monthlyClaims}</h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-full">
                        <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Usuarios</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats?.totalUsers}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full">
                        <FaUsers className="text-green-500 text-2xl" />
                    </div>
                </div>
            </div>

            {/* Nómina Report Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaChartBar className="text-utpl-blue" />
                            Reporte de Nómina (Corte Mensual)
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Generado automáticamente para descuento en rol de pagos. Regla 70/30 (o config).
                        </p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <FaFileDownload /> Exportar CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-semibold text-xs">
                            <tr>
                                <th className="px-6 py-4">Empleado</th>
                                <th className="px-6 py-4">Cédula</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Prima Total</th>
                                <th className="px-6 py-4 text-right bg-blue-50 text-blue-800">Descuento Rol</th>
                                <th className="px-6 py-4 text-right">Aporte UTPL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {nomina.length > 0 ? (
                                nomina.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.empleado}</td>
                                        <td className="px-6 py-4 text-gray-500">{row.cedula}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.tipo === 'docente' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {row.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">${Number(row.total_prima).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-700 bg-blue-50/50">
                                            ${row.descuento_rol}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">${row.aporte_utpl}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No hay datos para generar nómina este mes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
