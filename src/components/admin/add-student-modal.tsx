'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { X, Save, User, Calendar, GraduationCap, BookOpen, Plus } from 'lucide-react'

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

interface Student {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  Edad: number
  CodigoEstudiante: string
  NombreGrado: string
  NombreSeccion: string
  NombreNivel: string
}

interface StudentData {
  nombreHijo: string
  apellidoHijo: string
  fechaNacimiento: string
  idGrado: number
  idSeccion: number
  codigoEstudiante?: string
}

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (studentData: StudentData) => void
  onLink: (studentId: number) => void
  onUnlink: (studentId: number) => void
  parentId: number
  parentName: string
}

export default function AddStudentModal({ isOpen, onClose, onSave, onLink, onUnlink, parentId, parentName }: AddStudentModalProps) {
  const [formData, setFormData] = useState<StudentData>({
    nombreHijo: '',
    apellidoHijo: '',
    fechaNacimiento: '',
    idGrado: 0,
    idSeccion: 0,
    codigoEstudiante: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [grados, setGrados] = useState<Grade[]>([])
  const [secciones, setSecciones] = useState<Section[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [linkedStudents, setLinkedStudents] = useState<Student[]>([])
  const [loadingGrados, setLoadingGrados] = useState(false)
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingLinkedStudents, setLoadingLinkedStudents] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'link'>('create')
  const { showError } = useToast()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombreHijo: '',
        apellidoHijo: '',
        fechaNacimiento: '',
        idGrado: 0,
        idSeccion: 0,
        codigoEstudiante: ''
      })
      setErrors({})
      setActiveTab('create')
      fetchGrados()
      fetchAvailableStudents()
      fetchLinkedStudents()
    }
  }, [isOpen, parentId])

  useEffect(() => {
    if (formData.idGrado > 0) {
      fetchSecciones(formData.idGrado)
    } else {
      setSecciones([])
    }
  }, [formData.idGrado])

  const fetchGrados = async () => {
    setLoadingGrados(true)
    try {
      const response = await fetch('/api/admin/grades')
      const data = await response.json()
      setGrados(data)
    } catch (error) {
      console.error('Error cargando grados:', error)
      showError('Error', 'No se pudieron cargar los grados disponibles')
    } finally {
      setLoadingGrados(false)
    }
  }

  const fetchSecciones = async (gradoId: number) => {
    setLoadingSecciones(true)
    try {
      const response = await fetch(`/api/admin/sections?gradoId=${gradoId}`)
      const data = await response.json()
      setSecciones(data)
    } catch (error) {
      console.error('Error cargando secciones:', error)
      showError('Error', 'No se pudieron cargar las secciones disponibles')
    } finally {
      setLoadingSecciones(false)
    }
  }

  const fetchAvailableStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch('/api/admin/students/available')
      const data = await response.json()
      setAvailableStudents(data)
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
      showError('Error', 'No se pudieron cargar los estudiantes disponibles')
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchLinkedStudents = async () => {
    setLoadingLinkedStudents(true)
    try {
      const response = await fetch(`/api/admin/students/linked/${parentId}`)
      const data = await response.json()
      setLinkedStudents(data)
    } catch (error) {
      console.error('Error cargando estudiantes vinculados:', error)
      showError('Error', 'No se pudieron cargar los estudiantes vinculados')
    } finally {
      setLoadingLinkedStudents(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const calculateAge = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0
    const today = new Date()
    const birthDate = new Date(fechaNacimiento)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const generateStudentCode = (gradoId: number, seccionId: number) => {
    const grado = grados.find(g => g.IdGrado === gradoId)
    if (!grado) return ''
    
    const nivel = grado.NombreNivel === 'Primaria' ? 'PRI' : 'SEC'
    const numeroGrado = grado.NumeroGrado
    const seccion = secciones.find(s => s.IdSeccion === seccionId)?.NombreSeccion || 'A'
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `${nivel}-${numeroGrado}${seccion}-${random}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nombreHijo || formData.nombreHijo.length < 2) {
      newErrors.nombreHijo = 'El nombre debe tener al menos 2 caracteres.'
    }
    
    if (!formData.apellidoHijo || formData.apellidoHijo.length < 2) {
      newErrors.apellidoHijo = 'El apellido debe tener al menos 2 caracteres.'
    }
    
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida.'
    } else {
      const age = calculateAge(formData.fechaNacimiento)
      if (age < 3 || age > 18) {
        newErrors.fechaNacimiento = 'La edad debe estar entre 3 y 18 años.'
      }
    }
    
    if (!formData.idGrado) {
      newErrors.idGrado = 'Debe seleccionar un grado.'
    }
    
    if (!formData.idSeccion) {
      newErrors.idSeccion = 'Debe seleccionar una sección.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showError('Formulario inválido', 'Por favor corrige los errores antes de continuar.')
      return
    }

    setLoading(true)
    try {
      const age = calculateAge(formData.fechaNacimiento)
      const codigoEstudiante = formData.codigoEstudiante || generateStudentCode(formData.idGrado, formData.idSeccion)
      
      const studentData = {
        ...formData,
        edad: age,
        idPadre: parentId,
        estado: 'Activo'
      }
      
      await onSave(studentData)
      onClose()
    } catch (error) {
      console.error('Error guardando estudiante:', error)
      showError('Error al guardar', 'No se pudo guardar el estudiante. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkStudent = async (studentId: number) => {
    try {
      await onLink(studentId)
      onClose()
    } catch (error) {
      console.error('Error vinculando estudiante:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor.')
    }
  }

  const handleUnlinkStudent = async (studentId: number) => {
    try {
      await onUnlink(studentId)
      // Actualizar la lista de estudiantes vinculados
      fetchLinkedStudents()
    } catch (error) {
      console.error('Error desvinculando estudiante:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative z-10 w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Agregar Estudiante
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Padre:</strong> {parentName}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              <strong>Estudiantes vinculados:</strong> {linkedStudents.length}
            </p>
          </div>

          {/* Mostrar estudiantes vinculados */}
          {linkedStudents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Estudiantes actualmente vinculados:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {linkedStudents.map((student) => (
                  <div key={student.IdHijo} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.NombreHijo} {student.ApellidoHijo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.NombreGrado} {student.NombreSeccion} - {student.CodigoEstudiante}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 font-medium">Vinculado</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnlinkStudent(student.IdHijo)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loadingLinkedStudents}
                      >
                        Desvincular
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'create'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Crear Nuevo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'link'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Vincular Existente
            </button>
          </div>

          {/* Create New Student Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <Label htmlFor="nombreHijo" className="text-gray-700">Nombre del Estudiante</Label>
                <div className="relative mt-1">
                  <Input
                    id="nombreHijo"
                    name="nombreHijo"
                    type="text"
                    value={formData.nombreHijo}
                    onChange={(e) => handleInputChange('nombreHijo', e.target.value)}
                    placeholder="Nombre"
                    className={`pl-10 ${errors.nombreHijo ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.nombreHijo && <p className="text-red-500 text-xs mt-1">{errors.nombreHijo}</p>}
              </div>

              {/* Apellido */}
              <div>
                <Label htmlFor="apellidoHijo" className="text-gray-700">Apellido del Estudiante</Label>
                <div className="relative mt-1">
                  <Input
                    id="apellidoHijo"
                    name="apellidoHijo"
                    type="text"
                    value={formData.apellidoHijo}
                    onChange={(e) => handleInputChange('apellidoHijo', e.target.value)}
                    placeholder="Apellido"
                    className={`pl-10 ${errors.apellidoHijo ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.apellidoHijo && <p className="text-red-500 text-xs mt-1">{errors.apellidoHijo}</p>}
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <Label htmlFor="fechaNacimiento" className="text-gray-700">Fecha de Nacimiento</Label>
              <div className="relative mt-1">
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className={`pl-10 ${errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
              {formData.fechaNacimiento && (
                <p className="text-xs text-gray-500 mt-1">
                  Edad: {calculateAge(formData.fechaNacimiento)} años
                </p>
              )}
            </div>

            {/* Grado */}
            <div>
              <Label htmlFor="idGrado" className="text-gray-700">Grado</Label>
              <div className="relative mt-1">
                <select
                  id="idGrado"
                  name="idGrado"
                  value={formData.idGrado}
                  onChange={(e) => handleInputChange('idGrado', parseInt(e.target.value))}
                  className={`block w-full pl-10 pr-4 py-2 rounded-md border ${errors.idGrado ? 'border-red-500' : 'border-gray-300'} focus:border-brand-500 focus:ring-brand-500 bg-white appearance-none`}
                  disabled={loading || loadingGrados}
                >
                  <option value={0}>Seleccionar grado...</option>
                  {grados.map(grado => (
                    <option key={grado.IdGrado} value={grado.IdGrado}>
                      {grado.NombreNivel} - {grado.NombreGrado}
                    </option>
                  ))}
                </select>
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.idGrado && <p className="text-red-500 text-xs mt-1">{errors.idGrado}</p>}
              {loadingGrados && (
                <p className="text-xs text-gray-500 mt-1">Cargando grados...</p>
              )}
            </div>

            {/* Sección */}
            <div>
              <Label htmlFor="idSeccion" className="text-gray-700">Sección</Label>
              <div className="relative mt-1">
                <select
                  id="idSeccion"
                  name="idSeccion"
                  value={formData.idSeccion}
                  onChange={(e) => handleInputChange('idSeccion', parseInt(e.target.value))}
                  className={`block w-full pl-10 pr-4 py-2 rounded-md border ${errors.idSeccion ? 'border-red-500' : 'border-gray-300'} focus:border-brand-500 focus:ring-brand-500 bg-white appearance-none`}
                  disabled={loading || loadingSecciones || !formData.idGrado}
                >
                  <option value={0}>Seleccionar sección...</option>
                  {secciones.map(seccion => (
                    <option key={seccion.IdSeccion} value={seccion.IdSeccion}>
                      Sección {seccion.NombreSeccion} (Capacidad: {seccion.CapacidadMaxima})
                    </option>
                  ))}
                </select>
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.idSeccion && <p className="text-red-500 text-xs mt-1">{errors.idSeccion}</p>}
              {loadingSecciones && (
                <p className="text-xs text-gray-500 mt-1">Cargando secciones...</p>
              )}
            </div>

            {/* Código de Estudiante (opcional) */}
            <div>
              <Label htmlFor="codigoEstudiante" className="text-gray-700">Código de Estudiante (opcional)</Label>
              <div className="relative mt-1">
                <Input
                  id="codigoEstudiante"
                  name="codigoEstudiante"
                  type="text"
                  value={formData.codigoEstudiante}
                  onChange={(e) => handleInputChange('codigoEstudiante', e.target.value)}
                  placeholder="Se generará automáticamente si se deja vacío"
                  className="pl-10 border-gray-300"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Si se deja vacío, se generará automáticamente basado en el grado y sección seleccionados.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Agregar Estudiante
                  </span>
                )}
              </Button>
            </div>
          </form>
          )}

          {/* Link Existing Student Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estudiantes Disponibles</h3>
                {loadingStudents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando estudiantes...</p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay estudiantes disponibles para vincular</p>
                    <p className="text-sm text-gray-400 mt-2">Todos los estudiantes ya tienen un padre asignado</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableStudents.map((student) => (
                      <div
                        key={student.IdHijo}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.NombreHijo} {student.ApellidoHijo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.NombreNivel} - {student.NombreGrado} {student.NombreSeccion}
                              </p>
                              <p className="text-xs text-gray-400">
                                Código: {student.CodigoEstudiante} • Edad: {student.Edad} años
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleLinkStudent(student.IdHijo)}
                          size="sm"
                          className="ml-4"
                        >
                          Vincular
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
