'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToastContainer, useToast } from '@/components/ui/toast'
import UserModal from './user-modal'
import UserDetailsModal from './user-details-modal'
import ConfirmDialog from './confirm-dialog'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Download
} from 'lucide-react'

interface User {
  IdUsuario?: number
  Usuario: string
  Contraseña: string
  IdRol: number
  NombreRol?: string
  Nombre?: string
  Apellido?: string
  Email?: string
  Telefono?: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    user: User | null
  }>({ isOpen: false, user: null })
  const [deleting, setDeleting] = useState(false)
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      showError('Error al cargar usuarios', 'No se pudieron cargar los usuarios. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.Usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.NombreRol && user.NombreRol.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.IdRol.toString() === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrador':
        return 'bg-red-100 text-red-800'
      case 'docente':
        return 'bg-blue-100 text-blue-800'
      case 'padre':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateUser = () => {
    setModalMode('create')
    setSelectedUser(null)
    setModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setDetailsOpen(true)
  }

  const handleSaveUser = async (userData: User) => {
    try {
      if (modalMode === 'create') {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })
        
        if (response.ok) {
          const result = await response.json()
          const newUser: User = {
            IdUsuario: result.id,
            Usuario: userData.Usuario,
            Contraseña: userData.Contraseña,
            NombreRol: getRoleName(userData.IdRol),
            IdRol: userData.IdRol,
            Nombre: userData.Nombre,
            Apellido: userData.Apellido,
            Email: userData.Email,
            Telefono: userData.Telefono
          }
          setUsers([...users, newUser])
          showSuccess('Usuario creado exitosamente', `El usuario "${userData.Usuario}" ha sido creado correctamente.`)
        } else {
          const error = await response.json()
          showError('Error al crear usuario', error.message || 'No se pudo crear el usuario. Inténtalo de nuevo.')
        }
      } else {
        const response = await fetch(`/api/admin/users/${selectedUser?.IdUsuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })
        
        if (response.ok) {
          setUsers(users.map(user => 
            user.IdUsuario === selectedUser?.IdUsuario 
              ? { ...user, Usuario: userData.Usuario, IdRol: userData.IdRol, NombreRol: getRoleName(userData.IdRol) }
              : user
          ))
          showSuccess('Usuario actualizado exitosamente', `El usuario "${userData.Usuario}" ha sido actualizado correctamente.`)
        } else {
          const error = await response.json()
          showError('Error al actualizar usuario', error.message || 'No se pudo actualizar el usuario. Inténtalo de nuevo.')
        }
      }
    } catch (error) {
      console.error('Error guardando usuario:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
    }
  }

  const getRoleName = (roleId: number) => {
    const roles = {
      1: 'Administrador',
      2: 'Docente',
      3: 'Padre'
    }
    return roles[roleId as keyof typeof roles] || 'Desconocido'
  }

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(user => user.IdUsuario === userId)
    setConfirmDialog({
      isOpen: true,
      user: userToDelete || null
    })
  }

  const confirmDelete = async () => {
    if (!confirmDialog.user) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${confirmDialog.user.IdUsuario}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUsers(users.filter(user => user.IdUsuario !== confirmDialog.user?.IdUsuario))
        showSuccess('Usuario eliminado exitosamente', `El usuario "${confirmDialog.user.Usuario}" ha sido eliminado correctamente.`)
        setConfirmDialog({ isOpen: false, user: null })
      } else {
        const error = await response.json()
        showError('Error al eliminar usuario', error.message || 'No se pudo eliminar el usuario. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      showError('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">Administra todos los usuarios del sistema</p>
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
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todos los roles</option>
                  <option value="1">Administrador</option>
                  <option value="2">Docente</option>
                  <option value="3">Padre</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={handleCreateUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.IdUsuario} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.Usuario}</p>
                      <p className="text-sm text-gray-500">
                        {user.Nombre && user.Apellido 
                          ? `${user.Nombre} ${user.Apellido}` 
                          : user.Nombre || user.Apellido || 'Sin nombre'
                        }
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.NombreRol || '')}`}>
                        {user.NombreRol || 'Sin rol'}
                      </span>
                    </div>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => user.IdUsuario && handleDeleteUser(user.IdUsuario)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        user={selectedUser}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, user: null })}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que quieres eliminar el usuario "${confirmDialog.user?.Usuario}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
