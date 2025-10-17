'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Child { IdHijo: number; NombreHijo: string; ApellidoHijo: string }
interface Row { Fecha: string; Asistio: number }

export default function ParentAttendance() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<number>(0)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
        const res = await fetch(`/api/parent/attendance?childId=${selectedChild}`)
        const data = await res.json()
        setRows(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [selectedChild])

  const present = rows.filter(r=>r.Asistio===1).length
  const absent = rows.filter(r=>r.Asistio===0).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Asistencia de mis Hijos</h1>
        <p className="mt-1 text-sm text-gray-500">Histórico por estudiante</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona un hijo</CardTitle>
          <CardDescription>Resumen de asistencias registradas</CardDescription>
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
            <div className="text-sm text-gray-500">Cargando asistencia...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-500">No hay registros</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Presencias: <span className="font-semibold">{present}</span> · Ausencias: <span className="font-semibold">{absent}</span></div>
              <div className="divide-y">
                {rows.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-sm">
                    <div className="text-gray-600">{r.Fecha}</div>
                    <div className={r.Asistio===1? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{r.Asistio===1? 'Presente' : 'Ausente'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
