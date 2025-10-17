'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { X, Save, BookOpen, GraduationCap, Clock } from 'lucide-react'

interface CreateSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subjectData: {
    nombreMateria: string
    idNivel: number
    horasSemanales: number
  }) => void
}

export default function CreateSubjectModal({ isOpen, onClose, onSave }: CreateSubjectModalProps) {
  const [formData, setFormData] = useState({
    nombreMateria: '',
    idNivel: 0,
    horasSemanales: 2
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombreMateria: '',
        idNivel: 0,
        horasSemanales: 2
      })
      setErrors({})
    }
  }, [isOpen])

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombreMateria.trim()) {
      newErrors.nombreMateria = 'El nombre de la materia es requerido'
    } else if (formData.nombreMateria.length < 3) {
      newErrors.nombreMateria = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.idNivel || formData.idNivel === 0) {
      newErrors.idNivel = 'Debe seleccionar un nivel educativo'
    }

    if (formData.horasSemanales < 1 || formData.horasSemanales > 10) {
      newErrors.horasSemanales = 'Las horas semanales deben estar entre 1 y 10'
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
      await onSave(formData)
      showSuccess(
        'Materia creada', 
        `${formData.nombreMateria} ha sido registrada correctamente`
      )
      onClose()
    } catch (error) {
      console.error('Error creando materia:', error)
      showError(
        'Error al crear materia', 
        'No se pudo registrar la materia. Por favor, intenta nuevamente.'
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
          <CardTitle className="text-xl font-semibold">Crear Nueva Materia</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de la materia */}
            <div>
              <Label htmlFor="nombreMateria" className="text-gray-700">Nombre de la Materia</Label>
              <div className="relative mt-1">
                <Input
                  id="nombreMateria"
                  name="nombreMateria"
                  type="text"
                  value={formData.nombreMateria}
                  onChange={(e) => handleInputChange('nombreMateria', e.target.value)}
                  className={errors.nombreMateria ? 'border-red-500' : ''}
                  placeholder="Ingresa el nombre de la materia"
                />
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.nombreMateria && (
                <p className="text-sm text-red-500 mt-1">{errors.nombreMateria}</p>
              )}
            </div>

            {/* Nivel educativo */}
            <div>
              <Label htmlFor="idNivel" className="text-gray-700">Nivel Educativo</Label>
              <div className="relative mt-1">
                <select
                  id="idNivel"
                  name="idNivel"
                  value={formData.idNivel}
                  onChange={(e) => handleInputChange('idNivel', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.idNivel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Seleccionar nivel educativo</option>
                  <option value={1}>Primaria</option>
                  <option value={2}>Secundaria</option>
                </select>
                <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.idNivel && (
                <p className="text-sm text-red-500 mt-1">{errors.idNivel}</p>
              )}
            </div>

            {/* Horas semanales */}
            <div>
              <Label htmlFor="horasSemanales" className="text-gray-700">Horas Semanales</Label>
              <div className="relative mt-1">
                <Input
                  id="horasSemanales"
                  name="horasSemanales"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.horasSemanales}
                  onChange={(e) => handleInputChange('horasSemanales', parseInt(e.target.value) || 0)}
                  className={errors.horasSemanales ? 'border-red-500' : ''}
                  placeholder="2"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.horasSemanales && (
                <p className="text-sm text-red-500 mt-1">{errors.horasSemanales}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Número de horas por semana (1-10)
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Información de la Materia</h3>
              <p className="text-sm text-blue-600">
                La materia será creada y estará disponible para asignar a docentes y grados del nivel seleccionado.
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
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Materia
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
