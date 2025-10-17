import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()
const DEFAULT_TEST_MP_TOKEN = 'TEST-8563921263786667-101707-4ee74c73a3abc6290a5361897367087a-2908645408'

export async function POST(request: Request) {
  try {
    const { facturaId, accessToken } = await request.json()
    if (!facturaId) {
      return NextResponse.json({ message: 'ID de factura requerido' }, { status: 400 })
    }

    // Prioridad: token en request (UI) -> token guardado en Settings -> variable de entorno -> token de prueba por defecto
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
      token = DEFAULT_TEST_MP_TOKEN
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

    // Crear Preference en Mercado Pago con reintentos de moneda
    const buildBody = (currency: 'PEN' | 'ARS' | 'USD') => ({
      items: [
        {
          title: `Factura #${factura.NumeroFactura}`,
          quantity: 1,
          unit_price: Number(factura.Total),
          currency_id: currency
        }
      ],
      external_reference: String(factura.IdFactura),
      back_urls: {
        success: `${origin}/parent/payments?mp_status=success`,
        failure: `${origin}/parent/payments?mp_status=failure`,
        pending: `${origin}/parent/payments?mp_status=pending`
      },
      notification_url: `${origin}/api/payments/mercadopago/webhook`
    })

    const currencies: Array<'PEN' | 'ARS' | 'USD'> = ['PEN', 'ARS', 'USD']
    let lastError: any = null
    for (const currency of currencies) {
      const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildBody(currency))
      })
      if (res.ok) {
        const pref = await res.json()
        return NextResponse.json({ ok: true, init_point: pref.init_point || pref.sandbox_init_point, currency })
      }
      try {
        lastError = await res.json()
      } catch {
        lastError = { status: res.status, text: await res.text() }
      }
    }

    return NextResponse.json({ ok: false, message: 'Error creando preferencia', error: lastError })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ message }, { status: 500 })
  }
}
