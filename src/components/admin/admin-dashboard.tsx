'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  BookOpen, 
  BarChart3,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalParents: number
  recentAttendance: number
  upcomingEvents: number
}

interface User {
  IdUsuario: number
  Usuario: string
  NombreRol: string
}

interface Invoice {
  IdFactura: number
  IdPadre: number
  NumeroFactura: string
  Estado: string
  Total: number
  NombrePadre?: string
  ApellidoPadre?: string
}

interface CalendarEvent {
  IdEvento?: number
  Fecha: string
  Descripcion: string
  Tipo?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    recentAttendance: 0,
    upcomingEvents: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Obtener estadísticas
      const statsResponse = await fetch('/api/admin/stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Obtener facturas e inferir deudas por padre (Pendiente/Vencida)
      const invRes = await fetch('/api/admin/payments/invoices')
      const invData = await invRes.json()
      setInvoices(invData)

      // Obtener eventos
      const evRes = await fetch('/api/admin/calendar')
      const evData = await evRes.json()
      setEvents(evData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pequeño componente de gráfico donut sin dependencias
  const DonutChart = ({ segments }: { segments: { value: number; color: string }[] }) => {
    const total = segments.reduce((a, b) => a + b.value, 0) || 1
    const radius = 40
    const circumference = 2 * Math.PI * radius
    let offset = 0
    return (
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={14} />
        {segments.map((s, i) => {
          const dash = (s.value / total) * circumference
          const circle = (
            <circle
              key={i}
              cx={50}
              cy={50}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={14}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return circle
        })}
        <circle cx={50} cy={50} r={28} fill="white" />
      </svg>
    )
  }

  // Gráfico de barras simple sin dependencias
  const BarChart = ({ data }: { data: { label: string; value: number; className: string }[] }) => {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
      <div className="flex items-end gap-8">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative h-24 w-8 bg-gray-100 rounded">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t ${d.className}`}
                style={{ height: `${Math.round((d.value / max) * 100)}%` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <div className="mt-2 text-xs font-semibold text-gray-700">{d.value}</div>
            <div className="text-[10px] text-gray-500">{d.label}</div>
          </div>
        ))}
      </div>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrador':
        return 'bg-red-100 text-red-800'
      case 'docente':
        return 'bg-blue-100 text-blue-800'
      case 'padre':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona usuarios, estudiantes y actividades del colegio</p>
      </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde la semana pasada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                +1 nuevo estudiante
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Docentes</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Sin cambios recientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Padres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParents}</div>
              <p className="text-xs text-muted-foreground">
                +1 nuevo padre
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deudas por Padre */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Deudas de Padres</CardTitle>
                <CardDescription>
                  Facturas pendientes y vencidas agrupadas por padre
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const grouped = invoices
                    .filter((f: any) => f.Estado === 'Pendiente' || f.Estado === 'Vencida')
                    .reduce<Record<number, { nombre: string; total: number; cantidad: number }>>((acc, f: any) => {
                      const key = f.IdPadre
                      const nombre = `${f.NombrePadre || ''} ${f.ApellidoPadre || ''}`.trim() || `Padre #${key}`
                      if (!acc[key]) acc[key] = { nombre, total: 0, cantidad: 0 }
                      acc[key].total += Number(f.Total || 0)
                      acc[key].cantidad += 1
                      return acc
                    }, {})
                  const rows = Object.entries(grouped)
                    .map(([id, v]) => ({ id, ...v }))
                    .sort((a, b) => b.total - a.total)

                  if (rows.length === 0) {
                    return <p className="text-sm text-gray-500">No hay deudas pendientes.</p>
                  }

                  return (
                    <div className="space-y-3">
                      {rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{row.nombre}</p>
                              <p className="text-xs text-gray-500">{row.cantidad} factura(s) pendiente(s)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">S/ {row.total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Total adeudado</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Gráfico de padres y alumnos registrados (barras y colores del tema) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" /> Padres y Alumnos Registrados
                </CardTitle>
                <CardDescription>Totales actuales en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <BarChart
                    data={[
                      { label: 'Alumnos', value: stats.totalStudents, className: 'bg-brand-600' },
                      { label: 'Padres', value: stats.totalParents, className: 'bg-emerald-600' }
                    ]}
                  />
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-brand-600 rounded-sm" /> Alumnos</div>
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-emerald-600 rounded-sm" /> Padres</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Accesos directos a funciones comunes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users" className="w-full inline-flex">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </Link>
                <Link href="/admin/students" className="w-full inline-flex">
                  <Button className="w-full justify-start" variant="outline">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Registrar Estudiante
                  </Button>
                </Link>
                <Link href="/admin/calendar" className="w-full inline-flex">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </Link>
                <Link href="/admin/grades" className="w-full inline-flex">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Gestionar Notas
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Calendario del colegio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 6).map((e, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                      <div className="text-sm">
                        <p className="text-gray-800">{e.Descripcion}</p>
                        <p className="text-xs text-gray-500">{new Date(e.Fecha).toLocaleDateString('es-PE')}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-gray-500">No hay eventos próximos.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}
