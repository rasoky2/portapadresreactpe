'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast, ToastContainer } from '@/components/ui/toast'
import CreateSubjectModal from './create-subject-modal'
import EditSubjectModal from './edit-subject-modal'
import SubjectSchedulesModal from './subject-schedules-modal'
import ConfirmDialog from './confirm-dialog'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  GraduationCap,
  Clock,
  Calendar
} from 'lucide-react'

interface Subject {
  IdMateria: number
  NombreMateria: string
  IdNivel: number
  NombreNivel: string
  HorasSemanales: number
  DocentesAsignados?: number
  EstudiantesAsignados?: number
}

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNivel, setSelectedNivel] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSchedulesModal, setShowSchedulesModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null)
  const [subjectForSchedules, setSubjectForSchedules] = useState<Subject | null>(null)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    let filtered = subjects

    // Filtrar por nivel educativo
    if (selectedNivel !== 'all') {
      filtered = filtered.filter(subject => subject.NombreNivel === selectedNivel)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(subject => 
        subject.NombreMateria.toLowerCase().includes(searchLower) ||
        subject.NombreNivel.toLowerCase().includes(searchLower)
      )
    }

    setFilteredSubjects(filtered)
  }, [subjects, searchTerm, selectedNivel])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error cargando materias:', error)
      showError('Error', 'No se pudieron cargar las materias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (subjectData: {
    nombreMateria: string
    idNivel: number
    horasSemanales: number
  }) => {
    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error creando materia')
      }

      // Recargar la lista de materias
      await fetchSubjects()
      showSuccess(
        'Materia creada', 
        `${subjectData.nombreMateria} ha sido registrada correctamente`
      )
    } catch (error) {
      console.error('Error creando materia:', error)
      showError(
        'Error al crear materia', 
        'No se pudo registrar la materia. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleEditSubject = async (subjectId: number, subjectData: {
    nombreMateria: string
    idNivel: number
    horasSemanales: number
  }) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error actualizando materia')
      }

      // Recargar la lista de materias
      await fetchSubjects()
      showSuccess(
        'Materia actualizada', 
        `${subjectData.nombreMateria} ha sido actualizada correctamente`
      )
    } catch (error) {
      console.error('Error actualizando materia:', error)
      showError(
        'Error al actualizar materia', 
        'No se pudo actualizar la materia. Por favor, intenta nuevamente.'
      )
      throw error
    }
  }

  const handleDeleteSubject = async (subjectId: number) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error eliminando materia')
      }

      // Recargar la lista de materias
      await fetchSubjects()
      showSuccess(
        'Materia eliminada', 
        'La materia ha sido eliminada correctamente del sistema'
      )
    } catch (error) {
      console.error('Error eliminando materia:', error)
      showError(
        'Error al eliminar materia', 
        'No se pudo eliminar la materia. Por favor, intenta nuevamente.'
      )
    }
  }

  const openEditModal = (subject: Subject) => {
    setSubjectToEdit(subject)
    setShowEditModal(true)
  }

  const openSchedulesModal = (subject: Subject) => {
    setSubjectForSchedules(subject)
    setShowSchedulesModal(true)
  }

  const confirmDelete = (subject: Subject) => {
    setSubjectToDelete(subject)
    setShowDeleteDialog(true)
  }

  const executeDelete = async () => {
    if (subjectToDelete) {
      await handleDeleteSubject(subjectToDelete.IdMateria)
      setShowDeleteDialog(false)
      setSubjectToDelete(null)
    }
  }

  const getNivelInfo = (nivel: string) => {
    if (nivel === 'Primaria') {
      return { label: 'Primaria', color: 'bg-blue-100 text-blue-800' }
    }
    if (nivel === 'Secundaria') {
      return { label: 'Secundaria', color: 'bg-green-100 text-green-800' }
    }
    return { label: nivel, color: 'bg-gray-100 text-gray-800' }
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Materias</h1>
        <p className="text-gray-600 mt-2">Administra las materias del colegio por nivel educativo</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Materias</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Primaria</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.filter(s => s.NombreNivel === 'Primaria').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Secundaria</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.filter(s => s.NombreNivel === 'Secundaria').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Promedio Horas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.length > 0 
                    ? Math.round(subjects.reduce((acc, s) => acc + s.HorasSemanales, 0) / subjects.length * 10) / 10
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre de materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedNivel}
                onChange={(e) => setSelectedNivel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Todos los niveles</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Materia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de materias */}
      <Card>
        <CardHeader>
          <CardTitle>Materias ({filteredSubjects.length})</CardTitle>
          <CardDescription>
            Lista de todas las materias del colegio organizadas por nivel educativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron materias</p>
              </div>
            ) : (
              filteredSubjects.map((subject) => {
                const nivelInfo = getNivelInfo(subject.NombreNivel)
                
                return (
                  <div key={subject.IdMateria} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{subject.NombreMateria}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${nivelInfo.color}`}>
                            {nivelInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {subject.HorasSemanales} horas/semana
                          </span>
                          {subject.DocentesAsignados !== undefined && (
                            <span className="text-sm text-gray-500">
                              {subject.DocentesAsignados} docentes asignados
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openSchedulesModal(subject)}
                        title="Gestionar horarios"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditModal(subject)}
                        title="Editar materia"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => confirmDelete(subject)}
                        title="Eliminar materia"
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
      <CreateSubjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSubject}
      />

      <EditSubjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSubject}
        subject={subjectToEdit}
      />

      <SubjectSchedulesModal
        isOpen={showSchedulesModal}
        onClose={() => setShowSchedulesModal(false)}
        subject={subjectForSchedules}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={executeDelete}
        title="Eliminar Materia"
        description={`¿Estás seguro de que quieres eliminar la materia "${subjectToDelete?.NombreMateria}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
