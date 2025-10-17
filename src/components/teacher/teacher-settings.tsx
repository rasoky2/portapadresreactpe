'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface TeacherData {
  IdUsuario: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
}

export default function TeacherSettings() {
  const [data, setData] = useState<TeacherData | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/teachers')
        const list = await res.json()
        const me = Array.isArray(list) ? list.find((t:any)=>t.IdUsuario===2) : null // TODO: tomar ID desde sesión
        if (me) setData(me)
      } catch {
        showError('Error', 'No se pudo cargar tu perfil')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const onSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      const payload:any = {
        usuario: data.Usuario,
        nombre: data.Nombre,
        apellido: data.Apellido,
        email: data.Email || '',
        telefono: data.Telefono || ''
      }
      if (password.trim()) payload.contraseña = password
      const res = await fetch(`/api/admin/teachers/${data.IdUsuario}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        let msg = 'No se pudo guardar los cambios'
        try { const e = await res.json(); msg = e.message || msg } catch {}
        showError('Error', msg); return
      }
      showSuccess('Perfil actualizado', 'Tus datos han sido guardados correctamente')
      setPassword('')
    } catch {
      showError('Error', 'No se pudo guardar los cambios')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">Actualiza los datos de tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Nombre, contacto y credenciales</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <div className="text-sm text-gray-500">{loading ? 'Cargando...' : 'No se encontraron datos'}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={data.Nombre} onChange={e=>setData({ ...(data as any), Nombre: e.target.value })} />
                </div>
                <div>
                  <Label>Apellido</Label>
                  <Input value={data.Apellido} onChange={e=>setData({ ...(data as any), Apellido: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={data.Email || ''} onChange={e=>setData({ ...(data as any), Email: e.target.value })} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={data.Telefono || ''} onChange={e=>setData({ ...(data as any), Telefono: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Usuario</Label>
                  <Input value={data.Usuario} onChange={e=>setData({ ...(data as any), Usuario: e.target.value })} />
                </div>
                <div>
                  <Label>Nueva contraseña (opcional)</Label>
                  <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
