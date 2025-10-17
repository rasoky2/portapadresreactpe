import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const teacherId = idParam ? Number(idParam) : 0
    if (!teacherId) return NextResponse.json({ message: 'ID de docente requerido' }, { status: 400 })
    const rows = await db.getParentsForTeacher(teacherId)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
