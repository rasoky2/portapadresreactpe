import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(
  request: Request,
  { params }: { params: { parentId: string } }
) {
  try {
    const parentId = parseInt(params.parentId)
    
    if (isNaN(parentId)) {
      return NextResponse.json(
        { message: 'ID de padre inválido' },
        { status: 400 }
      )
    }

    const students = await db.getStudentsByParent(parentId)
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error obteniendo estudiantes vinculados:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
