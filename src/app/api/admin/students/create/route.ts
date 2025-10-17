import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json()
    
    if (!studentData.nombreHijo || !studentData.apellidoHijo || !studentData.idPadre) {
      return NextResponse.json(
        { message: 'Nombre, apellido e ID de padre son requeridos' },
        { status: 400 }
      )
    }

    const result = await db.createStudent(studentData)
    
    return NextResponse.json({
      message: 'Estudiante creado exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creando estudiante:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
