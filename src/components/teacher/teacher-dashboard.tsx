'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Plus
} from 'lucide-react'
import CourseNotesModal from '@/components/admin/course-notes-modal'

interface Student {
  IdHijo: number
  NombreHijo: string
  Edad: number
  IdPadre: number
}

interface Grade {
  IdNota: number
  IdHijo: number
  Materia: string
  Nota: number
  Fecha: string
  Criterio: string
}

interface Attendance {
  IdHijo: number
  Fecha: string
  Asistio: boolean
}

interface DashboardData {
  students: Student[]
  recentGrades: Grade[]
  attendance: Attendance[]
  upcomingEvents: any[]
  totalStudents: number
  averageGrade: number
  attendanceRate: number
}

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData>({
    students: [],
    recentGrades: [],
    attendance: [],
    upcomingEvents: [],
    totalStudents: 0,
    averageGrade: 0,
    attendanceRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [myCourses, setMyCourses] = useState<{ IdMateria: number; IdGrado: number; IdSeccion: number }[]>([])

  useEffect(() => {
    // TODO: reemplazar 2 por el IdUsuario del docente autenticado
    fetch('/api/teacher/courses?id=2')
      .then(r => r.json())
      .then(setMyCourses)
      .catch(() => setMyCourses([]))
    fetch('/api/teacher/students?id=2')
      .then(r => r.json())
      .then((rows) => {
        setData(prev => ({ ...prev, students: rows.map((s:any)=>({ IdHijo: s.IdHijo, NombreHijo: `${s.NombreHijo} ${s.ApellidoHijo}`, Edad: s.Edad, IdPadre: 0 })) , totalStudents: rows.length }))
      })
      .catch(()=>{})
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simular datos por ahora - en producción vendrían de la API
      setData({
        students: [
          { IdHijo: 1, NombreHijo: 'Ana Pérez', Edad: 8, IdPadre: 1 },
          { IdHijo: 2, NombreHijo: 'Luis Pérez', Edad: 10, IdPadre: 1 },
          { IdHijo: 3, NombreHijo: 'Sofia García', Edad: 7, IdPadre: 2 },
          { IdHijo: 4, NombreHijo: 'Diego García', Edad: 9, IdPadre: 2 }
        ],
        recentGrades: [
          { IdNota: 1, IdHijo: 1, Materia: 'Matemáticas', Nota: 8.5, Fecha: '2024-01-15', Criterio: 'Suma y resta básica' },
          { IdNota: 2, IdHijo: 2, Materia: 'Matemáticas', Nota: 7.5, Fecha: '2024-01-15', Criterio: 'Multiplicación' },
          { IdNota: 3, IdHijo: 3, Materia: 'Lengua', Nota: 9.0, Fecha: '2024-01-16', Criterio: 'Lectura de cuentos' },
          { IdNota: 4, IdHijo: 4, Materia: 'Ciencias', Nota: 8.0, Fecha: '2024-01-17', Criterio: 'Los animales' }
        ],
        attendance: [
          { IdHijo: 1, Fecha: '2024-01-15', Asistio: true },
          { IdHijo: 2, Fecha: '2024-01-15', Asistio: true },
          { IdHijo: 3, Fecha: '2024-01-15', Asistio: true },
          { IdHijo: 4, Fecha: '2024-01-15', Asistio: false },
          { IdHijo: 1, Fecha: '2024-01-16', Asistio: true },
          { IdHijo: 2, Fecha: '2024-01-16', Asistio: true },
          { IdHijo: 3, Fecha: '2024-01-16', Asistio: false },
          { IdHijo: 4, Fecha: '2024-01-16', Asistio: true }
        ],
        upcomingEvents: [
          { Fecha: '2024-02-14', Descripcion: 'Día de San Valentín', Tipo: 'Festivo' },
          { Fecha: '2024-03-15', Descripcion: 'Reunión de padres', Tipo: 'Reunión' }
        ],
        totalStudents: 4,
        averageGrade: 8.25,
        attendanceRate: 87.5
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
        <h1 className="text-3xl font-bold text-gray-900">Portal Docente</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona tus estudiantes y sus calificaciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageGrade}</div>
            <p className="text-xs text-muted-foreground">
              Calificaciones recientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio de asistencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentGrades.length}</div>
            <p className="text-xs text-muted-foreground">
              Registradas esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mis Estudiantes</CardTitle>
                  <CardDescription>
                    Lista de estudiantes a tu cargo
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setCourseModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Nota
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.students.map((student) => {
                  const studentGrades = data.recentGrades.filter(g => g.IdHijo === student.IdHijo)
                  const studentAttendance = data.attendance.filter(a => a.IdHijo === student.IdHijo)
                  const attendanceRate = studentAttendance.length > 0 
                    ? Math.round((studentAttendance.filter(a => a.Asistio).length / studentAttendance.length) * 100)
                    : 0
                  const averageGrade = studentGrades.length > 0
                    ? (studentGrades.reduce((sum, grade) => sum + grade.Nota, 0) / studentGrades.length).toFixed(1)
                    : '0.0'

                  return (
                    <div key={student.IdHijo} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.NombreHijo}</p>
                          <p className="text-sm text-gray-500">{student.Edad} años</p>
                          <div className="flex space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Promedio: <span className="font-medium">{averageGrade}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Asistencia: <span className="font-medium">{attendanceRate}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCourseModalOpen(true)}>
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Calificaciones Recientes</CardTitle>
              <CardDescription>
                Últimas notas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentGrades.slice(-5).map((grade) => (
                  <div key={grade.IdNota} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{grade.Materia}</p>
                      <p className="text-xs text-gray-500">
                        {data.students.find(s => s.IdHijo === grade.IdHijo)?.NombreHijo}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${getGradeColor(grade.Nota)}`}>
                      {grade.Nota}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Asistencia</CardTitle>
              <CardDescription>
                Últimos registros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.attendance.slice(-5).map((attendance, index) => {
                  const student = data.students.find(s => s.IdHijo === attendance.IdHijo)
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {attendance.Asistio ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student?.NombreHijo}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(attendance.Fecha).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${
                        attendance.Asistio ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {attendance.Asistio ? 'Presente' : 'Ausente'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Funciones comunes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => setCourseModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Nota
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Marcar Asistencia
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Contactar Padres
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de calificaciones por curso (reutilizado) */}
      <CourseNotesModal isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} courseFilter={myCourses} />
    </div>
  )
}
