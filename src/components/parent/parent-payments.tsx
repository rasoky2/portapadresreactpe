'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Search, 
  Eye, 
  DollarSign,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface Factura {
  IdFactura: number
  IdPadre: number
  IdHijo: number
  NumeroFactura: string
  FechaEmision: string
  FechaVencimiento: string
  Estado: string
  Subtotal: number
  Descuento: number
  Total: number
  NombreHijo: string
  ApellidoHijo: string
  NombrePadre: string
  ApellidoPadre: string
}

export default function ParentPayments() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [mpDialogOpen, setMpDialogOpen] = useState(false)
  const [mpInitPoint, setMpInitPoint] = useState<string | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  // TODO: Obtener el ID del padre desde la sesión de autenticación
  const parentId = 1 // Hardcoded por ahora

  useEffect(() => {
    fetchFacturas()
  }, [])

  const fetchFacturas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/payments/invoices?parentId=${parentId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar facturas')
      }
      
      const data = await response.json()
      setFacturas(data)
    } catch (error) {
      showError('Error', 'No se pudieron cargar las facturas')
    } finally {
      setLoading(false)
    }
  }

  const getFacturaStats = () => {
    const totalFacturas = facturas.length
    const facturasPagadas = facturas.filter(f => f.Estado === 'Pagada').length
    const facturasPendientes = facturas.filter(f => f.Estado === 'Pendiente').length
    const facturasVencidas = facturas.filter(f => f.Estado === 'Vencida').length
    const totalPendiente = facturas
      .filter(f => f.Estado === 'Pendiente' || f.Estado === 'Vencida')
      .reduce((sum, f) => sum + f.Total, 0)

    return {
      totalFacturas,
      facturasPagadas,
      facturasPendientes,
      facturasVencidas,
      totalPendiente
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return 'bg-green-100 text-green-800'
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Vencida':
        return 'bg-red-100 text-red-800'
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Pendiente':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'Vencida':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'Cancelada':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const isFacturaVencida = (fechaVencimiento: string) => {
    return new Date(fechaVencimiento) < new Date()
  }

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.NumeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.NombreHijo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || factura.Estado === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const facturaStats = getFacturaStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando facturas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona tus facturas y pagos del colegio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facturaStats.totalFacturas}</div>
            <p className="text-xs text-muted-foreground">
              Facturas emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{facturaStats.facturasPagadas}</div>
            <p className="text-xs text-muted-foreground">
              Completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{facturaStats.facturasPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Por pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {facturaStats.totalPendiente.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por pagar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Facturas ({filteredFacturas.length})</CardTitle>
          <CardDescription>
            Historial de tus facturas y pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar facturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Pagada">Pagadas</option>
                <option value="Vencida">Vencidas</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFacturas.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes facturas registradas</p>
              </div>
            ) : (
              filteredFacturas.map((factura) => (
                <div key={factura.IdFactura} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{factura.NumeroFactura}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {factura.NombreHijo} {factura.ApellidoHijo}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Emisión: {new Date(factura.FechaEmision).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className={`text-sm ${isFacturaVencida(factura.FechaVencimiento) && factura.Estado !== 'Pagada' ? 'text-red-600' : 'text-gray-500'}`}>
                          Vence: {new Date(factura.FechaVencimiento).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">S/ {factura.Total.toFixed(2)}</p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        {getEstadoIcon(factura.Estado)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(factura.Estado)}`}>
                          {factura.Estado}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {factura.Estado === 'Pagada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/admin/payments/invoice/${factura.IdFactura}`, '_blank')}
                          title="Descargar/Imprimir PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {(factura.Estado === 'Pendiente' || factura.Estado === 'Vencida') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/payments/demo/checkout', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ facturaId: factura.IdFactura })
                                })
                                const data = await res.json()
                                if (data?.url) window.location.href = data.url
                              } catch {
                                // noop
                              }
                            }}
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pagar (Demo)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                // intentar leer token guardado por admin (demo)
                                let accessToken: string | undefined
                                try { accessToken = window.localStorage.getItem('mp_access_token') || undefined } catch {}
                                const res = await fetch('/api/payments/mercadopago/preference', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ facturaId: factura.IdFactura, accessToken })
                                })
                                const data = await res.json()
                                if (!data?.ok) {
                                  showError('Mercado Pago', data?.error?.message || 'No se pudo iniciar el checkout')
                                  return
                                }
                                if (data?.init_point) {
                                  setMpInitPoint(data.init_point as string)
                                  const win = window.open(data.init_point as string, '_blank', 'noopener,noreferrer')
                                  if (!win) {
                                    showError('Bloqueo de ventana', 'Permite ventanas emergentes para continuar con el pago')
                                  }
                                  setMpDialogOpen(true)
                                }
                              } catch {
                                // noop
                              }
                            }}
                            title="Pagar con Mercado Pago"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Mercado Pago
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {mpDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMpDialogOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Completa tu pago en Mercado Pago</h3>
                <p className="mt-2 text-sm text-gray-600">Se abrió una nueva pestaña con el Checkout. Una vez finalizado, presiona "Verificar pago" para actualizar el estado de la factura.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={async () => {
                  await fetchFacturas()
                  showSuccess('Actualizado', 'Se verificó el estado de tus facturas')
                }}
              >
                Verificar pago
              </Button>
              {mpInitPoint && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const win = window.open(mpInitPoint as string, '_blank', 'noopener,noreferrer')
                    if (!win) {
                      showError('Bloqueo de ventana', 'Permite ventanas emergentes para continuar con el pago')
                    }
                  }}
                >
                  Reabrir Checkout
                </Button>
              )}
              <Button variant="ghost" onClick={() => setMpDialogOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
