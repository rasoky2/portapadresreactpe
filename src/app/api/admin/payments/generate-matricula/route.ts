import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const { studentId, parentId, nivelId } = await request.json()
    
    if (!studentId || !parentId || !nivelId) {
      return NextResponse.json(
        { message: 'ID de estudiante, padre y nivel son requeridos' },
        { status: 400 }
      )
    }

    const result = await db.generateFacturaMatricula(studentId, parentId, nivelId)

    return NextResponse.json({
      message: 'Factura de matrícula generada exitosamente',
      facturaId: result.lastID
    })
  } catch (error) {
    console.error('Error generando factura de matrícula:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
