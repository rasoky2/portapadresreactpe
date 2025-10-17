import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const students = await db.getAllAlumnos()
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
