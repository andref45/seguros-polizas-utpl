import { FaInfoCircle, FaFileMedical, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function InfoPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Bienvenido al Portal de Seguros UTPL</h1>
                <p className="text-lg text-gray-600">
                    Gestiona tus trámites de siniestros y consulta información sobre tu cobertura de manera rápida y segura.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Reportar Siniestro */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <FaFileMedical size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Reportar Siniestro</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Si ha ocurrido un evento cubierto por tu póliza (fallecimiento), inicia el proceso de reclamación aquí.
                        Necesitarás adjuntar el certificado de defunción y otros documentos habilitantes en formato PDF.
                    </p>
                    <Link
                        to="/siniestros"
                        className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Iniciar Trámite
                    </Link>
                </div>

                {/* Card 2: Información & Ayuda */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <FaInfoCircle size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">¿Necesitas Ayuda?</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Si tienes dudas sobre tu cobertura, pagos o el estado de tu póliza, contacta directamente con administración.
                    </p>
                    <ul className="text-sm text-gray-500 mb-6 space-y-2 list-disc list-inside">
                        <li>Horario: Lunes a Viernes 08:00 - 17:00</li>
                        <li>Email: seguros@utpl.edu.ec</li>
                        <li>Extensión: 2024</li>
                    </ul>
                    <a
                        href="https://wa.me/593999999999" // Placeholder
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-full gap-2 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        <FaWhatsapp /> Contactar Soporte
                    </a>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Preguntas Frecuentes</h3>
                <div className="space-y-3">
                    <details className="group">
                        <summary className="list-none flex flex-wrap items-center cursor-pointer focus-visible:outline-none focus-visible:ring focus-visible:ring-pink-500 rounded group-open:before:rotate-90 before:content-[''] before:mr-2 before:border-transparent before:border-l-gray-600 before:border-l-[6px] before:border-y-[4px] before:transition-transform before:duration-200">
                            <span className="font-medium text-gray-700">¿Qué documentos necesito para un siniestro de vida?</span>
                        </summary>
                        <p className="mt-2 text-gray-600 text-sm pl-4">
                            Cédula del fallecido, partida de defunción, cédula del beneficiario/declarante y formulario de aviso lleno (este sistema).
                        </p>
                    </details>
                    <details className="group">
                        <summary className="list-none flex flex-wrap items-center cursor-pointer focus-visible:outline-none focus-visible:ring focus-visible:ring-pink-500 rounded group-open:before:rotate-90 before:content-[''] before:mr-2 before:border-transparent before:border-l-gray-600 before:border-l-[6px] before:border-y-[4px] before:transition-transform before:duration-200">
                            <span className="font-medium text-gray-700">¿Cómo verificar si mi póliza está activa?</span>
                        </summary>
                        <p className="mt-2 text-gray-600 text-sm pl-4">
                            Por seguridad, la información detallada de pólizas es manejada por administración. Si el sistema te permite reportar un siniestro, tu póliza está vigente. Si tienes dudas, contáctanos.
                        </p>
                    </details>
                </div>
            </div>
        </div>
    )
}
