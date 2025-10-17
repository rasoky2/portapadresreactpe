'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast, ToastContainer } from '@/components/ui/toast'
import CreateTeacherModal from './create-teacher-modal'
import EditTeacherModal from './edit-teacher-modal'
import AssignSubjectsModal from './assign-subjects-modal'
import TeacherDetailsModal from './teacher-details-modal'
import ConfirmDialog from './confirm-dialog'
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  BookOpen,
  Mail,
  Phone
} from 'lucide-react'

interface Teacher {
  IdUsuario: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
  IdRol: number
  NombreRol: string
  MateriasAsignadas?: number
  GradosAsignados?: string[]
}

export default function TeachersManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null)
  const [teacherToAssign, setTeacherToAssign] = useState<Teacher | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [teacherForDetails, setTeacherForDetails] = useState<Teacher | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    let filtered = teachers

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(teacher => {
        const matchesName = teacher.Nombre.toLowerCase().includes(searchLower)
        const matchesLastName = teacher.Apellido.toLowerCase().includes(searchLower)
        const matchesUser = teacher.Usuario.toLowerCase().includes(searchLower)
        const matchesEmail = teacher.Email?.toLowerCase().includes(searchLower) ?? false
        
        return matchesName || matchesLastName || matchesUser || matchesEmail
      })
    }

    setFilteredTeachers(filtered)
  }, [teachers, searchTerm])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers')
      const data = await response.json()
      setTeachers(data)
    } catch (error) {
      console.error('Error cargando docentes:', error)
      showError('Error', 'No se pudieron cargar los docentes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeacher = async (teacherData: {
    usuario: string
    contraseña: string
    nombre: string
    apellido: string
    email?: string
    telefono?: string
  }) => {
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...teacherData,
          idRol: 2 // Rol de docente
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error creando docente')
      }

      // Recargar la lista de docentes
      await fetchTeachers()
      showSuccess(
        'Docente creado', 
        `${teacherData.nombre} ${teacherData.apellido} ha sido registrado correctamente`
      )
    } catch (error) {
      console.error('Error creando docente:', error)
      showError(
        'Error al crear docente', 
        'No se pudo registrar el docente. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleEditTeacher = async (teacherId: number, teacherData: {
    usuario: string
    contraseña: string
    nombre: string
    apellido: string
    email: string
    telefono: string
  }) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error actualizando docente')
      }

      // Recargar la lista de docentes
      await fetchTeachers()
      showSuccess(
        'Docente actualizado', 
        `${teacherData.nombre} ${teacherData.apellido} ha sido actualizado correctamente`
      )
    } catch (error) {
      console.error('Error actualizando docente:', error)
      showError(
        'Error al actualizar docente', 
        'No se pudo actualizar el docente. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleDeleteTeacher = async (teacherId: number) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error eliminando docente')
      }

      // Recargar la lista de docentes
      await fetchTeachers()
      showSuccess(
        'Docente eliminado', 
        'El docente ha sido eliminado correctamente del sistema'
      )
    } catch (error) {
      console.error('Error eliminando docente:', error)
      showError(
        'Error al eliminar docente', 
        'No se pudo eliminar el docente. Por favor, intenta nuevamente.'
      )
    }
  }

  const openEditModal = (teacher: Teacher) => {
    setTeacherToEdit(teacher)
    setShowEditModal(true)
  }

  const openAssignModal = (teacher: Teacher) => {
    setTeacherToAssign(teacher)
    setShowAssignModal(true)
  }

  const handleAssignSubjects = async (assignments: {
    IdMateria: number
    IdGrado: number
    IdSeccion: number
  }[]) => {
    if (!teacherToAssign) return

    try {
      const response = await fetch(`/api/admin/teachers/${teacherToAssign.IdUsuario}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error guardando asignaciones')
      }

      // Recargar la lista de docentes
      await fetchTeachers()
      showSuccess(
        'Asignaciones guardadas', 
        `Se han guardado ${assignments.length} asignaciones para ${teacherToAssign.Nombre} ${teacherToAssign.Apellido}`
      )
    } catch (error) {
      console.error('Error guardando asignaciones:', error)
      showError(
        'Error al guardar asignaciones', 
        'No se pudieron guardar las asignaciones. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const confirmDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher)
    setShowDeleteDialog(true)
  }

  const executeDelete = async () => {
    if (teacherToDelete) {
      await handleDeleteTeacher(teacherToDelete.IdUsuario)
      setShowDeleteDialog(false)
      setTeacherToDelete(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-red-100 text-red-800'
      case 'Docente':
        return 'bg-blue-100 text-blue-800'
      case 'Padre':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Docentes</h1>
        <p className="mt-1 text-sm text-gray-500">Administra los docentes del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Docentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Docentes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Materias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter(t => (t.MateriasAsignadas ?? 0) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con asignaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Materias</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter(t => (t.MateriasAsignadas ?? 0) === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sin asignaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter(t => t.Email).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con contacto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, apellido, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <GraduationCap className="w-4 h-4 mr-2" />
                Reporte
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Docente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de docentes */}
      <Card>
        <CardHeader>
          <CardTitle>Docentes ({teachers.length})</CardTitle>
          <CardDescription>
            Lista de todos los docentes registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron docentes</p>
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div key={teacher.IdUsuario} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {teacher.Nombre} {teacher.Apellido}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(teacher.NombreRol)}`}>
                          {teacher.NombreRol}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">@{teacher.Usuario}</p>
                        {teacher.Email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-500">{teacher.Email}</span>
                          </div>
                        )}
                        {teacher.Telefono && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-500">{teacher.Telefono}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-blue-600">
                          {teacher.MateriasAsignadas ?? 0} materias asignadas
                        </span>
                        {teacher.GradosAsignados && teacher.GradosAsignados.length > 0 && (
                          <span className="text-xs text-gray-500">
                            Grados: {teacher.GradosAsignados.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setTeacherForDetails(teacher); setDetailsOpen(true) }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(teacher)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAssignModal(teacher)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => confirmDelete(teacher)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateTeacherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTeacher}
      />

      <EditTeacherModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditTeacher}
        teacher={teacherToEdit}
      />

      <AssignSubjectsModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSave={handleAssignSubjects}
        teacher={teacherToAssign}
      />

      <TeacherDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        teacher={teacherForDetails}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={executeDelete}
        title="Eliminar Docente"
        description={`¿Estás seguro de que quieres eliminar a ${teacherToDelete?.Nombre} ${teacherToDelete?.Apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
