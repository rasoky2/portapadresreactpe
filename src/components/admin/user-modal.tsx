'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import AddStudentModal from './add-student-modal'
import { X, Save, User, Lock, Shield, Plus } from 'lucide-react'

interface User {
  IdUsuario?: number
  Usuario: string
  Contraseña: string
  IdRol: number
  NombreRol?: string
  Nombre?: string
  Apellido?: string
  Email?: string
  Telefono?: string
}

// Removed unused interface

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  user?: User | null
  mode: 'create' | 'edit'
}

export default function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    Usuario: '',
    Contraseña: '',
    IdRol: 1,
    Nombre: '',
    Apellido: '',
    Email: '',
    Telefono: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const { showError, showSuccess } = useToast()

  const roles = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Docente' },
    { id: 3, name: 'Padre' }
  ]

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          Usuario: user.Usuario,
          Contraseña: user.Contraseña,
          IdRol: user.IdRol,
          Nombre: user.Nombre || '',
          Apellido: user.Apellido || '',
          Email: user.Email || '',
          Telefono: user.Telefono || ''
        })
      } else {
        setFormData({
          Usuario: '',
          Contraseña: '',
          IdRol: 1,
          Nombre: '',
          Apellido: '',
          Email: '',
          Telefono: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, user])

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      return
    }
    
    setCheckingUsername(true)
    try {
      const response = await fetch('/api/admin/users/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      })
      
      const result = await response.json()
      
      if (result.available) {
        setErrors(prev => ({
          ...prev,
          Usuario: ''
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          Usuario: 'El nombre de usuario ya está en uso'
        }))
      }
    } catch {
      // Error verificando nombre de usuario
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
    
    // Verificar disponibilidad del nombre de usuario en tiempo real
    if (field === 'Usuario' && typeof value === 'string' && mode === 'create') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500) // Debounce de 500ms
      
      return () => clearTimeout(timeoutId)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.Usuario.trim()) {
      newErrors.Usuario = 'El nombre de usuario es requerido'
    } else if (formData.Usuario.length < 3) {
      newErrors.Usuario = 'El nombre de usuario debe tener al menos 3 caracteres'
    }

    if (!formData.Contraseña.trim()) {
      newErrors.Contraseña = 'La contraseña es requerida'
    } else if (formData.Contraseña.length < 4) {
      newErrors.Contraseña = 'La contraseña debe tener al menos 4 caracteres'
    }

    if (!formData.IdRol) {
      newErrors.IdRol = 'Debe seleccionar un rol'
    }

    if (!formData.Nombre?.trim()) {
      newErrors.Nombre = 'El nombre es requerido'
    }

    if (!formData.Apellido?.trim()) {
      newErrors.Apellido = 'El apellido es requerido'
    }

    if (formData.Email && formData.Email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.Email)) {
        newErrors.Email = 'El formato del email no es válido'
      }
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
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error guardando usuario:', error)
      showError('Error al guardar', 'No se pudo guardar el usuario. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentData: { nombreHijo: string; apellidoHijo: string; fechaNacimiento: string; idGrado: number; idSeccion: number; codigoEstudiante?: string }) => {
    try {
      const response = await fetch('/api/admin/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      })
      
      if (response.ok) {
        showSuccess('Estudiante agregado', `El estudiante "${studentData.nombreHijo} ${studentData.apellidoHijo}" ha sido agregado exitosamente.`)
        setShowAddStudentModal(false)
      } else {
        const error = await response.json()
        showError('Error al agregar estudiante', error.message || 'No se pudo agregar el estudiante.')
      }
    } catch (error) {
      console.error('Error agregando estudiante:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor.')
    }
  }

  const handleLinkStudent = async (studentId: number) => {
    try {
      const response = await fetch('/api/admin/students/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          parentId: 0 // Se pasará el ID real cuando se implemente
        })
      })
      
      if (response.ok) {
        showSuccess('Estudiante vinculado', 'El estudiante ha sido vinculado exitosamente.')
        setShowAddStudentModal(false)
      } else {
        const error = await response.json()
        showError('Error al vincular estudiante', error.message || 'No se pudo vincular el estudiante.')
      }
    } catch (error) {
      console.error('Error vinculando estudiante:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor.')
    }
  }

  const handleUnlinkStudent = async (studentId: number) => {
    try {
      const response = await fetch('/api/admin/students/unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId
        })
      })
      
      if (response.ok) {
        showSuccess('Estudiante desvinculado', 'El estudiante ha sido desvinculado exitosamente.')
        setShowAddStudentModal(false)
      } else {
        const error = await response.json()
        showError('Error al desvincular estudiante', error.message || 'No se pudo desvincular el estudiante.')
      }
    } catch (error) {
      console.error('Error desvinculando estudiante:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </CardTitle>
              <CardDescription>
                {mode === 'create' 
                  ? 'Crea un nuevo usuario en el sistema'
                  : 'Modifica la información del usuario'
                }
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Nombre de Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Ingresa el nombre de usuario"
                    value={formData.Usuario}
                    onChange={(e) => handleInputChange('Usuario', e.target.value)}
                    className={`pl-10 ${errors.Usuario ? 'border-red-500' : ''}`}
                    disabled={checkingUsername}
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                {errors.Usuario && (
                  <p className="text-sm text-red-500">{errors.Usuario}</p>
                )}
                {checkingUsername && (
                  <p className="text-sm text-blue-500">Verificando disponibilidad...</p>
                )}
              </div>

              {/* Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ingresa el nombre"
                    value={formData.Nombre || ''}
                    onChange={(e) => handleInputChange('Nombre', e.target.value)}
                    className={errors.Nombre ? 'border-red-500' : ''}
                  />
                  {errors.Nombre && (
                    <p className="text-sm text-red-500">{errors.Nombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Ingresa el apellido"
                    value={formData.Apellido || ''}
                    onChange={(e) => handleInputChange('Apellido', e.target.value)}
                    className={errors.Apellido ? 'border-red-500' : ''}
                  />
                  {errors.Apellido && (
                    <p className="text-sm text-red-500">{errors.Apellido}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="contraseña">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="contraseña"
                    type="password"
                    placeholder="Ingresa la contraseña"
                    value={formData.Contraseña}
                    onChange={(e) => handleInputChange('Contraseña', e.target.value)}
                    className={`pl-10 ${errors.Contraseña ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.Contraseña && (
                  <p className="text-sm text-red-500">{errors.Contraseña}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="rol"
                    value={formData.IdRol}
                    onChange={(e) => handleInputChange('IdRol', parseInt(e.target.value))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.IdRol ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.IdRol && (
                  <p className="text-sm text-red-500">{errors.IdRol}</p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.Email || ''}
                    onChange={(e) => handleInputChange('Email', e.target.value)}
                    className={errors.Email ? 'border-red-500' : ''}
                  />
                  {errors.Email && (
                    <p className="text-sm text-red-500">{errors.Email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="999999999"
                    value={formData.Telefono || ''}
                    onChange={(e) => handleInputChange('Telefono', e.target.value)}
                    className={errors.Telefono ? 'border-red-500' : ''}
                  />
                  {errors.Telefono && (
                    <p className="text-sm text-red-500">{errors.Telefono}</p>
                  )}
                </div>
              </div>

              {/* Add Student Button - Only for Parents */}
              {formData.IdRol === 3 && (
                <div className="space-y-2">
                  <Label>Gestión de Estudiantes</Label>
                  <div className="border rounded-md p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">
                      Después de crear el usuario padre, podrás agregar estudiantes desde la gestión de estudiantes.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddStudentModal(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Estudiante
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || checkingUsername}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : checkingUsername ? 'Verificando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Add Student Modal */}
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          onSave={handleAddStudent}
          onLink={handleLinkStudent}
          onUnlink={handleUnlinkStudent}
          parentId={0} // Se pasará el ID real cuando se implemente
          parentName={formData.Usuario}
        />
      </div>
    </div>
  )
}
