import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const notas = await db.getAllNotas()
    return NextResponse.json(notas)
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.idHijo || !body.idMateria || !body.idUsuario || body.nota == null || !body.fecha || !body.bimestre) {
      return NextResponse.json({ message: 'Campos requeridos: idHijo, idMateria, idUsuario, bimestre, nota, fecha' }, { status: 400 })
    }
    const result = await db.createNota({
      idHijo: Number(body.idHijo),
      idMateria: Number(body.idMateria),
      idUsuario: Number(body.idUsuario),
      bimestre: Number(body.bimestre),
      unidad: body.unidad,
      criterio: body.criterio,
      nota: Number(body.nota),
      peso: body.peso != null ? Number(body.peso) : undefined,
      tipoNota: body.tipoNota,
      fecha: body.fecha
    })
    return NextResponse.json({ message: 'Nota creada', id: result.lastID })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
