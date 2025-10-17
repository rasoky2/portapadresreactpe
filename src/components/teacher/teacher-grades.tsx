'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users } from 'lucide-react'
import CourseNotesModal from '@/components/admin/course-notes-modal'

interface Course { IdMateria: number; NombreMateria: string; IdGrado: number; NombreGrado: string; IdSeccion: number; NombreSeccion: string }

export default function TeacherGrades() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<{ IdMateria: number; IdGrado: number; IdSeccion: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Placeholder docente Id=2
        const res = await fetch('/api/teacher/courses?id=2')
        const data = await res.json()
        setCourses(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const open = (c: Course) => {
    setSelected({ IdMateria: c.IdMateria, IdGrado: c.IdGrado, IdSeccion: c.IdSeccion })
    setShowModal(true)
  }

  const courseFilter = selected ? [selected] : courses.map(c => ({ IdMateria: c.IdMateria, IdGrado: c.IdGrado, IdSeccion: c.IdSeccion }))
  const allowedSubjectIds = Array.from(new Set(courses.map(c => c.IdMateria)))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona calificaciones por bimestre</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          {loading ? 'Cargando cursos...' : 'No tienes cursos asignados'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-brand-600"/></div>
                  <div>
                    <CardTitle className="text-base">{c.NombreMateria}</CardTitle>
                    <CardDescription className="text-sm">{c.NombreGrado} {c.NombreSeccion}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button onClick={()=>open(c)}>Gestionar Notas</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseNotesModal
        isOpen={showModal}
        onClose={()=>setShowModal(false)}
        courseFilter={courseFilter}
        lockGradeSection={selected ? { IdGrado: selected.IdGrado, IdSeccion: selected.IdSeccion } : undefined}
        allowedSubjectIds={allowedSubjectIds}
      />
    </div>
  )
}
