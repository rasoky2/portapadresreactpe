'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { X, Save, Calendar } from 'lucide-react'

interface StudentOption { IdHijo: number; Nombre: string; IdGrado?: number; IdSeccion?: number }
interface SubjectOption { IdMateria: number; NombreMateria: string }
interface TeacherOption { IdUsuario: number; Nombre: string }

interface GradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: {
    idHijo: number
    idMateria: number
    idUsuario: number
    unidad?: string
    criterio?: string
    nota: number
    peso?: number
    tipoNota?: string
    fecha: string
  }, idNota?: number) => Promise<void>
  mode: 'create' | 'edit'
  grade?: {
    IdNota: number
    IdHijo: number
    IdMateria: number
    IdUsuario: number
    Unidad?: string
    Criterio?: string
    Nota: number
    Fecha: string
    Materia: string
    NombreHijo: string
  } | null
}

export default function GradeModal({ isOpen, onClose, onSave, mode, grade }: GradeModalProps) {
  const { toasts, showError, showSuccess, removeToast } = useToast()
  const [students, setStudents] = useState<StudentOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [form, setForm] = useState({
    idHijo: 0,
    idMateria: 0,
    idUsuario: 0,
    nota1: 0,
    nota2: 0,
    nota3: 0,
    nota4: 0,
    fecha: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('/api/admin/students').then(r => r.json()),
        fetch('/api/admin/subjects').then(r => r.json()),
        fetch('/api/admin/teachers').then(r => r.json())
      ]).then(([st, su, te]) => {
        setStudents(st.map((s: any) => ({ IdHijo: s.IdHijo, Nombre: `${s.NombreHijo} ${s.ApellidoHijo}`, IdGrado: s.IdGrado, IdSeccion: s.IdSeccion })))
        setSubjects(su.map((x: any) => ({ IdMateria: x.IdMateria, NombreMateria: x.NombreMateria })))
        setTeachers(te.map((t: any) => ({ IdUsuario: t.IdUsuario, Nombre: `${t.Nombre} ${t.Apellido}` })))
      })

      if (mode === 'edit' && grade) {
        setForm({
          idHijo: grade.IdHijo,
          idMateria: grade.IdMateria,
          idUsuario: grade.IdUsuario,
          nota1: (grade as any).Nota1 ?? 0,
          nota2: (grade as any).Nota2 ?? 0,
          nota3: (grade as any).Nota3 ?? 0,
          nota4: (grade as any).Nota4 ?? 0,
          fecha: grade.Fecha.slice(0, 10)
        })
      } else {
        setForm({ idHijo: 0, idMateria: 0, idUsuario: 0, nota1: 0, nota2: 0, nota3: 0, nota4: 0, fecha: '' })
      }
      setErrors({})
    }
  }, [isOpen, mode, grade])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.idHijo) e.idHijo = 'Selecciona un estudiante'
    if (!form.idMateria) e.idMateria = 'Selecciona una materia'
    if (!form.idUsuario) e.idUsuario = 'Selecciona un docente'
    ;[form.nota1, form.nota2, form.nota3, form.nota4].forEach((n, idx) => {
      if (n == null || Number.isNaN(Number(n)) || Number(n) < 0 || Number(n) > 20) {
        e[`nota${idx+1}`] = 'Nota 0–20'
      }
    })
    if (!form.fecha) e.fecha = 'Selecciona una fecha'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) { showError('Error', 'Corrige los errores del formulario'); return }
    setLoading(true)
    try {
      const student = students.find(s => s.IdHijo === form.idHijo)
      const payloads = [
        { b:1, n:Number(form.nota1) },
        { b:2, n:Number(form.nota2) },
        { b:3, n:Number(form.nota3) },
        { b:4, n:Number(form.nota4) }
      ]
      for (const p of payloads) {
        await fetch('/api/admin/notes/course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materiaId: form.idMateria,
            gradoId: student?.IdGrado,
            seccionId: student?.IdSeccion,
            bimestre: p.b,
            fecha: form.fecha,
            idUsuario: form.idUsuario,
            notas: [{ idHijo: form.idHijo, nota: p.n }]
          })
        })
      }
      await onSave({ idHijo: form.idHijo, idMateria: form.idMateria, idUsuario: form.idUsuario, nota: 0, fecha: form.fecha } as any, grade?.IdNota)
      showSuccess(mode === 'create' ? 'Nota creada' : 'Nota actualizada', form.fecha)
      onClose()
    } catch {
      showError('Error', 'No se pudo guardar la nota')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">{mode === 'create' ? 'Nueva Calificación (B1–B4)' : 'Editar Calificación (B1–B4)'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estudiante</Label>
                <select value={form.idHijo} onChange={(e) => setForm({ ...form, idHijo: Number(e.target.value) })} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.idHijo ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value={0}>Seleccionar estudiante</option>
                  {students.map(s => <option key={s.IdHijo} value={s.IdHijo}>{s.Nombre}</option>)}
                </select>
                {errors.idHijo && <p className="text-sm text-red-500 mt-1">{errors.idHijo}</p>}
              </div>
          
              <div>
                <Label>Materia</Label>
                <select value={form.idMateria} onChange={(e) => setForm({ ...form, idMateria: Number(e.target.value) })} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.idMateria ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value={0}>Seleccionar materia</option>
                  {subjects.map(m => <option key={m.IdMateria} value={m.IdMateria}>{m.NombreMateria}</option>)}
                </select>
                {errors.idMateria && <p className="text-sm text-red-500 mt-1">{errors.idMateria}</p>}
              </div>
              <div>
                <Label>Docente</Label>
                <select value={form.idUsuario} onChange={(e) => setForm({ ...form, idUsuario: Number(e.target.value) })} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.idUsuario ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value={0}>Seleccionar docente</option>
                  {teachers.map(t => <option key={t.IdUsuario} value={t.IdUsuario}>{t.Nombre}</option>)}
                </select>
                {errors.idUsuario && <p className="text-sm text-red-500 mt-1">{errors.idUsuario}</p>}
              </div>
              <div>
                <Label>Fecha</Label>
                <div className="relative mt-1">
                  <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className={errors.fecha ? 'border-red-500' : ''} />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.fecha && <p className="text-sm text-red-500 mt-1">{errors.fecha}</p>}
              </div>
              {/* Unidad eliminada de la UI */}
              {[1,2,3,4].map(b => (
                <div key={b}>
                  <Label>Nota B{b}</Label>
                  <Input type="number" step="0.1" min="0" max="20" value={(form as any)[`nota${b}`]} onChange={(e) => setForm({ ...form, [`nota${b}`]: Number(e.target.value) } as any)} className={(errors as any)[`nota${b}`] ? 'border-red-500' : ''} />
                  {(errors as any)[`nota${b}`] && <p className="text-sm text-red-500 mt-1">{(errors as any)[`nota${b}`]}</p>}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Crear Nota' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            </div>
          </form>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </CardContent>
      </Card>
    </div>
  )
}
