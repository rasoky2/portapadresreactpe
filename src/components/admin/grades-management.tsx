'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  Filter,
  Download,
  Star
} from 'lucide-react'
import ConfirmDialog from './confirm-dialog'
import { ToastContainer, useToast } from '@/components/ui/toast'
import GradeModal from './grade-modal'
import CourseNotesModal from './course-notes-modal'

interface Grade {
  IdNota: number
  IdHijo: number
  Materia: string
  Unidad: string
  Criterio: string
  Nota: number
  Fecha: string
  NombreHijo?: string
  TotalMatriculados?: number
  PromedioCurso?: number
  DocenteNombre?: string
  DocenteApellido?: string
}

export default function GradesManagement() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [gradeToEdit, setGradeToEdit] = useState<Grade | null>(null)
  const [courseModalOpen, setCourseModalOpen] = useState(false)

  useEffect(() => {
    fetchGrades()
  }, [])

  useEffect(() => {
    filterGrades()
  }, [grades, searchTerm, subjectFilter])

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/admin/notes')
      const data = await response.json()
      setGrades(data)
    } catch (error) {
      showError('Error', 'No se pudieron cargar las calificaciones')
    } finally {
      setLoading(false)
    }
  }

  const filterGrades = () => {
    let filtered = grades

    if (searchTerm) {
      filtered = filtered.filter(grade =>
        grade.Materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.Criterio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grade.NombreHijo && grade.NombreHijo.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(grade => grade.Materia === subjectFilter)
    }

    setFilteredGrades(filtered)
  }

  const getGradeColor = (nota: number) => {
    if (nota >= 9) return 'text-green-600 bg-green-50'
    if (nota >= 7) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getGradeStars = (nota: number) => {
    const stars = Math.floor(nota / 2)
    return Array.from({ length: 5 }, (_, i) => i < stars)
  }

  const getSubjects = () => {
    const subjects = [...new Set(grades.map(grade => grade.Materia))]
    return subjects
  }

  const getAverageGrade = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.Nota, 0)
    return (sum / grades.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <p className="mt-1 text-sm text-gray-500">Administra las calificaciones de todos los estudiantes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calificaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageGrade()}</div>
            <p className="text-xs text-muted-foreground">
              De todas las materias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSubjects().length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes materias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excelentes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.Nota >= 9).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Notas 9.0 o superior
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
                    placeholder="Buscar calificaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <div className="sm:w-48">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todas las materias</option>
                  {getSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => { setModalMode('create'); setGradeToEdit(null); setModalOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Calificación
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Calificaciones ({filteredGrades.length})</CardTitle>
          <CardDescription>
            Lista de todas las calificaciones registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGrades.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron calificaciones</p>
              </div>
            ) : (
              filteredGrades.map((grade) => (
                <div key={grade.IdNota} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{grade.Materia}</p>
                      {/* Criterio eliminado de la UI */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {grade.NombreHijo || `Estudiante ${grade.IdHijo}`}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {new Date(grade.Fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        {typeof grade.TotalMatriculados === 'number' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                            {grade.TotalMatriculados} alumnos
                          </span>
                        )}
                        {typeof grade.PromedioCurso === 'number' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Prom. {grade.PromedioCurso}
                          </span>
                        )}
                        {(grade.DocenteNombre || grade.DocenteApellido) && (
                          <span className="text-xs text-gray-500">Prof.: {`${grade.DocenteNombre ?? ''} ${grade.DocenteApellido ?? ''}`.trim()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(grade.Nota)}`}>
                        {grade.Nota}
                      </div>
                      <div className="flex justify-center mt-1">
                        {getGradeStars(grade.Nota).map((filled, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setCourseModalOpen(true)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setModalMode('edit'); setGradeToEdit(grade); setModalOpen(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => { setGradeToDelete(grade); setDeleteDialogOpen(true) }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <GradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        grade={gradeToEdit as any}
        onSave={async (payload, idNota) => {
          if (modalMode === 'create') {
            const res = await fetch('/api/admin/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (!res.ok) { showError('Error', 'No se pudo crear la nota'); throw new Error('create'); }
            await fetchGrades()
            showSuccess('Nota creada', payload.criterio || payload.fecha)
          } else if (idNota) {
            const res = await fetch(`/api/admin/notes/${idNota}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (!res.ok) { showError('Error', 'No se pudo actualizar la nota'); throw new Error('update'); }
            await fetchGrades()
            showSuccess('Nota actualizada', payload.criterio || payload.fecha)
          }
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (!gradeToDelete) return
          const res = await fetch(`/api/admin/notes/${gradeToDelete.IdNota}`, { method: 'DELETE' })
          if (!res.ok) { showError('Error', 'No se pudo eliminar la nota'); return }
          await fetchGrades()
          showSuccess('Nota eliminada', gradeToDelete.Criterio)
          setDeleteDialogOpen(false)
          setGradeToDelete(null)
        }}
        title="Eliminar Nota"
        description={`¿Deseas eliminar la nota de "${gradeToDelete?.Materia}" para ${gradeToDelete?.NombreHijo}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <CourseNotesModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
      />
    </div>
  )
}
