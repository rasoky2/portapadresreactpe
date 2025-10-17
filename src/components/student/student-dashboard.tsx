'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, GraduationCap } from 'lucide-react'

interface MyGrade {
  Materia: string
  B1?: number
  B2?: number
  B3?: number
  B4?: number
}

export default function StudentDashboard() {
  const [grades, setGrades] = useState<MyGrade[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    // TODO: id estudiante desde sesión; demo con fetch generales
    fetch('/api/admin/subjects').then(r=>r.json()).then(subj => {
      setGrades(subj.slice(0,5).map((s:any)=>({ Materia: s.NombreMateria, B1: undefined, B2: undefined, B3: undefined, B4: undefined })))
    })
    fetch('/api/admin/calendar').then(r=>r.json()).then(setEvents).catch(()=>setEvents([]))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Panel</h1>
        <p className="mt-1 text-sm text-gray-500">Resumen de notas y próximos eventos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Mis Calificaciones</CardTitle>
            <CardDescription>Por bimestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">Materia</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B1</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B2</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B3</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-3 py-2">B4</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2 text-sm text-gray-800">{g.Materia}</td>
                      <td className="px-3 py-2 text-sm">{g.B1 ?? '-'}</td>
                      <td className="px-3 py-2 text-sm">{g.B2 ?? '-'}</td>
                      <td className="px-3 py-2 text-sm">{g.B3 ?? '-'}</td>
                      <td className="px-3 py-2 text-sm">{g.B4 ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Próximos Eventos</CardTitle>
            <CardDescription>Calendario escolar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0,5).map((e:any, i:number)=>(
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.Descripcion}</p>
                    <p className="text-xs text-gray-500">{new Date(e.Fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


