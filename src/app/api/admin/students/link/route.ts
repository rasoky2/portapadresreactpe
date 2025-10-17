import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: NextRequest) {
  try {
    const { studentId, parentId } = await request.json()
    
    if (!studentId || !parentId) {
      return NextResponse.json(
        { message: 'ID de estudiante y padre son requeridos' },
        { status: 400 }
      )
    }

    await db.linkStudentToParent(studentId, parentId)
    
    return NextResponse.json({
      message: 'Estudiante vinculado exitosamente'
    })
  } catch (error) {
    console.error('Error vinculando estudiante:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
