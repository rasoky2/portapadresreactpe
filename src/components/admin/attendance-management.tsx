'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

interface Attendance {
  IdAsistencia: number
  IdHijo: number
  Fecha: string
  Asistio: boolean
  NombreHijo?: string
}

interface AttendanceStats {
  totalRecords: number
  presentCount: number
  absentCount: number
  attendanceRate: number
  todayAttendance: number
  thisWeekAttendance: number
}

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    todayAttendance: 0,
    thisWeekAttendance: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    fetchAttendance()
  }, [])

  useEffect(() => {
    filterAttendance()
    calculateStats()
  }, [attendance, searchTerm, statusFilter, dateFilter])

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/admin/attendance')
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error cargando asistencia:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAttendance = () => {
    let filtered = attendance

    if (searchTerm) {
      filtered = filtered.filter(record =>
        (record.NombreHijo && record.NombreHijo.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      const isPresent = statusFilter === 'present'
      filtered = filtered.filter(record => record.Asistio === isPresent)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.Fecha)
        
        switch (dateFilter) {
          case 'today':
            return recordDate.toDateString() === today.toDateString()
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            return recordDate >= today && recordDate <= weekFromNow
          case 'month':
            return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()
          case 'past':
            return recordDate < today
          default:
            return true
        }
      })
    }

    setFilteredAttendance(filtered)
  }

  const calculateStats = () => {
    const totalRecords = attendance.length
    const presentCount = attendance.filter(record => record.Asistio).length
    const absentCount = totalRecords - presentCount
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayAttendance = attendance.filter(record => 
      record.Fecha === todayStr && record.Asistio
    ).length

    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thisWeekAttendance = attendance.filter(record => {
      const recordDate = new Date(record.Fecha)
      return recordDate >= today && recordDate <= weekFromNow && record.Asistio
    }).length

    setStats({
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate,
      todayAttendance,
      thisWeekAttendance
    })
  }

  const getAttendanceIcon = (asistio: boolean) => {
    return asistio ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getAttendanceColor = (asistio: boolean) => {
    return asistio ? 'text-green-600' : 'text-red-600'
  }

  const getAttendanceText = (asistio: boolean) => {
    return asistio ? 'Presente' : 'Ausente'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando asistencia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencia</h1>
        <p className="mt-1 text-sm text-gray-500">Controla la asistencia de todos los estudiantes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Registros de asistencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio general
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes presentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Asistencias registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="present">Presentes</option>
                  <option value="absent">Ausentes</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="sm:w-48">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="past">Pasados</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Asistencia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Asistencia ({filteredAttendance.length})</CardTitle>
          <CardDescription>
            Lista de todos los registros de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron registros de asistencia</p>
              </div>
            ) : (
              filteredAttendance.map((record) => {
                const recordDate = new Date(record.Fecha)
                const isToday = recordDate.toDateString() === new Date().toDateString()
                
                return (
                  <div key={record.IdAsistencia} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        {getAttendanceIcon(record.Asistio)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.NombreHijo || `Estudiante ${record.IdHijo}`}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-sm font-medium ${getAttendanceColor(record.Asistio)}`}>
                            {getAttendanceText(record.Asistio)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {recordDate.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {isToday && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Hoy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
