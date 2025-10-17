'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GraduationCap, Users } from 'lucide-react'

interface ChildRow {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  CodigoEstudiante?: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
}

export default function ParentChildren() {
  const [rows, setRows] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Placeholder: Id del padre 3 (ajustar cuando haya sesión)
        const res = await fetch('/api/admin/students/linked/3')
        const data = await res.json()
        setRows(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Hijos</h1>
        <p className="mt-1 text-sm text-gray-500">Hijos vinculados a tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes ({rows.length})</CardTitle>
          <CardDescription>Detalle de grado, sección y código</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Cargando...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No tienes hijos vinculados
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.IdHijo} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{r.ApellidoHijo} {r.NombreHijo}</p>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{r.NombreNivel || 'Sin nivel'}</span>
                        <span>•</span>
                        <span>{r.NombreGrado || 'Sin grado'} {r.NombreSeccion || ''}</span>
                        {r.CodigoEstudiante && (<><span>•</span><span>{r.CodigoEstudiante}</span></>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
