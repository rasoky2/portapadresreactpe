import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const parents = await db.getAllParents()
    return NextResponse.json(parents)
  } catch (error) {
    // Error obteniendo padres
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
