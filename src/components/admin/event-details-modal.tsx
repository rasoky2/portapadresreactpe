'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, Clock, Tag, FileText } from 'lucide-react'

interface Event {
  IdEvento: number
  Fecha: string
  Descripcion: string
  Tipo: string
}

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
}

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!isOpen || !event) return null

  const eventDate = new Date(event.Fecha)
  const isPast = eventDate < new Date()
  const isToday = eventDate.toDateString() === new Date().toDateString()
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()

  const getEventTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'festivo':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'reunión':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'vacaciones':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'examen':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'actividad':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'festivo':
        return <Calendar className="w-5 h-5" />
      case 'reunión':
        return <Clock className="w-5 h-5" />
      case 'vacaciones':
        return <Calendar className="w-5 h-5" />
      case 'examen':
        return <FileText className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getDateStatus = () => {
    if (isToday) {
      return { text: 'Hoy', color: 'bg-blue-100 text-blue-800' }
    }
    if (isTomorrow) {
      return { text: 'Mañana', color: 'bg-orange-100 text-orange-800' }
    }
    if (isPast) {
      return { text: 'Pasado', color: 'bg-gray-100 text-gray-800' }
    }
    return { text: 'Próximo', color: 'bg-green-100 text-green-800' }
  }

  const dateStatus = getDateStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative z-10 w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Detalles del Evento
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Header */}
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPast ? 'bg-gray-100' : 'bg-brand-100'}`}>
              {getEventIcon(event.Tipo)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {event.Descripcion}
              </h3>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEventTypeColor(event.Tipo)}`}>
                  <Tag className="w-4 h-4 mr-1" />
                  {event.Tipo}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dateStatus.color}`}>
                  {dateStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Fecha del Evento</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-medium text-gray-900">
                    {eventDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Día de la Semana</h4>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-medium text-gray-900">
                    {eventDate.toLocaleDateString('es-ES', { weekday: 'long' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Tipo de Evento</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getEventTypeColor(event.Tipo).split(' ')[0]}`}></div>
                  <span className="text-lg font-medium text-gray-900 capitalize">
                    {event.Tipo}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">ID del Evento</h4>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-medium text-gray-900 font-mono">
                    #{event.IdEvento}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Descripción</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 leading-relaxed">
                {event.Descripcion}
              </p>
            </div>
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {eventDate.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                Día
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {eventDate.getMonth() + 1}
              </div>
              <div className="text-sm text-gray-500">
                Mes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {eventDate.getFullYear()}
              </div>
              <div className="text-sm text-gray-500">
                Año
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
