import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gradoId = Number(searchParams.get('gradoId'))
    const seccionId = Number(searchParams.get('seccionId'))
    const fecha = searchParams.get('fecha') || new Date().toISOString().slice(0,10)
    if (!gradoId || !seccionId) return NextResponse.json({ message: 'gradoId y seccionId son requeridos' }, { status: 400 })
    const rows = await db.getAttendanceForCourse(gradoId, seccionId, fecha)
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gradoId, seccionId, fecha, records } = body || {}
    if (!gradoId || !seccionId || !fecha || !Array.isArray(records)) {
      return NextResponse.json({ message: 'Campos requeridos: gradoId, seccionId, fecha, records[]' }, { status: 400 })
    }
    await db.saveAttendanceBatch(Number(gradoId), Number(seccionId), fecha, records.map((r:any)=>({ idHijo: Number(r.idHijo), asistio: !!r.asistio })))
    return NextResponse.json({ message: 'Asistencia guardada' })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
