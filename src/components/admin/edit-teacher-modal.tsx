'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { X, Save, User, Mail, Phone, Lock } from 'lucide-react'

interface Teacher {
  IdUsuario: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
  IdRol: number
  NombreRol: string
}

interface EditTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (teacherId: number, teacherData: {
    usuario: string
    contraseña: string
    nombre: string
    apellido: string
    email: string
    telefono: string
  }) => void
  teacher: Teacher | null
}

export default function EditTeacherModal({ isOpen, onClose, onSave, teacher }: EditTeacherModalProps) {
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        usuario: teacher.Usuario,
        contraseña: '', // No mostrar contraseña actual
        nombre: teacher.Nombre,
        apellido: teacher.Apellido,
        email: teacher.Email || '',
        telefono: teacher.Telefono || ''
      })
      setErrors({})
    }
  }, [isOpen, teacher])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido'
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = 'El nombre de usuario debe tener al menos 3 caracteres'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido'
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El formato del email no es válido'
      }
    }

    if (formData.telefono && formData.telefono.trim()) {
      const phoneRegex = /^[0-9+\-\s()]+$/
      if (!phoneRegex.test(formData.telefono)) {
        newErrors.telefono = 'El formato del teléfono no es válido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teacher) return

    if (!validateForm()) {
      showError('Error', 'Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)
    try {
      await onSave(teacher.IdUsuario, formData)
      showSuccess(
        'Docente actualizado', 
        `${formData.nombre} ${formData.apellido} ha sido actualizado correctamente`
      )
      onClose()
    } catch (error) {
      console.error('Error actualizando docente:', error)
      showError(
        'Error al actualizar docente', 
        'No se pudo actualizar el docente. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !teacher) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Editar Docente</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario y Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usuario" className="text-gray-700">Nombre de Usuario</Label>
                <div className="relative mt-1">
                  <Input
                    id="usuario"
                    name="usuario"
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    className={errors.usuario ? 'border-red-500' : ''}
                    placeholder="Ingresa el nombre de usuario"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.usuario && (
                  <p className="text-sm text-red-500 mt-1">{errors.usuario}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contraseña" className="text-gray-700">Nueva Contraseña</Label>
                <div className="relative mt-1">
                  <Input
                    id="contraseña"
                    name="contraseña"
                    type="password"
                    value={formData.contraseña}
                    onChange={(e) => handleInputChange('contraseña', e.target.value)}
                    className={errors.contraseña ? 'border-red-500' : ''}
                    placeholder="Deja vacío para mantener la actual"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.contraseña && (
                  <p className="text-sm text-red-500 mt-1">{errors.contraseña}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Deja vacío para mantener la contraseña actual
                </p>
              </div>
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-gray-700">Nombre</Label>
                <div className="relative mt-1">
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={errors.nombre ? 'border-red-500' : ''}
                    placeholder="Ingresa el nombre"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
                )}
              </div>

              <div>
                <Label htmlFor="apellido" className="text-gray-700">Apellido</Label>
                <div className="relative mt-1">
                  <Input
                    id="apellido"
                    name="apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className={errors.apellido ? 'border-red-500' : ''}
                    placeholder="Ingresa el apellido"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.apellido && (
                  <p className="text-sm text-red-500 mt-1">{errors.apellido}</p>
                )}
              </div>
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Email (Opcional)</Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="correo@ejemplo.com"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefono" className="text-gray-700">Teléfono (Opcional)</Label>
                <div className="relative mt-1">
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={errors.telefono ? 'border-red-500' : ''}
                    placeholder="999999999"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.telefono && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Información del Docente</h3>
              <p className="text-sm text-blue-600">
                Los cambios se aplicarán inmediatamente. Si cambias la contraseña, el docente deberá usar la nueva contraseña para iniciar sesión.
              </p>
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
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar Docente
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
