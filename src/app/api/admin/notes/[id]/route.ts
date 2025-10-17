import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const idNota = Number.parseInt(id, 10)
    if (Number.isNaN(idNota)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const body = await request.json()
    if (!body.idHijo || !body.idMateria || !body.idUsuario || body.nota == null || !body.fecha || !body.bimestre) {
      return NextResponse.json({ message: 'Campos requeridos: idHijo, idMateria, idUsuario, bimestre, nota, fecha' }, { status: 400 })
    }

    await db.updateNota(idNota, {
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
    return NextResponse.json({ message: 'Nota actualizada' })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const idNota = Number.parseInt(id, 10)
    if (Number.isNaN(idNota)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
    await db.deleteNota(idNota)
    return NextResponse.json({ message: 'Nota eliminada' })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
