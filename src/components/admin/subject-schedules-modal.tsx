'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { X, Plus, Trash2, Edit, Clock, Calendar, BookOpen } from 'lucide-react'

interface Subject {
  IdMateria: number
  NombreMateria: string
  IdNivel: number
  NombreNivel: string
  HorasSemanales: number
}

interface Schedule {
  IdHorario: number
  DiaSemana: string
  HoraInicio: string
  HoraFin: string
}

interface SubjectSchedulesModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject | null
}

export default function SubjectSchedulesModal({ isOpen, onClose, subject }: SubjectSchedulesModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    diaSemana: '',
    horaInicio: '',
    horaFin: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, showError, showSuccess, removeToast } = useToast()

  const diasSemana = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' }
  ]

  useEffect(() => {
    if (isOpen && subject) {
      fetchSchedules()
      setShowAddForm(false)
      setEditingSchedule(null)
      setFormData({ diaSemana: '', horaInicio: '', horaFin: '' })
      setErrors({})
    }
  }, [isOpen, subject])

  const fetchSchedules = async () => {
    if (!subject) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subjects/${subject.IdMateria}/schedules`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      } else {
        showError('Error', 'No se pudieron cargar los horarios')
      }
    } catch (error) {
      console.error('Error cargando horarios:', error)
      showError('Error', 'Error al cargar los horarios')
    } finally {
      setLoading(false)
    }
  }

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

    if (!formData.diaSemana) {
      newErrors.diaSemana = 'Debe seleccionar un día de la semana'
    }

    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida'
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaInicio)) {
      newErrors.horaInicio = 'Formato de hora inválido (HH:MM)'
    }

    if (!formData.horaFin) {
      newErrors.horaFin = 'La hora de fin es requerida'
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaFin)) {
      newErrors.horaFin = 'Formato de hora inválido (HH:MM)'
    }

    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject) return

    if (!validateForm()) {
      showError('Error', 'Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)
    try {
      const url = editingSchedule 
        ? `/api/admin/subjects/schedules/${editingSchedule.IdHorario}`
        : `/api/admin/subjects/${subject.IdMateria}/schedules`
      
      const method = editingSchedule ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess(
          editingSchedule ? 'Horario actualizado' : 'Horario creado',
          `El horario ha sido ${editingSchedule ? 'actualizado' : 'creado'} correctamente`
        )
        await fetchSchedules()
        setShowAddForm(false)
        setEditingSchedule(null)
        setFormData({ diaSemana: '', horaInicio: '', horaFin: '' })
        setErrors({})
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en la operación')
      }
    } catch (error) {
      console.error('Error guardando horario:', error)
      showError(
        'Error al guardar horario',
        'No se pudo guardar el horario. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      diaSemana: schedule.DiaSemana,
      horaInicio: schedule.HoraInicio,
      horaFin: schedule.HoraFin
    })
    setShowAddForm(true)
    setErrors({})
  }

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subjects/schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Horario eliminado', 'El horario ha sido eliminado correctamente')
        await fetchSchedules()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error eliminando horario')
      }
    } catch (error) {
      console.error('Error eliminando horario:', error)
      showError('Error al eliminar horario', 'No se pudo eliminar el horario. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingSchedule(null)
    setFormData({ diaSemana: '', horaInicio: '', horaFin: '' })
    setErrors({})
  }

  if (!isOpen || !subject) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Horarios de {subject.NombreMateria}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Información de la materia */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">{subject.NombreMateria}</h3>
                <p className="text-sm text-blue-600">
                  {subject.NombreNivel} • {subject.HorasSemanales} horas semanales
                </p>
              </div>
            </div>
          </div>

          {/* Botón para agregar horario */}
          {!showAddForm && (
            <div className="mb-6">
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Horario
              </Button>
            </div>
          )}

          {/* Formulario para agregar/editar horario */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Día de la semana */}
                    <div>
                      <Label htmlFor="diaSemana">Día de la Semana</Label>
                      <select
                        id="diaSemana"
                        value={formData.diaSemana}
                        onChange={(e) => handleInputChange('diaSemana', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          errors.diaSemana ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar día</option>
                        {diasSemana.map(dia => (
                          <option key={dia.value} value={dia.value}>
                            {dia.label}
                          </option>
                        ))}
                      </select>
                      {errors.diaSemana && (
                        <p className="text-sm text-red-500 mt-1">{errors.diaSemana}</p>
                      )}
                    </div>

                    {/* Hora de inicio */}
                    <div>
                      <Label htmlFor="horaInicio">Hora de Inicio</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                        className={errors.horaInicio ? 'border-red-500' : ''}
                      />
                      {errors.horaInicio && (
                        <p className="text-sm text-red-500 mt-1">{errors.horaInicio}</p>
                      )}
                    </div>

                    {/* Hora de fin */}
                    <div>
                      <Label htmlFor="horaFin">Hora de Fin</Label>
                      <Input
                        id="horaFin"
                        type="time"
                        value={formData.horaFin}
                        onChange={(e) => handleInputChange('horaFin', e.target.value)}
                        className={errors.horaFin ? 'border-red-500' : ''}
                      />
                      {errors.horaFin && (
                        <p className="text-sm text-red-500 mt-1">{errors.horaFin}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={cancelForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingSchedule ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          {editingSchedule ? 'Actualizar' : 'Crear'} Horario
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de horarios */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios Configurados</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando horarios...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay horarios configurados para esta materia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.IdHorario} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{schedule.DiaSemana}</p>
                        <p className="text-sm text-gray-500">
                          {schedule.HoraInicio} - {schedule.HoraFin}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule.IdHorario)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Card>
    </div>
  )
}
