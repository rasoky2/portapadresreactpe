import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const events = await db.getAllEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.info('Error obteniendo eventos')
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const eventData = await request.json()
    
    // Validar datos requeridos
    if (!eventData.fecha || !eventData.descripcion) {
      return NextResponse.json(
        { message: 'Fecha y descripción son requeridos' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO Calendario (Fecha, Descripcion, Tipo)
      VALUES (?, ?, ?)
    `
    
    const result = await db.createEvent({
      fecha: eventData.fecha,
      descripcion: eventData.descripcion,
      tipo: eventData.tipo
    })

    return NextResponse.json({
      message: 'Evento creado exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.info('Error creando evento')
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
