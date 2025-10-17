'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Eye, 
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface ConceptoPago {
  IdConcepto: number
  NombreConcepto: string
  Descripcion: string
  Monto: number
  TipoConcepto: string
  DuracionMeses?: number | null
  IdNivel: number
  IdGrado: number
  NombreNivel: string
  NombreGrado: string
  Activo: boolean
}

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

interface PendingRow {
  IdPadre: number | null
  NombrePadre: string | null
  ApellidoPadre: string | null
  Telefono?: string | null
  DNI?: string | null
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  IdGrado: number | null
  NombreGrado: string | null
  IdNivel: number | null
  NombreNivel: string | null
}

export default function PaymentsManagement() {
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [pending, setPending] = useState<PendingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [grades, setGrades] = useState<any[]>([])
  const [nivelId, setNivelId] = useState<number | 0>(0)
  const [gradoId, setGradoId] = useState<number | 0>(0)
  const today = new Date()
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth() + 1)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    fetchData()
    // Cargar grados para filtros
    fetch('/api/admin/grades')
      .then(r => r.json())
      .then(data => setGrades(data))
      .catch(() => setGrades([]))
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [conceptosRes, facturasRes] = await Promise.all([
        fetch('/api/admin/payments/concepts'),
        fetch('/api/admin/payments/invoices')
      ])
      
      const conceptosData = await conceptosRes.json()
      const facturasData = await facturasRes.json()
      
      setConceptos(Array.isArray(conceptosData) ? conceptosData : [])
      setFacturas(Array.isArray(facturasData) ? facturasData : [])
    } catch (error) {
      showError('Error', 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async () => {
    try {
      const params = new URLSearchParams({ year: String(year), month: String(month) })
      if (nivelId) params.set('idNivel', String(nivelId))
      if (gradoId) params.set('idGrado', String(gradoId))
      const res = await fetch(`/api/admin/payments/pending?${params.toString()}`)
      const data = await res.json()
      setPending(Array.isArray(data) ? data : [])
    } catch {
      setPending([])
    }
  }

  useEffect(() => {
    fetchPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, nivelId, gradoId])

  const getConceptoStats = () => {
    const list = Array.isArray(conceptos) ? conceptos : []
    const totalConceptos = list.length
    const conceptosActivos = list.filter(c => c.Activo).length
    const totalMonto = list.reduce((sum, c) => sum + c.Monto, 0)
    const promedioMonto = totalConceptos > 0 ? totalMonto / totalConceptos : 0

    return {
      totalConceptos,
      conceptosActivos,
      totalMonto,
      promedioMonto
    }
  }

  const getFacturaStats = () => {
    const totalFacturas = facturas.length
    const facturasPagadas = facturas.filter(f => f.Estado === 'Pagada').length
    const facturasPendientes = facturas.filter(f => f.Estado === 'Pendiente').length
    const totalRecaudado = facturas
      .filter(f => f.Estado === 'Pagada')
      .reduce((sum, f) => sum + f.Total, 0)

    return {
      totalFacturas,
      facturasPagadas,
      facturasPendientes,
      totalRecaudado
    }
  }

  const niveles = [
    { IdNivel: 1, NombreNivel: 'Primaria' },
    { IdNivel: 2, NombreNivel: 'Secundaria' }
  ]

  const gradosFiltrados = nivelId
    ? grades.filter((g: any) => g.IdNivel === nivelId)
    : grades

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

  const getTipoConceptoColor = (tipo: string) => {
    switch (tipo) {
      case 'Matricula':
        return 'bg-blue-100 text-blue-800'
      case 'Mensualidad':
        return 'bg-purple-100 text-purple-800'
      case 'Material':
        return 'bg-orange-100 text-orange-800'
      case 'Actividad':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.NumeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.NombreHijo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.NombrePadre.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || factura.Estado === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const conceptoStats = getConceptoStats()
  const facturaStats = getFacturaStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sistema de pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <p className="mt-1 text-sm text-gray-500">Administra conceptos de pago, facturas y pagos del colegio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conceptos de Pago</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conceptoStats.totalConceptos}</div>
            <p className="text-xs text-muted-foreground">
              {conceptoStats.conceptosActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facturaStats.totalFacturas}</div>
            <p className="text-xs text-muted-foreground">
              {facturaStats.facturasPendientes} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {facturaStats.totalRecaudado.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total recaudado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facturaStats.totalFacturas > 0 
                ? Math.round((facturaStats.facturasPagadas / facturaStats.totalFacturas) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Facturas pagadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pendientes del mes por nivel y grado */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pagos pendientes del mes</CardTitle>
          <CardDescription>
            Filtra por nivel, grado y período (año/mes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nivel</label>
              <select
                value={nivelId}
                onChange={(e) => { setNivelId(Number(e.target.value)); setGradoId(0) }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={0}>Todos</option>
                {niveles.map(n => (
                  <option key={n.IdNivel} value={n.IdNivel}>{n.NombreNivel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Grado</label>
              <select
                value={gradoId}
                onChange={(e) => setGradoId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={0}>Todos</option>
                {gradosFiltrados.map((g: any) => (
                  <option key={g.IdGrado} value={g.IdGrado}>{g.NombreGrado}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Año</label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mes</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">{pending.length} estudiantes pendientes</div>

          {pending.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay pendientes con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pending.map((row) => (
                <div key={`${row.IdHijo}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{row.ApellidoHijo} {row.NombreHijo}</p>
                    <p className="text-sm text-gray-500">
                      {(row.NombreNivel || '')} {row.NombreGrado ? `• ${row.NombreGrado}` : ''}
                    </p>
                    {row.NombrePadre && (
                      <p className="text-xs text-gray-400">Padre: {row.NombrePadre} {row.ApellidoPadre}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conceptos de Pago */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conceptos de Pago</CardTitle>
          <CardDescription>
            Gestión de conceptos y precios del colegio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conceptos.map((concepto) => (
              <div key={concepto.IdConcepto} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{concepto.NombreConcepto}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoConceptoColor(concepto.TipoConcepto)}`}>
                        {concepto.TipoConcepto}
                      </span>
                      {concepto.NombreNivel && (
                        <span className="text-sm text-gray-500">
                          {concepto.NombreNivel}
                        </span>
                      )}
                      {concepto.NombreGrado && (
                        <span className="text-sm text-gray-500">
                          - {concepto.NombreGrado}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">S/ {concepto.Monto.toFixed(2)}</p>
                  <p className={`text-xs ${concepto.Activo ? 'text-green-600' : 'text-red-600'}`}>
                    {concepto.Activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas ({filteredFacturas.length})</CardTitle>
          <CardDescription>
            Historial de facturas emitidas
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
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFacturas.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron facturas</p>
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
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {factura.NombrePadre} {factura.ApellidoPadre}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Emisión: {new Date(factura.FechaEmision).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          Vence: {new Date(factura.FechaVencimiento).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">S/ {factura.Total.toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(factura.Estado)}`}>
                        {factura.Estado}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(`/admin/payments/invoice/${factura.IdFactura}`, '_blank')
                      }} title="Descargar/Imprimir PDF">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
