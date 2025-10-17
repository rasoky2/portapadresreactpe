import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = Number(searchParams.get('year') || new Date().getFullYear())
    const month = Number(searchParams.get('month') || (new Date().getMonth() + 1))
    const idNivel = searchParams.get('idNivel') ? Number(searchParams.get('idNivel')) : null
    const idGrado = searchParams.get('idGrado') ? Number(searchParams.get('idGrado')) : null

    const rows = await db.getPendingPayments({ year, month, idNivel, idGrado })
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error obteniendo pendientes de pago:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
