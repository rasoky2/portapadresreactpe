'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { DatePickerComponent } from '@/components/ui/date-picker'
import { X, Save, User, GraduationCap, BookOpen } from 'lucide-react'

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

interface Parent {
  IdPadre: number
  NombrePadre: string
  ApellidoPadre: string
  Usuario: string
  Email: string
  Telefono: string
}

interface StudentData {
  nombreHijo: string
  apellidoHijo: string
  fechaNacimiento: Date | undefined
  edad: number
  idGrado: number
  idSeccion: number
  codigoEstudiante: string
  estado: string
  vincularPadre: true // Siempre obligatorio
  idPadre: number // Ahora es obligatorio
}

interface CreateStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (studentData: StudentData) => void
}

export default function CreateStudentModal({ isOpen, onClose, onSave }: CreateStudentModalProps) {
  const [formData, setFormData] = useState<StudentData>({
    nombreHijo: '',
    apellidoHijo: '',
    fechaNacimiento: undefined,
    edad: 0,
    idGrado: 0,
    idSeccion: 0,
    codigoEstudiante: '',
    estado: 'Activo',
    vincularPadre: true, // Siempre obligatorio
    idPadre: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [grados, setGrados] = useState<Grade[]>([])
  const [secciones, setSecciones] = useState<Section[]>([])
  const [padres, setPadres] = useState<Parent[]>([])
  const [padresFiltrados, setPadresFiltrados] = useState<Parent[]>([])
  const [busquedaPadre, setBusquedaPadre] = useState('')
  const [loadingGrados, setLoadingGrados] = useState(false)
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const [loadingPadres, setLoadingPadres] = useState(false)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombreHijo: '',
        apellidoHijo: '',
        fechaNacimiento: undefined,
        edad: 0,
        idGrado: 0,
        idSeccion: 0,
        codigoEstudiante: '',
        estado: 'Activo',
        vincularPadre: true, // Siempre obligatorio
        idPadre: 0
      })
      setErrors({})
      setBusquedaPadre('')
      fetchGrados()
      fetchPadres()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.idGrado > 0) {
      fetchSecciones(formData.idGrado)
    } else {
      setSecciones([])
    }
  }, [formData.idGrado])

  useEffect(() => {
    if (busquedaPadre.trim() === '') {
      setPadresFiltrados(padres)
    } else {
      const filtrados = padres.filter(padre => {
        const nombreCompleto = `${padre.NombrePadre} ${padre.ApellidoPadre}`.toLowerCase()
        const usuario = padre.Usuario.toLowerCase()
        const busqueda = busquedaPadre.toLowerCase()
        return nombreCompleto.includes(busqueda) || usuario.includes(busqueda)
      })
      setPadresFiltrados(filtrados)
    }
  }, [busquedaPadre, padres])

  const fetchGrados = async () => {
    setLoadingGrados(true)
    try {
      const response = await fetch('/api/admin/grades')
      const data = await response.json()
      setGrados(data)
    } catch {
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
    } catch {
      // Error cargando secciones
      showError('Error', 'No se pudieron cargar las secciones disponibles')
    } finally {
      setLoadingSecciones(false)
    }
  }

  const fetchPadres = async () => {
    setLoadingPadres(true)
    try {
      const response = await fetch('/api/admin/parents')
      const data = await response.json()
      setPadres(data)
      setPadresFiltrados(data)
    } catch {
      // Error cargando padres
      showError('Error', 'No se pudieron cargar los padres disponibles')
    } finally {
      setLoadingPadres(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handlePadreSelect = (padreId: number) => {
    handleInputChange('idPadre', padreId)
    // Limpiar búsqueda después de seleccionar
    setBusquedaPadre('')
  }

  const handleBusquedaChange = (value: string) => {
    setBusquedaPadre(value)
  }

  const calculateAge = (fechaNacimiento: Date | undefined) => {
    if (!fechaNacimiento) return 0
    const today = new Date()
    let age = today.getFullYear() - fechaNacimiento.getFullYear()
    const monthDiff = today.getMonth() - fechaNacimiento.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fechaNacimiento.getDate())) {
      age--
    }
    return age
  }

  const generateStudentCode = (gradoId: number, seccionId: number) => {
    const grado = grados.find(g => g.IdGrado === gradoId)
    const seccion = secciones.find(s => s.IdSeccion === seccionId)
    
    if (!grado || !seccion) return ''
    
    const nivelPrefix = grado.NombreNivel === 'Primaria' ? 'PRI' : 'SEC'
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `${nivelPrefix}-${year}-${randomNum}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombreHijo.trim()) {
      newErrors.nombreHijo = 'El nombre es requerido'
    }

    if (!formData.apellidoHijo.trim()) {
      newErrors.apellidoHijo = 'El apellido es requerido'
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    } else {
      const age = calculateAge(formData.fechaNacimiento)
      if (age < 3 || age > 18) {
        newErrors.fechaNacimiento = 'La edad debe estar entre 3 y 18 años'
      }
    }

    if (!formData.idGrado) {
      newErrors.idGrado = 'Debe seleccionar un grado'
    }

    if (!formData.idSeccion) {
      newErrors.idSeccion = 'Debe seleccionar una sección'
    }

    if (!formData.idPadre || formData.idPadre === 0) {
      newErrors.idPadre = 'Debe seleccionar un padre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showError('Error', 'Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)
    try {
      const age = calculateAge(formData.fechaNacimiento)
      const studentData = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento?.toISOString().split('T')[0] || '',
        edad: age,
        estado: 'Activo'
      } as any // Conversión temporal para compatibilidad

      await onSave(studentData)
      showSuccess(
        'Estudiante creado', 
        `${studentData.nombreHijo} ${studentData.apellidoHijo} ha sido registrado correctamente`
      )
      onClose()
    } catch {
      // Error creando estudiante
      showError(
        'Error al crear estudiante', 
        'No se pudo registrar el estudiante. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Crear Nuevo Estudiante</CardTitle>
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
                    value={formData.nombreHijo}
                    onChange={(e) => handleInputChange('nombreHijo', e.target.value)}
                    className={errors.nombreHijo ? 'border-red-500' : ''}
                    placeholder="Ingresa el nombre"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.nombreHijo && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombreHijo}</p>
                )}
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
                    className={errors.apellidoHijo ? 'border-red-500' : ''}
                    placeholder="Ingresa el apellido"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.apellidoHijo && (
                  <p className="text-sm text-red-500 mt-1">{errors.apellidoHijo}</p>
                )}
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <Label htmlFor="fechaNacimiento" className="text-gray-700">Fecha de Nacimiento</Label>
              <div className="mt-1">
                <DatePickerComponent
                  value={formData.fechaNacimiento}
                  onChange={(date) => handleInputChange('fechaNacimiento', date)}
                  placeholder="Seleccionar fecha de nacimiento"
                  className={errors.fechaNacimiento ? 'border-red-500' : ''}
                />
              </div>
              {errors.fechaNacimiento && (
                <p className="text-sm text-red-500 mt-1">{errors.fechaNacimiento}</p>
              )}
              {formData.fechaNacimiento && (
                <p className="text-sm text-gray-500 mt-1">
                  Edad: {calculateAge(formData.fechaNacimiento)} años
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grado */}
              <div>
                <Label htmlFor="idGrado" className="text-gray-700">Grado</Label>
                <div className="relative mt-1">
                  <select
                    id="idGrado"
                    name="idGrado"
                    value={formData.idGrado}
                    onChange={(e) => handleInputChange('idGrado', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.idGrado ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingGrados}
                  >
                    <option value={0}>Seleccionar grado</option>
                    {grados.map((grado) => (
                      <option key={grado.IdGrado} value={grado.IdGrado}>
                        {grado.NombreGrado} ({grado.NombreNivel})
                      </option>
                    ))}
                  </select>
                  <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.idGrado && (
                  <p className="text-sm text-red-500 mt-1">{errors.idGrado}</p>
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
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.idSeccion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingSecciones || !formData.idGrado}
                  >
                    <option value={0}>Seleccionar sección</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.IdSeccion} value={seccion.IdSeccion}>
                        {seccion.NombreSeccion}
                      </option>
                    ))}
                  </select>
                  <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.idSeccion && (
                  <p className="text-sm text-red-500 mt-1">{errors.idSeccion}</p>
                )}
              </div>
            </div>

            {/* Código de Estudiante */}
            <div>
              <Label htmlFor="codigoEstudiante" className="text-gray-700">Código de Estudiante</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="codigoEstudiante"
                  name="codigoEstudiante"
                  type="text"
                  value={formData.codigoEstudiante}
                  onChange={(e) => handleInputChange('codigoEstudiante', e.target.value)}
                  placeholder="Se generará automáticamente"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const code = generateStudentCode(formData.idGrado, formData.idSeccion)
                    handleInputChange('codigoEstudiante', code)
                  }}
                  disabled={!formData.idGrado || !formData.idSeccion}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío para generar automáticamente
              </p>
            </div>

            {/* Vincular Padre - Obligatorio */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label className="text-gray-700 font-medium text-lg">
                  Vincular con un padre existente *
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Es obligatorio vincular el estudiante con un padre registrado
                </p>
              </div>

              <div>
                <Label htmlFor="busquedaPadre" className="text-gray-700">Buscar Padre</Label>
                <div className="relative mt-1">
                    <Input
                      id="busquedaPadre"
                      type="text"
                      placeholder="Buscar por nombre, apellido o usuario..."
                      value={busquedaPadre}
                      onChange={(e) => handleBusquedaChange(e.target.value)}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  
                  {/* Lista de padres filtrados */}
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    {loadingPadres ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mx-auto"></div>
                        <p className="text-xs mt-1">Cargando padres...</p>
                      </div>
                    ) : padresFiltrados.length === 0 ? (
                      <div className="p-3 text-center text-gray-500">
                        <p className="text-sm">No se encontraron padres</p>
                        <p className="text-xs">Intenta con otros términos de búsqueda</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {padresFiltrados.map((padre) => (
                          <button
                            key={padre.IdPadre}
                            type="button"
                            onClick={() => handlePadreSelect(padre.IdPadre)}
                            className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                              formData.idPadre === padre.IdPadre ? 'bg-brand-50 border-l-4 border-brand-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {padre.NombrePadre} {padre.ApellidoPadre}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Usuario: {padre.Usuario}
                                </p>
                                {padre.Email && (
                                  <p className="text-xs text-gray-400">
                                    {padre.Email}
                                  </p>
                                )}
                              </div>
                              {formData.idPadre === padre.IdPadre && (
                                <div className="text-brand-600">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Padre seleccionado */}
                  {formData.idPadre && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Padre seleccionado: {padres.find(p => p.IdPadre === formData.idPadre)?.NombrePadre} {padres.find(p => p.IdPadre === formData.idPadre)?.ApellidoPadre}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleInputChange('idPadre', 0)}
                            className="text-xs text-green-600 hover:text-green-800 underline"
                          >
                            Cambiar selección
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.idPadre && (
                    <p className="text-sm text-red-500 mt-1">{errors.idPadre}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Requerido: Debes seleccionar un padre para poder crear el estudiante
                  </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Estudiante
                  </>
                )}
          </Button>
        </div>
      </form>
    </CardContent>
    
    {/* Toast Container */}
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  </Card>
</div>
  )
}
