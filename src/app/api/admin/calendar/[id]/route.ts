import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventId = Number.parseInt(id, 10)
    if (Number.isNaN(eventId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    if (!body.fecha || !body.descripcion) {
      return NextResponse.json({ message: 'Fecha y descripción son requeridos' }, { status: 400 })
    }

    const exists = await db.getAllEvents()
    if (!Array.isArray(exists) || !exists.find((e: any) => (e as any).IdEvento === eventId)) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 })
    }

    await db.updateEvent(eventId, { fecha: body.fecha, descripcion: body.descripcion, tipo: body.tipo })
    return NextResponse.json({ message: 'Evento actualizado' })
  } catch (error) {
    console.error('Error actualizando evento:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventId = Number.parseInt(id, 10)
    if (Number.isNaN(eventId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
    }

    const exists = await db.getAllEvents()
    if (!Array.isArray(exists) || !exists.find((e: any) => (e as any).IdEvento === eventId)) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 })
    }

    await db.deleteEvent(eventId)
    return NextResponse.json({ message: 'Evento eliminado' })
  } catch (error) {
    console.error('Error eliminando evento:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
