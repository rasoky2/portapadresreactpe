import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()
const DEFAULT_TEST_MP_TOKEN = 'TEST-8563921263786667-101707-4ee74c73a3abc6290a5361897367087a-2908645408'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Mercado Pago envía distintos formatos; si viene topic/type=payment, consultar el pago
    const topic = data?.type || data?.topic
    const id = data?.data?.id || data?.id

    if (topic === 'payment' && id) {
      let token: string | null = null
      try {
        token = await db.getSetting('MP_ACCESS_TOKEN')
      } catch {}
      if (!token) token = process.env.MP_ACCESS_TOKEN || null
      if (!token) token = DEFAULT_TEST_MP_TOKEN
      if (!token) return NextResponse.json({ ok: true })

      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (payRes.ok) {
        const pay = await payRes.json()
        const external = pay?.external_reference
        const status = pay?.status // approved, rejected, pending
        if (external && status) {
          const map: Record<string, string> = { approved: 'Pagada', rejected: 'Cancelada', pending: 'Pendiente' }
          await db.updateFacturaEstado(Number(external), map[status] || 'Pendiente')
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
