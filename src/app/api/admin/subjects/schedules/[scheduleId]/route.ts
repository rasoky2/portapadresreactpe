import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

// PUT - Actualizar horario específico
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params
    const scheduleIdNum = parseInt(scheduleId)

    if (isNaN(scheduleIdNum)) {
      return NextResponse.json(
        { message: 'ID de horario inválido' },
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

    // Verificar que el horario existe
    const existingSchedule = await db.get('SELECT IdHorario FROM HorariosMaterias WHERE IdHorario = ?', [scheduleIdNum])
    if (!existingSchedule) {
      return NextResponse.json(
        { message: 'Horario no encontrado' },
        { status: 404 }
      )
    }

    await db.updateSubjectSchedule(scheduleIdNum, {
      diaSemana: scheduleData.diaSemana,
      horaInicio: scheduleData.horaInicio,
      horaFin: scheduleData.horaFin
    })

    return NextResponse.json({
      message: 'Horario actualizado correctamente'
    })
  } catch (error) {
    console.error('Error actualizando horario:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar horario específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params
    const scheduleIdNum = parseInt(scheduleId)

    if (isNaN(scheduleIdNum)) {
      return NextResponse.json(
        { message: 'ID de horario inválido' },
        { status: 400 }
      )
    }

    // Verificar que el horario existe
    const existingSchedule = await db.get('SELECT IdHorario FROM HorariosMaterias WHERE IdHorario = ?', [scheduleIdNum])
    if (!existingSchedule) {
      return NextResponse.json(
        { message: 'Horario no encontrado' },
        { status: 404 }
      )
    }

    await db.deleteSubjectSchedule(scheduleIdNum)

    return NextResponse.json({
      message: 'Horario eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando horario:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
