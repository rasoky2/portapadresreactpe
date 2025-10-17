import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    // Obtener factura
    const facturas = await db.all(
      `SELECT f.*, h.NombreHijo, h.ApellidoHijo, p.NombrePadre, p.ApellidoPadre
       FROM Facturas f
       JOIN Hijos h ON f.IdHijo = h.IdHijo
       JOIN Padres p ON f.IdPadre = p.IdPadre
       WHERE f.IdFactura = ?`,
      [id]
    ) as Array<{
      IdFactura: number
      IdPadre: number
      IdHijo: number
      FechaEmision: string
      FechaVencimiento: string
      Estado: string
      Total: number
      NombreHijo: string
      ApellidoHijo: string
      NombrePadre: string
      ApellidoPadre: string
    }>

    if (!facturas || facturas.length === 0) {
      return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 })
    }

    const factura = facturas[0]
    const detalles = await db.getDetalleFactura(id)

    return NextResponse.json({ factura, detalles })
  } catch (error) {
    console.error('Error obteniendo factura por id:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
