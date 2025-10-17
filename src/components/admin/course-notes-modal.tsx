'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, Save, Users, BookOpen, Calendar } from 'lucide-react'

interface Subject { IdMateria: number; NombreMateria: string; IdNivel: number }
interface Grado { IdGrado: number; NombreGrado: string; IdNivel: number }
interface Seccion { IdSeccion: number; NombreSeccion: string }
interface Row {
  IdHijo: number
  NombreHijo: string
  ApellidoHijo: string
  Nota1: number | null
  Nota2: number | null
  Nota3: number | null
  Nota4: number | null
}

interface CourseNotesModalProps {
  isOpen: boolean
  onClose: () => void
  courseFilter?: { IdMateria: number; IdGrado: number; IdSeccion: number }[]
  lockGradeSection?: { IdGrado: number; IdSeccion: number }
  allowedSubjectIds?: number[]
}

export default function CourseNotesModal({ isOpen, onClose, courseFilter, lockGradeSection, allowedSubjectIds }: CourseNotesModalProps) {
  const { toasts, showError, showSuccess, removeToast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grado[]>([])
  const [sections, setSections] = useState<Seccion[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number>(0)
  const [selectedGrade, setSelectedGrade] = useState<number>(0)
  const [selectedSection, setSelectedSection] = useState<number>(0)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fecha, setFecha] = useState<string>('')

  const canLoad = useMemo(() => selectedSubject>0 && selectedGrade>0 && selectedSection>0, [selectedSubject, selectedGrade, selectedSection])

  useEffect(() => {
    if (isOpen) {
      setRows([])
      setSelectedSubject(0)
      setSelectedGrade(0)
      setSelectedSection(0)
      setRows([])
      // Fecha por defecto (no visible en UI)
      setFecha(new Date().toISOString().slice(0,10))
      Promise.all([
        fetch('/api/admin/subjects').then(r => r.json()),
        fetch('/api/admin/grades').then(r => r.json())
      ]).then(([subj, grados]) => {
        // Aplicar filtro si viene de docente
        if (courseFilter && courseFilter.length > 0) {
          const allowedSubjectIds = Array.from(new Set(courseFilter.map(c => c.IdMateria)))
          const allowedGradeIds = Array.from(new Set(courseFilter.map(c => c.IdGrado)))
          // Mostrar todas las materias pero deshabilitar las no permitidas; guardamos todas
          setSubjects(subj)
          setGrades(grados.filter((g: any) => allowedGradeIds.includes(g.IdGrado)))
          // Preseleccionar primer curso
          const first = courseFilter[0]
          setSelectedSubject(first.IdMateria)
          setSelectedGrade(first.IdGrado)
        } else {
          setSubjects(subj)
          setGrades(grados)
        }
      }).catch(() => showError('Error', 'No se pudieron cargar materias y grados'))
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedGrade>0) {
      fetch(`/api/admin/sections?gradoId=${selectedGrade}`)
        .then(r => r.json())
        .then((secs) => {
          if (courseFilter && courseFilter.length > 0) {
            const allowed = courseFilter
              .filter(c => c.IdMateria === selectedSubject && c.IdGrado === selectedGrade)
              .map(c => c.IdSeccion)
            setSections(secs.filter((s: any) => allowed.includes(s.IdSeccion)))
            if (allowed.length > 0) setSelectedSection(allowed[0])
          } else {
            setSections(secs)
          }
        })
        .catch(() => setSections([]))
    } else {
      setSections([])
      setSelectedSection(0)
    }
  }, [selectedGrade])

  const loadNotes = async () => {
    if (!canLoad) { showError('Faltan filtros', 'Selecciona materia, grado y sección'); return }
    setLoading(true)
    try {
      // cargar 4 bimestres en paralelo
      const fetchB = (b: number) => fetch(`/api/admin/notes/course?materiaId=${selectedSubject}&gradoId=${selectedGrade}&seccionId=${selectedSection}&bimestre=${b}`).then(r=>r.json())
      const [b1, b2, b3, b4] = await Promise.all([fetchB(1), fetchB(2), fetchB(3), fetchB(4)])
      // fusionar por IdHijo
      const map = new Map<number, Row>()
      const add = (list: any[], idx: number) => {
        list.forEach((it: any) => {
          const r = map.get(it.IdHijo) || { IdHijo: it.IdHijo, NombreHijo: it.NombreHijo, ApellidoHijo: it.ApellidoHijo, Nota1: null, Nota2: null, Nota3: null, Nota4: null }
          const key = (`Nota` + idx) as keyof Row
          ;(r as any)[key] = it.Nota ?? null
          map.set(it.IdHijo, r)
        })
      }
      add(b1, 1); add(b2, 2); add(b3, 3); add(b4, 4)
      const merged = Array.from(map.values()).sort((a,b)=> (a.ApellidoHijo+a.NombreHijo).localeCompare(b.ApellidoHijo+b.NombreHijo))
      setRows(merged)
      showSuccess('Notas cargadas', `Alumnos: ${merged.length}`)
    } catch {
      showError('Error', 'No se pudieron cargar las notas del curso')
    } finally {
      setLoading(false)
    }
  }

  const saveNotes = async () => {
    if (!canLoad) { showError('Faltan filtros', 'Selecciona filtros'); return }
    setSaving(true)
    try {
      // enviar por cada bimestre
      const submitB = async (b: number, notas: { idHijo: number; nota: number | null }[]) => {
        const payload = { materiaId: selectedSubject, gradoId: selectedGrade, seccionId: selectedSection, bimestre: b, fecha, notas }
        const res = await fetch('/api/admin/notes/course', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('save')
      }
      await submitB(1, rows.map(r=>({ idHijo: r.IdHijo, nota: r.Nota1 })))
      await submitB(2, rows.map(r=>({ idHijo: r.IdHijo, nota: r.Nota2 })))
      await submitB(3, rows.map(r=>({ idHijo: r.IdHijo, nota: r.Nota3 })))
      await submitB(4, rows.map(r=>({ idHijo: r.IdHijo, nota: r.Nota4 })))
      showSuccess('Notas guardadas', 'Se guardaron las calificaciones del curso')
    } catch {
      showError('Error', 'No se pudieron guardar las notas')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Calificaciones por Curso</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Materia</Label>
              <select value={selectedSubject} onChange={(e)=>setSelectedSubject(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm border-gray-300">
                <option value={0}>Seleccionar materia</option>
                {subjects.map(s => {
                  const allowed = allowedSubjectIds ? allowedSubjectIds.includes(s.IdMateria) : (courseFilter ? courseFilter.some(c => c.IdMateria === s.IdMateria) : true)
                  return (
                    <option key={s.IdMateria} value={s.IdMateria} disabled={!allowed}>
                      {s.NombreMateria}{!allowed ? ' (no asignada)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <Label>Grado</Label>
              <select value={lockGradeSection ? lockGradeSection.IdGrado : selectedGrade} onChange={(e)=>setSelectedGrade(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm border-gray-300" disabled={!!lockGradeSection}>
                <option value={0}>Seleccionar grado</option>
                {grades.map(g => <option key={g.IdGrado} value={g.IdGrado}>{g.NombreGrado}</option>)}
              </select>
            </div>
            <div>
              <Label>Sección</Label>
              <select value={lockGradeSection ? lockGradeSection.IdSeccion : selectedSection} onChange={(e)=>setSelectedSection(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm border-gray-300" disabled={!!lockGradeSection}>
                <option value={0}>Seleccionar sección</option>
                {sections.map(s => <option key={s.IdSeccion} value={s.IdSeccion}>{s.NombreSeccion}</option>)}
              </select>
            </div>
            <div className="hidden md:block" />
          </div>

          <div className="flex items-end gap-3 mb-4">
            <Button onClick={loadNotes} disabled={!canLoad || loading}>
              {loading ? 'Cargando...' : 'Cargar alumnos'}
            </Button>
          </div>

          <div className="mb-3 p-3 bg-blue-50 rounded-md flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-blue-600"/></div>
            <p className="text-sm text-blue-800">Lista de alumnos matriculados en el grado y sección seleccionados. <strong>{rows.length}</strong> alumnos.</p>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No hay alumnos cargados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">Alumno</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B1</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B2</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B3</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B4</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.IdHijo} className="border-t">
                      <td className="px-3 py-2 text-sm text-gray-800">{r.ApellidoHijo} {r.NombreHijo}</td>
                      {([1,2,3,4] as const).map((b) => (
                        <td key={b} className="px-3 py-2">
                          <Input type="number" step="0.1" min="0" max="20" value={(r as any)[`Nota${b}`] ?? ''} onChange={(e)=>{
                            const v = e.target.value === '' ? null : Number(e.target.value)
                            setRows(prev => prev.map(x => x.IdHijo===r.IdHijo ? { ...x, [`Nota${b}`]: v } as any : x))
                          }} className="w-20" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
            <Button onClick={saveNotes} disabled={saving || rows.length===0}>{saving ? 'Guardando...' : 'Guardar notas'}</Button>
          </div>

          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </CardContent>
      </Card>
    </div>
  )
}
