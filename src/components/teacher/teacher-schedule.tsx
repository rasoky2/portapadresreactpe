'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, BookOpen } from 'lucide-react'

interface Slot {
  DiaSemana: string
  HoraInicio: string
  HoraFin: string
  NombreMateria: string
  NombreGrado: string
  NombreSeccion: string
  NombreNivel: string
}

const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

export default function TeacherSchedule() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/teacher/schedule?id=2')
        const data = await res.json()
        setSlots(data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>()
    days.forEach(d => map.set(d, []))
    slots.forEach(s => { map.set(s.DiaSemana, [...(map.get(s.DiaSemana)||[]), s]) })
    return map
  }, [slots])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Horario</h1>
        <p className="mt-1 text-sm text-gray-500">Materias programadas por día</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <Card key={day}>
            <CardHeader className="pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600"/>
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              {(grouped.get(day)||[]).length === 0 ? (
                <div className="text-sm text-gray-500">Sin clases</div>
              ) : (
                <div className="space-y-2">
                  {(grouped.get(day)||[]).map((s, idx) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-brand-600"/></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.NombreMateria}</div>
                            <div className="text-xs text-gray-500">{s.NombreGrado} {s.NombreSeccion}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700"><Clock className="w-4 h-4" />{s.HoraInicio} - {s.HoraFin}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
