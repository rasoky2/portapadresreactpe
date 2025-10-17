'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { 
  X, 
  GraduationCap, 
  User, 
  Hash, 
  Calendar, 
  BadgeInfo, 
  Users, 
  Mail, 
  Phone,
  BookOpen,
  School,
  UserCheck
} from 'lucide-react'

interface Student {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  FechaNacimiento?: string
  Edad: number
  IdGrado?: number
  IdSeccion?: number
  IdPadre: number
  Usuario: string
  NombreRol: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
  CodigoEstudiante?: string
  Estado?: string
  // Información adicional del padre/madre
  NombrePadre?: string
  ApellidoPadre?: string
  Email?: string
  Telefono?: string
}

interface StudentDetailsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly student: Student | null
}

export default function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  const { toasts, removeToast } = useToast()
  
  if (!isOpen || !student) {
    return null
  }

  // Función para formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '—'
    }
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  // Función para obtener el estado con color
  const getStatusColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'text-green-600 bg-green-100'
      case 'inactivo':
        return 'text-red-600 bg-red-100'
      case 'graduado':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Detalles del Estudiante</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del Estudiante */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {student.NombreHijo} {student.ApellidoHijo}
                </h3>
                <p className="text-sm text-gray-500">Estudiante</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(student.FechaNacimiento)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Edad</p>
                  <p className="text-sm font-medium text-gray-900">{student.Edad} años</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Código de Estudiante</p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.CodigoEstudiante || 'Sin asignar'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <BadgeInfo className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.Estado)}`}>
                    {student.Estado || 'Activo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <School className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Información Académica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500">Nivel Educativo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.NombreNivel || 'No asignado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500">Grado</p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.NombreGrado || 'No asignado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500">Sección</p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.NombreSeccion || 'No asignada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Padres/Tutores */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Padres/Tutores Vinculados</h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {student.NombrePadre || 'Nombre no disponible'} {student.ApellidoPadre || 'Apellido no disponible'}
                  </h4>
                  <p className="text-sm text-gray-500">Usuario: {student.Usuario}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.Email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{student.Email}</p>
                    </div>
                  </div>
                )}
                
                {student.Telefono && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm text-gray-900">{student.Telefono}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Card>
    </div>
  )
}
