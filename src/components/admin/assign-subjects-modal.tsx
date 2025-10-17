'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { X, Plus, Trash2, BookOpen, GraduationCap, Users } from 'lucide-react'

interface Subject {
  IdMateria: number
  NombreMateria: string
  IdNivel: number
  NombreNivel: string
  HorasSemanales: number
}

interface Grade {
  IdGrado: number
  NombreGrado: string
  NumeroGrado: number
  IdNivel: number
  NombreNivel: string
}

interface Section {
  IdSeccion: number
  NombreSeccion: string
  IdGrado: number
  NombreGrado: string
  CapacidadMaxima: number
}

interface Assignment {
  IdAsignacion: number
  IdMateria: number
  IdGrado: number
  IdSeccion: number
  NombreMateria: string
  NombreGrado: string
  NombreSeccion: string
  NombreNivel: string
}

interface Teacher {
  IdUsuario: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
}

interface AssignSubjectsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assignments: Assignment[]) => void
  teacher: Teacher | null
}

export default function AssignSubjectsModal({ isOpen, onClose, onSave, teacher }: AssignSubjectsModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  // Estados para el formulario de nueva asignación
  const [selectedSubject, setSelectedSubject] = useState<number>(0)
  const [selectedGrade, setSelectedGrade] = useState<number>(0)
  const [selectedSection, setSelectedSection] = useState<number>(0)

  useEffect(() => {
    if (isOpen && teacher) {
      setLoadingData(true)
      Promise.all([
        fetchSubjects(),
        fetchGrades(),
        fetchTeacherAssignments()
      ]).finally(() => setLoadingData(false))
    }
  }, [isOpen, teacher])

  useEffect(() => {
    if (selectedGrade > 0) {
      fetchSections(selectedGrade)
    } else {
      setSections([])
    }
  }, [selectedGrade])

  // Filtrar grados según la materia seleccionada
  useEffect(() => {
    if (selectedSubject > 0) {
      const subject = subjects.find(s => s.IdMateria === selectedSubject)
      if (subject) {
        // Filtrar grados que pertenecen al mismo nivel que la materia
        const filteredGrades = grades.filter(g => g.IdNivel === subject.IdNivel)
        setGrades(filteredGrades)
        
        // Resetear selecciones si el grado actual no es compatible
        if (selectedGrade > 0) {
          const currentGrade = grades.find(g => g.IdGrado === selectedGrade)
          if (currentGrade && currentGrade.IdNivel !== subject.IdNivel) {
            setSelectedGrade(0)
            setSelectedSection(0)
            setSections([])
          }
        }
      }
    } else {
      // Si no hay materia seleccionada, mostrar todos los grados
      fetchGrades()
    }
  }, [selectedSubject, subjects])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error cargando materias:', error)
      showError('Error', 'No se pudieron cargar las materias')
    }
  }

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/admin/grades')
      const data = await response.json()
      setGrades(data)
    } catch (error) {
      console.error('Error cargando grados:', error)
      showError('Error', 'No se pudieron cargar los grados')
    }
  }

  const fetchSections = async (gradeId: number) => {
    try {
      const response = await fetch(`/api/admin/sections?gradoId=${gradeId}`)
      const data = await response.json()
      setSections(data)
    } catch (error) {
      console.error('Error cargando secciones:', error)
      showError('Error', 'No se pudieron cargar las secciones')
    }
  }

  const fetchTeacherAssignments = async () => {
    if (!teacher) return
    
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.IdUsuario}/assignments`)
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Error cargando asignaciones:', error)
      showError('Error', 'No se pudieron cargar las asignaciones del docente')
    }
  }

  const addAssignment = () => {
    if (!selectedSubject || !selectedGrade || !selectedSection) {
      showError('Error', 'Por favor selecciona materia, grado y sección')
      return
    }

    const subject = subjects.find(s => s.IdMateria === selectedSubject)
    const grade = grades.find(g => g.IdGrado === selectedGrade)
    const section = sections.find(s => s.IdSeccion === selectedSection)

    if (!subject || !grade || !section) return

    // Verificar si ya existe esta asignación
    const exists = assignments.some(a => 
      a.IdMateria === selectedSubject && 
      a.IdGrado === selectedGrade && 
      a.IdSeccion === selectedSection
    )

    if (exists) {
      showError('Error', 'Esta asignación ya existe')
      return
    }

    const newAssignment: Assignment = {
      IdAsignacion: 0, // Temporal, se asignará al guardar
      IdMateria: selectedSubject,
      IdGrado: selectedGrade,
      IdSeccion: selectedSection,
      NombreMateria: subject.NombreMateria,
      NombreGrado: grade.NombreGrado,
      NombreSeccion: section.NombreSeccion,
      NombreNivel: grade.NombreNivel
    }

    setAssignments([...assignments, newAssignment])
    
    // Limpiar formulario
    setSelectedSubject(0)
    setSelectedGrade(0)
    setSelectedSection(0)
  }

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!teacher) return

    setLoading(true)
    try {
      await onSave(assignments)
      showSuccess(
        'Asignaciones guardadas', 
        `Se han guardado ${assignments.length} asignaciones para ${teacher.Nombre} ${teacher.Apellido}`
      )
      onClose()
    } catch (error) {
      console.error('Error guardando asignaciones:', error)
      showError(
        'Error al guardar asignaciones', 
        'No se pudieron guardar las asignaciones. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !teacher) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Asignar Materias - {teacher.Nombre} {teacher.Apellido}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formulario para agregar asignación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Nueva Asignación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materia
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value={0}>Seleccionar materia</option>
                        {subjects.map((subject) => (
                          <option key={subject.IdMateria} value={subject.IdMateria}>
                            {subject.NombreMateria} ({subject.NombreNivel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grado
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        disabled={!selectedSubject || grades.length === 0}
                      >
                        <option value={0}>
                          {!selectedSubject 
                            ? 'Primero selecciona una materia' 
                            : grades.length === 0 
                              ? 'No hay grados disponibles para este nivel'
                              : 'Seleccionar grado'
                          }
                        </option>
                        {grades.map((grade) => (
                          <option key={grade.IdGrado} value={grade.IdGrado}>
                            {grade.NombreGrado} ({grade.NombreNivel})
                          </option>
                        ))}
                      </select>
                      {selectedSubject && grades.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          No hay grados disponibles para el nivel de esta materia
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sección
                      </label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        disabled={!selectedGrade || sections.length === 0}
                      >
                        <option value={0}>
                          {!selectedGrade 
                            ? 'Primero selecciona un grado' 
                            : sections.length === 0 
                              ? 'No hay secciones disponibles'
                              : 'Seleccionar sección'
                          }
                        </option>
                        {sections.map((section) => (
                          <option key={section.IdSeccion} value={section.IdSeccion}>
                            {section.NombreSeccion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button onClick={addAssignment} disabled={!selectedSubject || !selectedGrade || !selectedSection}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Asignación
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de asignaciones actuales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asignaciones Actuales ({assignments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay asignaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{assignment.NombreMateria}</p>
                              <p className="text-sm text-gray-500">
                                {assignment.NombreGrado} {assignment.NombreSeccion} - {assignment.NombreNivel}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAssignment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Guardar Asignaciones
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Card>
    </div>
  )
}
