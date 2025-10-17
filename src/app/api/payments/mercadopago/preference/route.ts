import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const { facturaId, accessToken } = await request.json()
    if (!facturaId) {
      return NextResponse.json({ message: 'ID de factura requerido' }, { status: 400 })
    }

    // Prioridad: token en request (UI) -> token guardado en Settings -> variable de entorno (fallback)
    let token = accessToken as string | undefined
    if (!token) {
      try {
        token = await db.getSetting('MP_ACCESS_TOKEN') || undefined
      } catch {}
    }
    if (!token) {
      token = process.env.MP_ACCESS_TOKEN
    }
    if (!token) {
      return NextResponse.json({ message: 'Configura MP_ACCESS_TOKEN en .env.local' }, { status: 500 })
    }

    // Obtener datos de la factura
    const rows = (await db.all(
      `SELECT f.*, h.NombreHijo, h.ApellidoHijo, p.NombrePadre, p.ApellidoPadre
       FROM Facturas f
       JOIN Hijos h ON f.IdHijo = h.IdHijo
       JOIN Padres p ON f.IdPadre = p.IdPadre
       WHERE f.IdFactura = ?`,
      [facturaId]
    )) as any[]

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 })
    }
    const factura = rows[0]

    const origin = new URL(request.url).origin

    // Crear Preference en Mercado Pago
    const prefRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            title: `Factura #${factura.NumeroFactura}`,
            quantity: 1,
            unit_price: Number(factura.Total),
            currency_id: 'PEN'
          }
        ],
        external_reference: String(factura.IdFactura),
        back_urls: {
          success: `${origin}/parent/payments?mp_status=success`,
          failure: `${origin}/parent/payments?mp_status=failure`,
          pending: `${origin}/parent/payments?mp_status=pending`
        },
        auto_return: 'approved',
        notification_url: `${origin}/api/payments/mercadopago/webhook`
      })
    })

    if (!prefRes.ok) {
      const text = await prefRes.text()
      return NextResponse.json({ message: 'Error creando preferencia', error: text }, { status: 502 })
    }
    const pref = await prefRes.json()
    return NextResponse.json({ init_point: pref.init_point || pref.sandbox_init_point })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ message }, { status: 500 })
  }
}
