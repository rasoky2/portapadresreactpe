'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Download, 
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react'

interface ReportData {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalParents: number
  averageGrade: number
  attendanceRate: number
  totalEvents: number
  recentGrades: number
}

export default function ReportsManagement() {
  const [reportData, setReportData] = useState<ReportData>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    averageGrade: 0,
    attendanceRate: 0,
    totalEvents: 0,
    recentGrades: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      // Simular datos de reportes
      setReportData({
        totalUsers: 8,
        totalStudents: 7,
        totalTeachers: 3,
        totalParents: 4,
        averageGrade: 8.2,
        attendanceRate: 87.5,
        totalEvents: 3,
        recentGrades: 20
      })
    } catch (error) {
      console.error('Error cargando datos de reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    {
      id: 'users',
      title: 'Reporte de Usuarios',
      description: 'Lista completa de usuarios del sistema con sus roles',
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'students',
      title: 'Reporte de Estudiantes',
      description: 'Información detallada de todos los estudiantes',
      icon: GraduationCap,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'grades',
      title: 'Reporte de Calificaciones',
      description: 'Calificaciones por materia, estudiante y período',
      icon: BookOpen,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'attendance',
      title: 'Reporte de Asistencia',
      description: 'Estadísticas de asistencia por estudiante y período',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'events',
      title: 'Reporte de Eventos',
      description: 'Calendario de eventos y actividades escolares',
      icon: Calendar,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'summary',
      title: 'Reporte Resumen',
      description: 'Resumen ejecutivo con métricas principales',
      icon: BarChart3,
      color: 'bg-gray-100 text-gray-800'
    }
  ]

  const generateReport = (reportId: string) => {
    // Simular generación de reporte
    alert(`Generando reporte: ${reports.find(r => r.id === reportId)?.title}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="mt-1 text-sm text-gray-500">Genera reportes detallados del sistema escolar</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +1 nuevo estudiante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.averageGrade}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +0.3 vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline w-3 h-3 mr-1" />
              -2% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.color}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateReport(report.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button 
                  size="sm"
                  onClick={() => generateReport(report.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Genera reportes comunes con un solo clic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => generateReport('summary')}
              >
                <BarChart3 className="w-6 h-6 mb-2" />
                <span>Resumen Ejecutivo</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => generateReport('grades')}
              >
                <BookOpen className="w-6 h-6 mb-2" />
                <span>Boletín de Notas</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => generateReport('attendance')}
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span>Reporte de Asistencia</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => generateReport('users')}
              >
                <Users className="w-6 h-6 mb-2" />
                <span>Lista de Usuarios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
