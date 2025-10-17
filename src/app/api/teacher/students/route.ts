import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

// TODO: Obtener teacherId desde sesión; por ahora desde query ?id=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const teacherId = idParam ? Number(idParam) : 0
    if (!teacherId) return NextResponse.json({ message: 'ID de docente requerido' }, { status: 400 })
    const students = await db.getStudentsForTeacher(teacherId)
    return NextResponse.json(students)
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
