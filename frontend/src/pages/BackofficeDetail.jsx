import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { FaFilePdf, FaCheck, FaTimes } from 'react-icons/fa'

export default function BackofficeDetail() {
    const { id } = useParams()
    const [claim, setClaim] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    // Mock data loader until GET /siniestros/{id} is ready
    useEffect(() => {
        // Simulated load
        setLoading(false)
    }, [id])

    const handleUpdateStatus = async (newStatus) => {
        try {
            setProcessing(true)
            await api.patch(`/siniestros/${id}`, { estado: newStatus })
            // Reload or update local state
            setClaim(prev => ({ ...prev, estado: newStatus }))
            setProcessing(false)
        } catch (err) {
            alert('Error updating status: ' + err.message)
            setProcessing(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Cargando caso...</div>
    if (!claim) return <div className="p-8 text-center">Caso no encontrado (Mock Mode - Implement GET API)</div>

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Caso #{id.slice(0, 8)}...</h1>
                    <p className="text-gray-500">Fecha Defunción: {new Date(claim.fecha_defuncion).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-gray-500 font-medium">Estado Actual</span>
                    <span className="text-xl font-bold text-blue-600">{claim.estado}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-4">Información del Fallecido</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Cédula:</span> {claim.cedula_fallecido}</p>
                        <p><span className="font-medium">Causa:</span> {claim.causa || 'No especificada'}</p>
                    </div>

                    <h2 className="font-bold text-lg mt-6 mb-4 border-t pt-4">Información del Reportante</h2>
                    {claim.polizas?.usuarios ? (
                        <div className="space-y-2">
                            <p><span className="font-medium">Nombre:</span> {claim.polizas.usuarios.nombres} {claim.polizas.usuarios.apellidos}</p>
                            <p><span className="font-medium">Teléfono:</span> {claim.polizas.usuarios.telefono || 'No registrado'}</p>
                            <p><span className="font-medium">Email:</span> {claim.polizas.usuarios.email || 'No disponible'}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Información de usuario no disponible.</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-4">Acciones de Gestión</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUpdateStatus('En_tramite')}
                            disabled={claim.estado !== 'Reportado' || processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Procesar (En Trámite)
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('Pagado')}
                            disabled={claim.estado !== 'En_tramite' || processing}
                            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Aprobar Pago
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-bold text-lg mb-4">Documentos y Evidencias</h2>
                {(!claim.documentos || claim.documentos.length === 0) ? (
                    <p className="text-gray-500 italic">No hay documentos adjuntos.</p>
                ) : (
                    <ul className="space-y-4">
                        {claim.documentos.map(doc => (
                            <li key={doc.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                    <FaFilePdf className="text-red-500 text-xl" />
                                    <div>
                                        <p className="font-medium">{doc.tipo}</p>
                                        <p className="text-xs text-gray-500">Hash: {doc.hash?.slice(0, 10)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm px-2 py-1 rounded 
                                    ${doc.estado_doc === 'Validado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {doc.estado_doc}
                                    </span>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ver PDF
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
