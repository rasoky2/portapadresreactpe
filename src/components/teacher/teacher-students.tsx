'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GraduationCap, Search, BookOpen, Calendar, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
const CourseNotesModal = dynamic(() => import('@/components/admin/course-notes-modal'), { ssr: false })

interface TStudent {
  IdHijo: number
  IdGrado?: number
  IdSeccion?: number
  NombreHijo: string
  ApellidoHijo: string
  Edad?: number
  CodigoEstudiante?: string
  NombreGrado?: string
  NombreSeccion?: string
  NombreNivel?: string
  Materias?: string
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<TStudent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<{ IdMateria: number; IdGrado: number; IdSeccion: number } | null>(null)

  useEffect(() => {
    fetch('/api/teacher/students?id=2')
      .then(r => r.json())
      .then((rows) => setStudents(rows))
      .finally(()=>setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search) return students
    const s = search.toLowerCase()
    return students.filter(st =>
      `${st.ApellidoHijo} ${st.NombreHijo}`.toLowerCase().includes(s) ||
      (st.NombreGrado?.toLowerCase().includes(s) ?? false) ||
      (st.CodigoEstudiante?.toLowerCase().includes(s) ?? false)
    )
  }, [students, search])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
        <p className="mt-1 text-sm text-gray-500">Listado por grado/sección según tus cursos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estudiantes ({filtered.length})</CardTitle>
              <CardDescription>Busca por nombre, grado o código</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
              <p className="text-gray-500 mt-2">Cargando estudiantes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No se encontraron estudiantes
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((st) => (
                <div key={st.IdHijo} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{st.ApellidoHijo} {st.NombreHijo}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{st.NombreNivel}</span>
                        <span>•</span>
                        <span>{st.NombreGrado} {st.NombreSeccion}</span>
                        {st.CodigoEstudiante && (<><span>•</span><span>{st.CodigoEstudiante}</span></>)}
                      </div>
                      {st.Materias && (
                        <p className="text-xs text-gray-400 truncate max-w-xl">Materias: {st.Materias}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      // Al abrir, bloqueamos grado/sección del alumno y limitamos materias a las del alumno (se resaltan deshabilitadas)
                      setSelectedCourse({ IdMateria: 0 as any, IdGrado: st.IdGrado as number, IdSeccion: st.IdSeccion as number })
                      setCourseModalOpen(true)
                    }}>
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm"><Calendar className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {courseModalOpen && selectedCourse && (
        <CourseNotesModal
          isOpen={courseModalOpen}
          onClose={() => setCourseModalOpen(false)}
          courseFilter={[]}
          lockGradeSection={{ IdGrado: selectedCourse.IdGrado, IdSeccion: selectedCourse.IdSeccion }}
        />
      )}
    </div>
  )
}
