import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json(
        { message: 'ID de padre requerido' },
        { status: 400 }
      )
    }

    const facturas = await db.getFacturasByParent(Number(parentId))
    return NextResponse.json(facturas)
  } catch (error) {
    console.error('Error obteniendo facturas del padre:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
