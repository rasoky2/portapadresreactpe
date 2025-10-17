import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

// GET - Obtener horarios de una materia específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subjectId = parseInt(id)

    if (isNaN(subjectId)) {
      return NextResponse.json(
        { message: 'ID de materia inválido' },
        { status: 400 }
      )
    }

    // Verificar que la materia existe
    const subject = await db.get('SELECT IdMateria FROM Materias WHERE IdMateria = ?', [subjectId])
    if (!subject) {
      return NextResponse.json(
        { message: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    const schedules = await db.getSubjectSchedules(subjectId)
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error obteniendo horarios de materia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear horario para una materia
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subjectId = parseInt(id)

    if (isNaN(subjectId)) {
      return NextResponse.json(
        { message: 'ID de materia inválido' },
        { status: 400 }
      )
    }

    const scheduleData = await request.json()

    // Validar datos requeridos
    if (!scheduleData.diaSemana || !scheduleData.horaInicio || !scheduleData.horaFin) {
      return NextResponse.json(
        { message: 'Día de semana, hora de inicio y hora de fin son requeridos' },
        { status: 400 }
      )
    }

    // Validar día de semana
    const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    if (!diasValidos.includes(scheduleData.diaSemana)) {
      return NextResponse.json(
        { message: 'Día de semana inválido' },
        { status: 400 }
      )
    }

    // Validar formato de hora (HH:MM)
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!horaRegex.test(scheduleData.horaInicio) || !horaRegex.test(scheduleData.horaFin)) {
      return NextResponse.json(
        { message: 'Formato de hora inválido. Use HH:MM' },
        { status: 400 }
      )
    }

    // Verificar que la materia existe
    const subject = await db.get('SELECT IdMateria FROM Materias WHERE IdMateria = ?', [subjectId])
    if (!subject) {
      return NextResponse.json(
        { message: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    const result = await db.createSubjectSchedule({
      idMateria: subjectId,
      diaSemana: scheduleData.diaSemana,
      horaInicio: scheduleData.horaInicio,
      horaFin: scheduleData.horaFin
    })

    return NextResponse.json({
      message: 'Horario creado correctamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creando horario de materia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
