import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json()
    
    if (!studentId || typeof studentId !== 'number') {
      return NextResponse.json(
        { message: 'ID de estudiante requerido' },
        { status: 400 }
      )
    }
    
    // Desvincular estudiante del padre
    await db.unlinkStudentFromParent(studentId)
    
    return NextResponse.json({
      message: 'Estudiante desvinculado exitosamente'
    })
    
  } catch (error) {
    // Error desvinculando estudiante
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { message: 'Error interno del servidor', error: errorMessage },
      { status: 500 }
    )
  }
}
