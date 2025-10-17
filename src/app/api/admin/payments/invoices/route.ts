import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const facturas = await db.getAllFacturas()
    return NextResponse.json(facturas)
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const facturaData = await request.json()
    
    // Validar datos requeridos
    if (!facturaData.idPadre || !facturaData.idHijo || !facturaData.total) {
      return NextResponse.json(
        { message: 'ID de padre, ID de hijo y total son requeridos' },
        { status: 400 }
      )
    }

    // Generar número de factura si no se proporciona
    const numeroFactura = facturaData.numeroFactura || `FAC-${new Date().getFullYear()}-${Date.now()}`
    
    // Fechas por defecto
    const fechaEmision = facturaData.fechaEmision || new Date().toISOString().split('T')[0]
    const fechaVencimiento = facturaData.fechaVencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const result = await db.createFactura({
      idPadre: facturaData.idPadre,
      idHijo: facturaData.idHijo,
      numeroFactura,
      fechaEmision,
      fechaVencimiento,
      subtotal: facturaData.subtotal || facturaData.total,
      descuento: facturaData.descuento || 0,
      total: facturaData.total,
      observaciones: facturaData.observaciones
    })

    return NextResponse.json({
      message: 'Factura creada exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creando factura:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
