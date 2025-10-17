import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const materiaId = Number(searchParams.get('materiaId'))
    const gradoId = Number(searchParams.get('gradoId'))
    const seccionId = Number(searchParams.get('seccionId'))
    const bimestre = Number(searchParams.get('bimestre'))
    if (!materiaId || !gradoId || !seccionId || !bimestre) {
      return NextResponse.json({ message: 'materiaId, gradoId, seccionId y bimestre son requeridos' }, { status: 400 })
    }
    const rows = await db.getCourseNotes(materiaId, gradoId, seccionId, bimestre)
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { materiaId, gradoId, seccionId, bimestre, fecha, idUsuario, notas } = body || {}
    if (!materiaId || !gradoId || !seccionId || !bimestre || !fecha || !Array.isArray(notas)) {
      return NextResponse.json({ message: 'Campos requeridos: materiaId, gradoId, seccionId, bimestre, fecha, notas[]' }, { status: 400 })
    }
    await db.upsertCourseNotes({ materiaId, gradoId, seccionId, bimestre, fecha, idUsuario, notas })
    return NextResponse.json({ message: 'Notas guardadas' })
  } catch (e) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}


