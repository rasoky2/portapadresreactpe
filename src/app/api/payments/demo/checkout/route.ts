import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { facturaId } = await request.json()
    if (!facturaId) {
      return NextResponse.json({ message: 'ID de factura requerido' }, { status: 400 })
    }

    // En un gateway real se crearía una sesión/Preference. Aquí solo devolvemos una URL interna
    const url = `/parent/payments/demo/${facturaId}`
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
