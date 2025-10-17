'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { X, Save, User, Calendar, GraduationCap, BookOpen } from 'lucide-react'

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
  FechaNacimiento?: string
  Edad: number
  IdGrado?: number
  IdSeccion?: number
  CodigoEstudiante?: string
  Estado?: string
  IdPadre: number
  Usuario: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
}

interface EditStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (studentData: Partial<Student>) => void
  student: Student | null
}

export default function EditStudentModal({ isOpen, onClose, onSave, student }: EditStudentModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    NombreHijo: '',
    ApellidoHijo: '',
    FechaNacimiento: '',
    IdGrado: 0,
    IdSeccion: 0,
    CodigoEstudiante: '',
    Estado: 'Activo'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [grados, setGrados] = useState<Grade[]>([])
  const [secciones, setSecciones] = useState<Section[]>([])
  const [loadingGrados, setLoadingGrados] = useState(false)
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const { showError } = useToast()

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        IdHijo: student.IdHijo,
        NombreHijo: student.NombreHijo,
        ApellidoHijo: student.ApellidoHijo,
        FechaNacimiento: student.FechaNacimiento || '',
        IdGrado: student.IdGrado || 0,
        IdSeccion: student.IdSeccion || 0,
        CodigoEstudiante: student.CodigoEstudiante || '',
        Estado: student.Estado || 'Activo'
      })
      setErrors({})
      fetchGrados()
    }
  }, [isOpen, student])

  useEffect(() => {
    if (formData.IdGrado && formData.IdGrado > 0) {
      fetchSecciones(formData.IdGrado)
    } else {
      setSecciones([])
    }
  }, [formData.IdGrado])

  const fetchGrados = async () => {
    setLoadingGrados(true)
    try {
      const response = await fetch('/api/admin/grades')
      const data = await response.json()
      setGrados(data)
    } catch (error) {
      // Error cargando grados
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
      // Error cargando secciones
      showError('Error', 'No se pudieron cargar las secciones disponibles')
    } finally {
      setLoadingSecciones(false)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.NombreHijo || formData.NombreHijo.length < 2) {
      newErrors.NombreHijo = 'El nombre debe tener al menos 2 caracteres.'
    }
    
    if (!formData.ApellidoHijo || formData.ApellidoHijo.length < 2) {
      newErrors.ApellidoHijo = 'El apellido debe tener al menos 2 caracteres.'
    }
    
    if (!formData.FechaNacimiento) {
      newErrors.FechaNacimiento = 'La fecha de nacimiento es requerida.'
    } else {
      const age = calculateAge(formData.FechaNacimiento)
      if (age < 3 || age > 18) {
        newErrors.FechaNacimiento = 'La edad debe estar entre 3 y 18 años.'
      }
    }
    
    if (!formData.IdGrado) {
      newErrors.IdGrado = 'Debe seleccionar un grado.'
    }
    
    if (!formData.IdSeccion) {
      newErrors.IdSeccion = 'Debe seleccionar una sección.'
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
      const age = calculateAge(formData.FechaNacimiento || '')
      
      const studentData = {
        ...formData,
        Edad: age
      }
      
      await onSave(studentData)
      onClose()
    } catch (error) {
      // Error guardando estudiante
      showError('Error al guardar', 'No se pudo guardar el estudiante. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative z-10 w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Editar Estudiante
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
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
                    value={formData.NombreHijo || ''}
                    onChange={(e) => handleInputChange('NombreHijo', e.target.value)}
                    placeholder="Nombre"
                    className={`pl-10 ${errors.NombreHijo ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.NombreHijo && <p className="text-red-500 text-xs mt-1">{errors.NombreHijo}</p>}
              </div>

              {/* Apellido */}
              <div>
                <Label htmlFor="apellidoHijo" className="text-gray-700">Apellido del Estudiante</Label>
                <div className="relative mt-1">
                  <Input
                    id="apellidoHijo"
                    name="apellidoHijo"
                    type="text"
                    value={formData.ApellidoHijo || ''}
                    onChange={(e) => handleInputChange('ApellidoHijo', e.target.value)}
                    placeholder="Apellido"
                    className={`pl-10 ${errors.ApellidoHijo ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.ApellidoHijo && <p className="text-red-500 text-xs mt-1">{errors.ApellidoHijo}</p>}
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
                  value={formData.FechaNacimiento || ''}
                  onChange={(e) => handleInputChange('FechaNacimiento', e.target.value)}
                  className={`pl-10 ${errors.FechaNacimiento ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.FechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.FechaNacimiento}</p>}
              {formData.FechaNacimiento && (
                <p className="text-xs text-gray-500 mt-1">
                  Edad: {calculateAge(formData.FechaNacimiento)} años
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
                  value={formData.IdGrado || 0}
                  onChange={(e) => handleInputChange('IdGrado', parseInt(e.target.value))}
                  className={`block w-full pl-10 pr-4 py-2 rounded-md border ${errors.IdGrado ? 'border-red-500' : 'border-gray-300'} focus:border-brand-500 focus:ring-brand-500 bg-white appearance-none`}
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
              {errors.IdGrado && <p className="text-red-500 text-xs mt-1">{errors.IdGrado}</p>}
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
                  value={formData.IdSeccion || 0}
                  onChange={(e) => handleInputChange('IdSeccion', parseInt(e.target.value))}
                  className={`block w-full pl-10 pr-4 py-2 rounded-md border ${errors.IdSeccion ? 'border-red-500' : 'border-gray-300'} focus:border-brand-500 focus:ring-brand-500 bg-white appearance-none`}
                  disabled={loading || loadingSecciones || !formData.IdGrado}
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
              {errors.IdSeccion && <p className="text-red-500 text-xs mt-1">{errors.IdSeccion}</p>}
              {loadingSecciones && (
                <p className="text-xs text-gray-500 mt-1">Cargando secciones...</p>
              )}
            </div>

            {/* Código de Estudiante */}
            <div>
              <Label htmlFor="codigoEstudiante" className="text-gray-700">Código de Estudiante</Label>
              <div className="relative mt-1">
                <Input
                  id="codigoEstudiante"
                  name="codigoEstudiante"
                  type="text"
                  value={formData.CodigoEstudiante || ''}
                  onChange={(e) => handleInputChange('CodigoEstudiante', e.target.value)}
                  placeholder="Código del estudiante"
                  className="pl-10 border-gray-300"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado" className="text-gray-700">Estado</Label>
              <div className="relative mt-1">
                <select
                  id="estado"
                  name="estado"
                  value={formData.Estado || 'Activo'}
                  onChange={(e) => handleInputChange('Estado', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-brand-500 focus:ring-brand-500 bg-white appearance-none"
                  disabled={loading}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Graduado">Graduado</option>
                </select>
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
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
                    Actualizar Estudiante
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
