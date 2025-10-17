import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = Number(searchParams.get('childId'))
    if (!childId) return NextResponse.json({ message: 'childId requerido' }, { status: 400 })
    const notas = await db.getNotasByStudent(childId)
    return NextResponse.json(notas)
  } catch (e) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}


