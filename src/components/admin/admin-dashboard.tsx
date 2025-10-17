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

      // Obtener usuarios
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      setUsers(usersData)
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
          {/* Users Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>
                  Gestiona todos los usuarios registrados en el portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.IdUsuario} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.Usuario}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.NombreRol)}`}>
                            {user.NombreRol}
                          </span>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Gráfico de distribución de usuarios por rol */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" /> Distribución de Usuarios por Rol
                </CardTitle>
                <CardDescription>Administradores, Docentes y Padres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <DonutChart segments={[
                    { value: Math.max(stats.totalUsers - stats.totalTeachers - stats.totalParents, 0), color: '#ef4444' },
                    { value: stats.totalTeachers, color: '#3b82f6' },
                    { value: stats.totalParents, color: '#10b981' }
                  ]} />
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-red-500 rounded-sm" /> Administradores: {Math.max(stats.totalUsers - stats.totalTeachers - stats.totalParents, 0)}</div>
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm" /> Docentes: {stats.totalTeachers}</div>
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm" /> Padres: {stats.totalParents}</div>
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
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Usuario admin inició sesión</p>
                    <span className="text-xs text-gray-400">hace 5 min</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Nuevo estudiante registrado</p>
                    <span className="text-xs text-gray-400">hace 1 hora</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Evento creado: Reunión de padres</p>
                    <span className="text-xs text-gray-400">hace 2 horas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}
