'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, GraduationCap, Mail, Phone, Shield, User } from 'lucide-react'

interface Teacher {
  IdUsuario: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
  IdRol: number
  NombreRol: string
  MateriasAsignadas?: number
  GradosAsignados?: string[]
}

interface TeacherDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
}

export default function TeacherDetailsModal({ isOpen, onClose, teacher }: TeacherDetailsModalProps) {
  const { toasts, removeToast } = useToast()
  if (!isOpen || !teacher) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Detalles del Docente</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium text-gray-900">{teacher.Nombre} {teacher.Apellido}</p>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Usuario</p>
                  <p className="text-sm text-gray-900">@{teacher.Usuario}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Rol</p>
                  <p className="text-sm text-gray-900">{teacher.NombreRol}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{teacher.Email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-900">{teacher.Telefono || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Asignaciones</p>
                <p className="text-sm text-gray-900">{teacher.MateriasAsignadas ?? 0} materias</p>
                {teacher.GradosAsignados && teacher.GradosAsignados.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Grados: {teacher.GradosAsignados.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </CardContent>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Card>
    </div>
  )
}
