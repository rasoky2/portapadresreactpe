'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast, ToastContainer } from '@/components/ui/toast'
import CreateStudentModal from './create-student-modal'
import EditStudentModal from './edit-student-modal'
import StudentDetailsModal from './student-details-modal'
import ConfirmDialog from './confirm-dialog'
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react'

interface Student {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  FechaNacimiento?: string
  Edad: number
  IdGrado?: number
  IdSeccion?: number
  IdPadre: number
  Usuario: string
  NombreRol: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
  CodigoEstudiante?: string
  Estado?: string
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNivel, setSelectedNivel] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [studentForDetails, setStudentForDetails] = useState<Student | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = students

    // Filtrar por nivel educativo
    if (selectedNivel !== 'all') {
      filtered = filtered.filter(student => student.NombreNivel === selectedNivel)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(student => {
        const matchesName = student.NombreHijo.toLowerCase().includes(searchLower)
        const matchesLastName = student.ApellidoHijo.toLowerCase().includes(searchLower)
        const matchesUser = student.Usuario.toLowerCase().includes(searchLower)
        const matchesCode = student.CodigoEstudiante?.toLowerCase().includes(searchLower) ?? false
        const matchesGrade = student.NombreGrado?.toLowerCase().includes(searchLower) ?? false
        
        return matchesName || matchesLastName || matchesUser || matchesCode || matchesGrade
      })
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, selectedNivel])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students')
      const data = await response.json()
      setStudents(data)
    } catch {
      // Error cargando estudiantes
      showError('Error', 'No se pudieron cargar los estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (studentData: {
    nombreHijo: string
    apellidoHijo: string
    fechaNacimiento: Date | undefined
    edad: number
    idGrado: number
    idSeccion: number
    codigoEstudiante: string
    estado: string
    vincularPadre: boolean
    idPadre: number
  }) => {
    try {
      const response = await fetch('/api/admin/students/create-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          fechaNacimiento: studentData.fechaNacimiento?.toISOString().split('T')[0] || ''
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error creando estudiante')
      }

      // Recargar la lista de estudiantes
      await fetchStudents()
      showSuccess(
        'Estudiante creado', 
        `${studentData.nombreHijo} ${studentData.apellidoHijo} ha sido registrado correctamente`
      )
    } catch (error) {
      // Error creando estudiante
      showError(
        'Error al crear estudiante', 
        'No se pudo registrar el estudiante. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleEditStudent = async (studentData: Partial<Student>) => {
    try {
      const response = await fetch('/api/admin/students/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error actualizando estudiante')
      }

      // Recargar la lista de estudiantes
      await fetchStudents()
      showSuccess(
        'Estudiante actualizado', 
        `${studentData.NombreHijo} ${studentData.ApellidoHijo} ha sido actualizado correctamente`
      )
    } catch (error) {
      // Error actualizando estudiante
      showError(
        'Error al actualizar estudiante', 
        'No se pudo actualizar el estudiante. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    try {
      const response = await fetch(`/api/admin/students/delete?id=${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error eliminando estudiante')
      }

      // Recargar la lista de estudiantes
      await fetchStudents()
      showSuccess(
        'Estudiante eliminado', 
        'El estudiante ha sido eliminado correctamente del sistema'
      )
    } catch {
      // Error eliminando estudiante
      showError(
        'Error al eliminar estudiante', 
        'No se pudo eliminar el estudiante. Por favor, intenta nuevamente.'
      )
    }
  }

  const handleEditClick = (student: Student) => {
    setStudentToEdit(student)
    setShowEditModal(true)
  }

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student)
    setShowDeleteDialog(true)
  }

  const executeDelete = async () => {
    if (studentToDelete) {
      await handleDeleteStudent(studentToDelete.IdHijo)
      setShowDeleteDialog(false)
      setStudentToDelete(null)
    }
  }

  const getNivelInfo = (nivel?: string) => {
    if (!nivel) {
      return { label: 'Sin asignar', color: 'bg-gray-100 text-gray-800' }
    }
    if (nivel === 'Primaria') {
      return { label: 'Primaria', color: 'bg-blue-100 text-blue-800' }
    }
    if (nivel === 'Secundaria') {
      return { label: 'Secundaria', color: 'bg-green-100 text-green-800' }
    }
    return { label: nivel, color: 'bg-gray-100 text-gray-800' }
  }

  const getGradoInfo = (grado?: string, seccion?: string) => {
    if (!grado) {
      return 'Sin asignar'
    }
    return seccion ? `${grado} ${seccion}` : grado
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        <p className="mt-1 text-sm text-gray-500">Administra todos los estudiantes del colegio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primaria</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.NombreNivel === 'Primaria').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Grados 1-6
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secundaria</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.NombreNivel === 'Secundaria').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Grados 1-5
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => !s.NombreNivel).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sin grado asignado
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
                    placeholder="Buscar por nombre, apellido, código o grado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Nivel Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedNivel}
                  onChange={(e) => setSelectedNivel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="">Sin asignar</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reporte
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Estudiante
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Lista de todos los estudiantes registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron estudiantes</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const nivelInfo = getNivelInfo(student.NombreNivel)
                const gradoInfo = getGradoInfo(student.NombreGrado, student.NombreSeccion)
                
                return (
                  <div key={student.IdHijo} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {student.NombreHijo} {student.ApellidoHijo}
                          </p>
                          {student.CodigoEstudiante && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {student.CodigoEstudiante}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">{student.Edad} años</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${nivelInfo.color}`}>
                            {nivelInfo.label}
                          </span>
                          <span className="text-sm text-gray-600">{gradoInfo}</span>
                        </div>
                        <p className="text-xs text-gray-400">Padre: {student.Usuario}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setStudentForDetails(student)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => confirmDelete(student)}
                    >
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

      {/* Modales */}
      <CreateStudentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateStudent}
      />

      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditStudent}
        student={studentToEdit}
      />

      <StudentDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        student={studentForDetails}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={executeDelete}
        title="Eliminar Estudiante"
        description={`¿Estás seguro de que quieres eliminar a ${studentToDelete?.NombreHijo} ${studentToDelete?.ApellidoHijo}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
