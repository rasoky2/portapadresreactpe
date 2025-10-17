import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const conceptos = await db.getAllConceptosPago()
    return NextResponse.json(conceptos)
  } catch (error) {
    console.error('Error obteniendo conceptos de pago:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const conceptoData = await request.json()
    
    // Validar datos requeridos
    if (!conceptoData.nombreConcepto || !conceptoData.monto || !conceptoData.tipoConcepto) {
      return NextResponse.json(
        { message: 'Nombre, monto y tipo de concepto son requeridos' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO ConceptosPago (NombreConcepto, Descripcion, Monto, TipoConcepto, IdGrado, IdNivel, Activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    const result = await db.runWithInfo(query, [
      conceptoData.nombreConcepto,
      conceptoData.descripcion || null,
      conceptoData.monto,
      conceptoData.tipoConcepto,
      conceptoData.idGrado || null,
      conceptoData.idNivel || null,
      conceptoData.activo !== false ? 1 : 0
    ])

    return NextResponse.json({
      message: 'Concepto de pago creado exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creando concepto de pago:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
