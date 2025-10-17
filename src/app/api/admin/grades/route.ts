import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const grades = await db.getAllGrados()
    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error obteniendo grados:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}