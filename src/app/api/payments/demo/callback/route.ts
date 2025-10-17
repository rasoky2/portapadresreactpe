import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const { facturaId, status } = await request.json()
    if (!facturaId || !status) {
      return NextResponse.json({ message: 'facturaId y status son requeridos' }, { status: 400 })
    }
    const estado = status === 'approved' ? 'Pagada' : status === 'rejected' ? 'Cancelada' : 'Pendiente'
    await db.updateFacturaEstado(Number(facturaId), estado)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
