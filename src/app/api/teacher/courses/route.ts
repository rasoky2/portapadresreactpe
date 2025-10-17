import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

// TODO: Obtener teacherId desde sesión/autenticación; por ahora desde query ?id=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const teacherId = idParam ? Number(idParam) : 0
    if (!teacherId) return NextResponse.json({ message: 'ID de docente requerido' }, { status: 400 })
    const courses = await db.getTeacherCourses(teacherId)
    return NextResponse.json(courses)
  } catch (e) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
