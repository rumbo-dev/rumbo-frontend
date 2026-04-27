'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function EmailProcessor() {
  const [token, setToken] = useState<string>('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [fromEmail, setFromEmail] = useState('supplier@example.com')
  const [toEmail, setToEmail] = useState('operations@rumbo.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useState(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (t) setToken(t)
  })

  const handleProcessEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post(
        `${API_URL}/api/emails/process`,
        {
          emailSubject,
          emailBody,
          fromEmail,
          toEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setResult(response.data)
      // Limpiar formulario
      setEmailSubject('')
      setEmailBody('')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error processing email')
    } finally {
      setLoading(false)
    }
  }

  const exampleEmail = `Asunto: BOOKING CONFIRMATION - OP-2024-001

Estimado equipo,

Le confirmamos el booking para el siguiente shipment:

Operation Code: OP-2024-001
Container: CONT-LAB-001
Línea: Maersk
Peso: 18,000 kg
Puerto Origen: Shanghai, China
Puerto Destino: Buenos Aires, Argentina

ETA Buenos Aires: 12-02-2024

El contenedor fue recibido en puerto y será embarcado en el próximo viaje.

Por favor confirmar recepción de este email.

Saludos,
Shanghai Port Operations
supplier@example.com`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-900 font-semibold">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Email Processor (IA)</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Procesar Email</h2>

            <form onSubmit={handleProcessEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">De (Email)</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={e => setFromEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para (Email)</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={e => setToEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="BOOKING CONFIRMATION - OP-2024-001"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del Email</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Pegar contenido del email aquí..."
                  rows={10}
                  className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Procesar Email'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailSubject('BOOKING CONFIRMATION - OP-2024-001')
                    setEmailBody(exampleEmail)
                  }}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Ejemplo
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultado</h2>

            {result ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  ✓ {result.message}
                </div>

                {result.operationId && (
                  <Link
                    href={`/operations/${result.operationId}`}
                    className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded font-semibold hover:bg-blue-700"
                  >
                    Ver Operación Actualizada
                  </Link>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Detalles</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <p>📧 Procesa emails con IA Claude</p>
                <p className="mt-2 text-xs">La IA:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>Clasifica el tipo de email</li>
                  <li>Extrae información (peso, rutas, ETA)</li>
                  <li>Encuentra la operación correspondiente</li>
                  <li>Actualiza estado y stage</li>
                  <li>Genera tasks automáticamente</li>
                  <li>Crea eventos en el timeline</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Example Emails */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emails de Prueba</h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                name: 'Booking Confirmation',
                subject: 'BOOKING CONFIRMATION - OP-2024-001',
                body: `Estimado,

Confirmamos el booking para:

Operation Code: OP-2024-001
Container: CONT-LAB-001
Línea: Maersk
Peso: 18,000 kg
Origen: Shanghai
Destino: Buenos Aires
ETA: 12-02-2024

El contenedor fue recibido.

Saludos`,
              },
              {
                name: 'Shipment Status Update',
                subject: 'STATUS UPDATE - OP-2024-001 - En Océano',
                body: `Hi,

Your shipment OP-2024-001 (CONT-LAB-001) is now at sea.

Vessel: MSC Example
Departure: Shanghai Port - 2024-01-20
ETA Buenos Aires: 2024-02-01

All documents OK.

Regards`,
              },
              {
                name: 'Customs Notification',
                subject: 'CUSTOMS CLEARANCE REQUIRED - OP-2024-002',
                body: `Notification,

Operation OP-2024-002 requires:

Missing documentation:
- Updated invoice
- Certificate of origin

Please submit within 48 hours.

Regards,
Customs Team`,
              },
              {
                name: 'Delivery Notification',
                subject: 'DELIVERY COMPLETED - OP-2024-003',
                body: `Delivery Confirmation

Container OP-2024-003 has been delivered to your warehouse.

Delivery date: 2024-01-28
Location: Buenos Aires
Status: COMPLETE

Thank you!`,
              },
            ].map((email, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEmailSubject(email.subject)
                  setEmailBody(email.body)
                }}
                className="text-left border border-gray-300 rounded p-4 hover:bg-blue-50 transition"
              >
                <p className="font-semibold text-gray-900">{email.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{email.subject}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
