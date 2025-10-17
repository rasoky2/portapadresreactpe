import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gradoId = searchParams.get('gradoId')
    
    if (!gradoId) {
      return NextResponse.json(
        { message: 'ID de grado es requerido' },
        { status: 400 }
      )
    }

    const sections = await db.getSeccionesByGrado(parseInt(gradoId))
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error obteniendo secciones:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
