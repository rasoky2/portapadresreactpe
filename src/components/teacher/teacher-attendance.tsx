'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Users } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface Row { IdHijo: number; NombreHijo: string; ApellidoHijo: string; Asistio: number | null }

export default function TeacherAttendance() {
  const [gradoId, setGradoId] = useState<number>(0)
  const [seccionId, setSeccionId] = useState<number>(0)
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0,10))
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [myCourses, setMyCourses] = useState<{ IdMateria: number; IdGrado: number; IdSeccion: number }[]>([])
  const { toasts, showError, showSuccess, removeToast } = useToast()

  useEffect(() => {
    // Cargar grados del sistema + cursos del docente
    Promise.all([
      fetch('/api/admin/grades').then(r=>r.json()),
      fetch('/api/teacher/courses?id=2').then(r=>r.json()).catch(()=>[]) // TODO: Reemplazar con ID real del profesor autenticado
    ]).then(([grados, cursos]) => {
      setMyCourses(cursos)
      if (Array.isArray(cursos) && cursos.length>0) {
        const allowedIds = Array.from(new Set(cursos.map((c:any)=>c.IdGrado)))
        setGrades(grados.filter((g:any)=>allowedIds.includes(g.IdGrado)))
        // Preseleccionar primer curso y cargar secciones filtradas
        const first = cursos[0]
        setGradoId(first.IdGrado)
      } else {
        setGrades(grados)
      }
    })
  }, [])

  useEffect(() => {
    if (gradoId>0) {
      fetch(`/api/admin/sections?gradoId=${gradoId}`).then(r=>r.json()).then((secs)=>{
        if (myCourses.length>0) {
          const allowed = myCourses.filter((c:any)=>c.IdGrado===gradoId).map((c:any)=>c.IdSeccion)
          const filtered = secs.filter((s:any)=>allowed.includes(s.IdSeccion))
          setSections(filtered)
          if (filtered.length>0) setSeccionId(filtered[0].IdSeccion)
          // Cargar automáticamente la lista una vez que hay curso preseleccionado
          setTimeout(()=>{ load() }, 0)
        } else {
          setSections(secs)
        }
      })
    } else {
      setSections([])
      setSeccionId(0)
    }
  }, [gradoId])

  const load = async () => {
    if (!gradoId || !seccionId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/attendance?gradoId=${gradoId}&seccionId=${seccionId}&fecha=${fecha}`)
      const data = await res.json()
      setRows(data)
    } finally { setLoading(false) }
  }

  const toggle = (idHijo: number, value: boolean) => {
    setRows(prev => prev.map(r => r.IdHijo === idHijo ? { ...r, Asistio: value ? 1 : 0 } : r))
  }

  const save = async () => {
    if (!gradoId || !seccionId) return
    setSaving(true)
    try {
      const res = await fetch('/api/teacher/attendance', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ gradoId, seccionId, fecha, records: rows.map(r=>({ idHijo: r.IdHijo, asistio: !!r.Asistio })) }) })
      if (!res.ok) {
        let msg = 'No se pudo guardar la asistencia'
        try { const data = await res.json(); msg = data.message || msg } catch {}
        showError('Error al guardar', msg)
      } else {
        showSuccess('Asistencia guardada', `Se registró la asistencia del ${fecha}`)
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
        <p className="mt-1 text-sm text-gray-500">Planilla por curso y fecha</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Curso</CardTitle>
          <CardDescription>Elige grado, sección y fecha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Grado</Label>
              <select value={gradoId} onChange={(e)=>setGradoId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm border-gray-300">
                <option value={0}>Seleccionar grado</option>
                {grades.map((g:any)=> <option key={g.IdGrado} value={g.IdGrado}>{g.NombreGrado}</option>)}
              </select>
            </div>
            <div>
              <Label>Sección</Label>
              <select value={seccionId} onChange={(e)=>setSeccionId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm border-gray-300">
                <option value={0}>Seleccionar sección</option>
                {sections.map((s:any)=> <option key={s.IdSeccion} value={s.IdSeccion}>{s.NombreSeccion}</option>)}
              </select>
            </div>
            <div>
              <Label>Fecha</Label>
              <div className="relative mt-1">
                <Input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)} />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <Button onClick={load} disabled={!gradoId || !seccionId || loading}>{loading ? 'Cargando...' : 'Cargar lista'}</Button>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No hay alumnos cargados
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.IdHijo} className="flex items-center justify-between p-3 border rounded">
                  <div className="text-sm text-gray-800">{r.ApellidoHijo} {r.NombreHijo}</div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Ausente
                      <input type="radio" name={`a-${r.IdHijo}`} className="ml-1" checked={r.Asistio === 0} onChange={()=>toggle(r.IdHijo, false)} />
                    </label>
                    <label className="text-sm">Presente
                      <input type="radio" name={`a-${r.IdHijo}`} className="ml-1" checked={r.Asistio === 1} onChange={()=>toggle(r.IdHijo, true)} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={load}>Refrescar</Button>
            <Button onClick={save} disabled={saving || rows.length===0}>{saving ? 'Guardando...' : 'Guardar asistencia'}</Button>
          </div>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
