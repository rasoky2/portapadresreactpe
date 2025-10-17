'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SelectHTMLAttributes } from 'react'

interface Child { IdHijo: number; NombreHijo: string; ApellidoHijo: string }
interface NotaRow { IdNota: number; IdMateria: number; NombreMateria: string; Bimestre: number; Nota: number | null; Fecha: string; DocenteNombre?: string; DocenteApellido?: string }

export default function ParentGrades() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<number>(0)
  const [rows, setRows] = useState<NotaRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Cargar hijos del padre (placeholder id=3)
    fetch('/api/admin/students/linked/3').then(r=>r.json()).then((data)=>{
      const list = (data||[]).map((s:any)=>({ IdHijo: s.IdHijo, NombreHijo: s.NombreHijo, ApellidoHijo: s.ApellidoHijo }))
      setChildren(list)
      if (list.length>0) setSelectedChild(list[0].IdHijo)
    })
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!selectedChild) return
      setLoading(true)
      try {
        const res = await fetch(`/api/parent/grades?childId=${selectedChild}`)
        const data = await res.json()
        setRows(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [selectedChild])

  // Agrupar por materia
  const bySubject = useMemo(() => {
    const map = new Map<number, { nombre: string; notas: NotaRow[] }>()
    rows.forEach(r => {
      const cur = map.get(r.IdMateria) || { nombre: r.NombreMateria, notas: [] }
      cur.notas.push(r)
      map.set(r.IdMateria, cur)
    })
    return Array.from(map.values())
  }, [rows])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notas de mis Hijos</h1>
        <p className="mt-1 text-sm text-gray-500">Consulta por estudiante</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona un hijo</CardTitle>
          <CardDescription>Se mostrarán sus notas por materia y bimestre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <select value={selectedChild} onChange={(e)=>setSelectedChild(Number(e.target.value))} className="px-3 py-2 border rounded-md text-sm border-gray-300">
              {children.map(c => (
                <option key={c.IdHijo} value={c.IdHijo}>{c.ApellidoHijo} {c.NombreHijo}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Cargando notas...</div>
          ) : bySubject.length === 0 ? (
            <div className="text-sm text-gray-500">No hay notas registradas</div>
          ) : (
            <div className="space-y-4">
              {bySubject.map((s, idx) => (
                <div key={idx} className="border rounded-md">
                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-800">{s.nombre}</div>
                  <div className="divide-y">
                    {s.notas.sort((a,b)=>a.Bimestre-b.Bimestre).map((n) => (
                      <div key={n.IdNota} className="flex items-center justify-between px-4 py-2 text-sm">
                        <div className="text-gray-600">Bimestre {n.Bimestre}</div>
                        <div className="font-semibold text-gray-900">{n.Nota ?? '-'}</div>
                        <div className="text-gray-400">{n.DocenteNombre} {n.DocenteApellido}</div>
                      </div>
                    ))}
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
