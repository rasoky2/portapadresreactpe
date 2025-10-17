'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Clock,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import CalendarEventModal from './calendar-event-modal'
import EventDetailsModal from './event-details-modal'
import ConfirmDialog from './confirm-dialog'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface Event {
  IdEvento: number
  Fecha: string
  Descripcion: string
  Tipo: string
}

export default function CalendarManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [eventForDetails, setEventForDetails] = useState<Event | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, typeFilter, dateFilter])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/calendar')
      const data = await response.json()
      setEvents(data)
    } catch {
      showError('Error', 'No se pudieron cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.Tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.Tipo === typeFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.Fecha)
        
        switch (dateFilter) {
          case 'today':
            return eventDate.toDateString() === today.toDateString()
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            return eventDate >= today && eventDate <= weekFromNow
          case 'month':
            return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
          case 'past':
            return eventDate < today
          default:
            return true
        }
      })
    }

    setFilteredEvents(filtered)
  }

  const openCreate = () => {
    setModalMode('create')
    setSelectedEvent(null)
    setModalOpen(true)
  }

  const openEdit = (ev: Event) => {
    setModalMode('edit')
    setSelectedEvent(ev)
    setModalOpen(true)
  }

  const openDetails = (ev: Event) => {
    setEventForDetails(ev)
    setDetailsModalOpen(true)
  }

  const handleSave = async (data: { fecha: string; descripcion: string; tipo: string }, eventId?: number) => {
    if (modalMode === 'create') {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: data.fecha, descripcion: data.descripcion, tipo: data.tipo })
      })
      if (!res.ok) throw new Error('Error creando evento')
      await fetchEvents()
      showSuccess('Evento creado', data.descripcion)
    } else if (eventId) {
      const res = await fetch(`/api/admin/calendar/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: data.fecha, descripcion: data.descripcion, tipo: data.tipo })
      })
      if (!res.ok) throw new Error('Error actualizando evento')
      await fetchEvents()
      showSuccess('Evento actualizado', data.descripcion)
    }
  }

  const confirmDelete = (ev: Event) => {
    setEventToDelete(ev)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!eventToDelete) return
    const res = await fetch(`/api/admin/calendar/${eventToDelete.IdEvento}`, { method: 'DELETE' })
    if (!res.ok) {
      showError('Error', 'No se pudo eliminar el evento')
      return
    }
    await fetchEvents()
    setDeleteDialogOpen(false)
    setEventToDelete(null)
    showSuccess('Evento eliminado', eventToDelete.Descripcion)
  }

  const getEventTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'festivo':
        return 'bg-red-100 text-red-800'
      case 'reunión':
        return 'bg-blue-100 text-blue-800'
      case 'vacaciones':
        return 'bg-green-100 text-green-800'
      case 'examen':
        return 'bg-yellow-100 text-yellow-800'
      case 'actividad':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'festivo':
        return <Calendar className="w-4 h-4" />
      case 'reunión':
        return <Users className="w-4 h-4" />
      case 'vacaciones':
        return <GraduationCap className="w-4 h-4" />
      case 'examen':
        return <BookOpen className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventTypes = () => {
    return [...new Set(events.map(event => event.Tipo))]
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    return events.filter(event => new Date(event.Fecha) >= today).length
  }

  const getPastEvents = () => {
    const today = new Date()
    return events.filter(event => new Date(event.Fecha) < today).length
  }

  const getThisMonthEvents = () => {
    const today = new Date()
    return events.filter(event => {
      const eventDate = new Date(event.Fecha)
      return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendario y Eventos</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona el calendario escolar y eventos del colegio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUpcomingEvents()}</div>
            <p className="text-xs text-muted-foreground">
              Eventos futuros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getThisMonthEvents()}</div>
            <p className="text-xs text-muted-foreground">
              Eventos del mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPastEvents()}</div>
            <p className="text-xs text-muted-foreground">
              Eventos realizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="sm:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todos los tipos</option>
                  {getEventTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="sm:w-48">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="past">Pasados</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos ({filteredEvents.length})</CardTitle>
          <CardDescription>
            Lista de todos los eventos del calendario escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron eventos</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const eventDate = new Date(event.Fecha)
                const isPast = eventDate < new Date()
                const isToday = eventDate.toDateString() === new Date().toDateString()
                
                return (
                  <div key={event.IdEvento} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${isPast ? 'opacity-60' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPast ? 'bg-gray-100' : 'bg-brand-100'}`}>
                        {getEventIcon(event.Tipo)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.Descripcion}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.Tipo)}`}>
                            {event.Tipo}
                          </span>
                          <span className="text-sm text-gray-500">
                            {eventDate.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {isToday && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Hoy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDetails(event)}
                        title="Ver detalles del evento"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEdit(event)}
                        title="Editar evento"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700" 
                        onClick={() => confirmDelete(event)}
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modales */}
      <CalendarEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        mode={modalMode}
        eventData={selectedEvent}
      />

      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={eventForDetails}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Eliminar Evento"
        description={`¿Deseas eliminar el evento "${eventToDelete?.Descripcion}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
