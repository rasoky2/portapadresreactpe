import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const pagoData = await request.json()
    
    // Validar datos requeridos
    if (!pagoData.idFactura || !pagoData.monto || !pagoData.metodoPago) {
      return NextResponse.json(
        { message: 'ID de factura, monto y método de pago son requeridos' },
        { status: 400 }
      )
    }

    const result = await db.createPago({
      idFactura: pagoData.idFactura,
      fechaPago: pagoData.fechaPago || new Date().toISOString().split('T')[0],
      monto: pagoData.monto,
      metodoPago: pagoData.metodoPago,
      referencia: pagoData.referencia,
      observaciones: pagoData.observaciones
    })

    // Actualizar estado de la factura a "Pagada"
    await db.updateFacturaEstado(pagoData.idFactura, 'Pagada')

    return NextResponse.json({
      message: 'Pago registrado exitosamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error registrando pago:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
