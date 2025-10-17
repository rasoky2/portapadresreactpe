'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, Save, Calendar as CalendarIcon, BookOpen } from 'lucide-react'

interface CalendarEvent {
  IdEvento?: number
  Fecha: string
  Descripcion: string
  Tipo: string
}

interface CalendarEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { fecha: string; descripcion: string; tipo: string }, eventId?: number) => Promise<void>
  mode: 'create' | 'edit'
  eventData?: CalendarEvent | null
}

export default function CalendarEventModal({ isOpen, onClose, onSave, mode, eventData }: CalendarEventModalProps) {
  const { toasts, showError, showSuccess, removeToast } = useToast()
  const [form, setForm] = useState({ fecha: '', descripcion: '', tipo: 'Actividad' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && eventData) {
        setForm({
          fecha: eventData.Fecha?.slice(0, 10) || '',
          descripcion: eventData.Descripcion || '',
          tipo: eventData.Tipo || 'Actividad'
        })
      } else {
        setForm({ fecha: '', descripcion: '', tipo: 'Actividad' })
      }
      setErrors({})
    }
  }, [isOpen, mode, eventData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.fecha) newErrors.fecha = 'La fecha es requerida'
    if (!form.descripcion || form.descripcion.trim().length < 3) newErrors.descripcion = 'La descripción es requerida (mín. 3 caracteres)'
    if (!form.tipo) newErrors.tipo = 'El tipo es requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      showError('Error', 'Corrige los errores del formulario')
      return
    }
    setLoading(true)
    try {
      await onSave({ ...form }, eventData?.IdEvento)
      showSuccess(mode === 'create' ? 'Evento creado' : 'Evento actualizado', form.descripcion)
      onClose()
    } catch {
      showError('Error', 'No se pudo guardar el evento')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">{mode === 'create' ? 'Nuevo Evento' : 'Editar Evento'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <div className="relative mt-1">
                  <Input id="fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className={errors.fecha ? 'border-red-500' : ''} />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.fecha && <p className="text-sm text-red-500 mt-1">{errors.fecha}</p>}
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="Actividad">Actividad</option>
                  <option value="Festivo">Festivo</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Examen">Examen</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <div className="relative mt-1">
                <Input id="descripcion" type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={errors.descripcion ? 'border-red-500' : ''} placeholder="Ej. Reunión de padres" />
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.descripcion && <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Crear Evento' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            </div>
          </form>

          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </CardContent>
      </Card>
    </div>
  )
}
