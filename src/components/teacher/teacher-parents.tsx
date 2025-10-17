'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, User } from 'lucide-react'

interface ParentRow {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  NombreGrado: string
  NombreSeccion: string
  IdUsuarioPadre: number
  Usuario: string
  Nombre: string
  Apellido: string
  Email?: string
  Telefono?: string
  IdPadre: number
  DNI?: string
}

export default function TeacherParents() {
  const [rows, setRows] = useState<ParentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<ParentRow | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/teacher/parents?id=2') // TODO: id real desde sesión
        const data = await res.json()
        setRows(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // Agrupar por hijo
  const groups = useMemo(() => {
    const map = new Map<number, { alumno: string; curso: string; padres: ParentRow[] }>()
    rows.forEach(r => {
      const key = r.IdHijo
      const entry = map.get(key) || { alumno: `${r.ApellidoHijo} ${r.NombreHijo}`, curso: `${r.NombreGrado} ${r.NombreSeccion}`, padres: [] }
      entry.padres.push(r)
      map.set(key, entry)
    })
    return Array.from(map.entries())
  }, [rows])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Padres de mis Estudiantes</h1>
        <p className="mt-1 text-sm text-gray-500">Listado agrupado por alumno</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          {loading ? 'Cargando...' : 'No hay padres vinculados a tus cursos'}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([idHijo, group]) => (
            <Card key={idHijo}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{group.alumno}</CardTitle>
                <CardDescription>{group.curso}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.padres.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-brand-600"/></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.Nombre} {p.Apellido}</div>
                          <div className="text-xs text-gray-500">{p.Usuario}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={()=>setSelected(p)}>Ver detalles</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal simple de detalles */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Detalles del Padre</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-700">
                <div><span className="font-medium">Nombre:</span> {selected.Nombre} {selected.Apellido}</div>
                <div><span className="font-medium">Usuario:</span> {selected.Usuario}</div>
                {selected.Email && <div><span className="font-medium">Email:</span> {selected.Email}</div>}
                {selected.Telefono && <div><span className="font-medium">Teléfono:</span> {selected.Telefono}</div>}
                {selected.DNI && <div><span className="font-medium">DNI:</span> {selected.DNI}</div>}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={()=>setSelected(null)}>Cerrar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
