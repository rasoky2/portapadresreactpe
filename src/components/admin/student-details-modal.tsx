'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, GraduationCap, User, Hash, Calendar, BadgeInfo } from 'lucide-react'

interface Student {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  Edad: number
  IdPadre: number
  Usuario: string
  NombreRol: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
  CodigoEstudiante?: string
  Estado?: string
}

interface StudentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
}

export default function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  const { toasts, removeToast } = useToast()
  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Detalles del Estudiante</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium text-gray-900">{student.NombreHijo} {student.ApellidoHijo}</p>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Edad</p>
                  <p className="text-sm text-gray-900">{student.Edad} años</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Padre/Madre/Tutor</p>
                  <p className="text-sm text-gray-900">{student.Usuario}</p>
                </div>
              </div>
              <div className="flex items-center">
                <BadgeInfo className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="text-sm text-gray-900">{student.Estado || 'Activo'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Hash className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Código</p>
                  <p className="text-sm text-gray-900">{student.CodigoEstudiante || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nivel / Grado / Sección</p>
                <p className="text-sm text-gray-900">{student.NombreNivel || '—'}{student.NombreGrado ? ` • ${student.NombreGrado}` : ''}{student.NombreSeccion ? ` ${student.NombreSeccion}` : ''}</p>
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
