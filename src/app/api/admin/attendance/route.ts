import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const attendance = await db.getAllAttendance()
    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error obteniendo asistencia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const attendanceData = await request.json()
    
    // Validar datos requeridos
    if (!attendanceData.idHijo || !attendanceData.fecha || attendanceData.asistio === undefined) {
      return NextResponse.json(
        { message: 'ID de estudiante, fecha y estado de asistencia son requeridos' },
        { status: 400 }
      )
    }

    const result = await db.createAttendance({
      idHijo: attendanceData.idHijo,
      fecha: attendanceData.fecha,
      asistio: attendanceData.asistio
    })

    return NextResponse.json({
      message: 'Asistencia registrada exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error registrando asistencia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
