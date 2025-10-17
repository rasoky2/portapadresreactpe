import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = Number(searchParams.get('childId'))
    if (!childId) return NextResponse.json({ message: 'childId requerido' }, { status: 400 })
    const rows = await db.all(`SELECT Fecha, Asistio FROM Asistencia WHERE IdHijo = ? ORDER BY Fecha DESC`, [childId])
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
