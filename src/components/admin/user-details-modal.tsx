'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, User, Mail, Phone, Shield } from 'lucide-react'

interface User {
  IdUsuario?: number
  Usuario: string
  Contraseña?: string
  IdRol: number
  NombreRol?: string
  Nombre?: string
  Apellido?: string
  Email?: string
  Telefono?: string
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const { toasts, removeToast } = useToast()

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Detalles del Usuario</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Usuario</p>
                  <p className="text-sm font-medium text-gray-900">{user.Usuario}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rol</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-gray-100 text-gray-800">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.NombreRol || 'Sin rol'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{user.Nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Apellido</p>
                  <p className="text-sm text-gray-900">{user.Apellido || '—'}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.Email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{user.Telefono || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          </div>
        </CardContent>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Card>
    </div>
  )
}
