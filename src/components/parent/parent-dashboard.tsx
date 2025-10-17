'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'

interface Child {
  IdHijo: number
  NombreHijo: string
  Edad: number
}

interface Grade {
  IdNota: number
  Materia: string
  Nota: number
  Fecha: string
  Criterio: string
}

interface Attendance {
  Fecha: string
  Asistio: boolean
}

interface DashboardData {
  children: Child[]
  recentGrades: Grade[]
  attendance: Attendance[]
  upcomingEvents: any[]
}

export default function ParentDashboard() {
  const [data, setData] = useState<DashboardData>({
    children: [],
    recentGrades: [],
    attendance: [],
    upcomingEvents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simular datos por ahora - en producción vendrían de la API
      setData({
        children: [
          { IdHijo: 1, NombreHijo: 'Ana Pérez', Edad: 8 },
          { IdHijo: 2, NombreHijo: 'Luis Pérez', Edad: 10 }
        ],
        recentGrades: [
          { IdNota: 1, Materia: 'Matemáticas', Nota: 8.5, Fecha: '2024-01-15', Criterio: 'Suma y resta básica' },
          { IdNota: 2, Materia: 'Lengua', Nota: 9.0, Fecha: '2024-01-16', Criterio: 'Lectura comprensiva' },
          { IdNota: 3, Materia: 'Ciencias', Nota: 7.5, Fecha: '2024-01-17', Criterio: 'El cuerpo humano' }
        ],
        attendance: [
          { Fecha: '2024-01-15', Asistio: true },
          { Fecha: '2024-01-16', Asistio: true },
          { Fecha: '2024-01-17', Asistio: false }
        ],
        upcomingEvents: [
          { Fecha: '2024-02-14', Descripcion: 'Día de San Valentín', Tipo: 'Festivo' },
          { Fecha: '2024-03-15', Descripcion: 'Reunión de padres', Tipo: 'Reunión' }
        ]
      })
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (nota: number) => {
    if (nota >= 9) return 'text-green-600'
    if (nota >= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendancePercentage = () => {
    const total = data.attendance.length
    const present = data.attendance.filter(a => a.Asistio).length
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portal de Padres</h1>
        <p className="mt-1 text-sm text-gray-500">Sigue el progreso académico de tus hijos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Hijos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.children.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.children.map(child => child.NombreHijo).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAttendancePercentage()}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recentGrades.length > 0 
                ? (data.recentGrades.reduce((sum, grade) => sum + grade.Nota, 0) / data.recentGrades.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas calificaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Grades */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calificaciones Recientes</CardTitle>
              <CardDescription>
                Últimas notas de tus hijos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentGrades.map((grade) => (
                  <div key={grade.IdNota} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.Materia}</p>
                        <p className="text-sm text-gray-500">{grade.Criterio}</p>
                        <p className="text-xs text-gray-400">{new Date(grade.Fecha).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getGradeColor(grade.Nota)}`}>
                        {grade.Nota}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(grade.Nota / 2) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Children List */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Hijos</CardTitle>
              <CardDescription>
                Información de tus hijos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.children.map((child) => (
                  <div key={child.IdHijo} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{child.NombreHijo}</p>
                      <p className="text-sm text-gray-500">{child.Edad} años</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Asistencia Reciente</CardTitle>
              <CardDescription>
                Últimos registros de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.attendance.slice(-5).map((attendance, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {attendance.Asistio ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm text-gray-900">
                        {new Date(attendance.Fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      attendance.Asistio ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attendance.Asistio ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Eventos del colegio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.Descripcion}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.Fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
