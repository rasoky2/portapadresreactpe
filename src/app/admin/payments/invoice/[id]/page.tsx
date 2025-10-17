import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PrintButton from '@/components/admin/print-button'
import { Database } from '@/lib/database'

export default async function InvoicePrintPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const db = new Database()
  const rows = await db.all(
    `SELECT f.*, 
            h.NombreHijo, h.ApellidoHijo, h.CodigoEstudiante, h.IdGrado, h.IdSeccion,
            p.NombrePadre, p.ApellidoPadre,
            g.NombreGrado,
            s.NombreSeccion
     FROM Facturas f
     JOIN Hijos h ON f.IdHijo = h.IdHijo
     JOIN Padres p ON f.IdPadre = p.IdPadre
     LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
     LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
     WHERE f.IdFactura = ?`,
    [Number(id)]
  ) as any[]
  if (!rows || rows.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6">Factura no encontrada</div>
      </AdminLayout>
    )
  }
  const factura = rows[0]
  const detalles = await db.getDetalleFactura(Number(id))
  // Datos del colegio (opcional)
  const schoolName = (await db.getSetting('SCHOOL_NAME')) || 'Colegio'
  const schoolAddress = (await db.getSetting('SCHOOL_ADDRESS')) || ''
  const schoolPhone = (await db.getSetting('SCHOOL_PHONE')) || ''
  const schoolEmail = (await db.getSetting('SCHOOL_EMAIL')) || ''
  const fechaEmision = factura.FechaEmision

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <Card id="invoice-print" className="shadow-none border print:shadow-none print:border-0">
          <CardHeader>
            <CardTitle className="mb-2">Factura #{factura.NumeroFactura}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Encabezado: Colegio y Destinatario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xl font-semibold text-gray-900">{schoolName}</div>
                {schoolAddress && <div className="text-sm text-gray-600">Dirección: {schoolAddress}</div>}
                {schoolPhone && <div className="text-sm text-gray-600">Teléfono: {schoolPhone}</div>}
                {schoolEmail && <div className="text-sm text-gray-600">Email: {schoolEmail}</div>}
                <div className="text-sm text-gray-600 mt-2">Fecha emisión: {new Date(fechaEmision).toLocaleDateString('es-PE')}</div>
                <div className="text-xs text-gray-500">Estado: {factura.Estado}</div>
              </div>
              <div className="md:text-right">
                <div className="text-sm font-semibold text-gray-700">Para</div>
                <div className="text-gray-900">{factura.NombrePadre} {factura.ApellidoPadre}</div>
                <div className="text-sm text-gray-600">Est.: {factura.NombreHijo} {factura.ApellidoHijo}</div>
              </div>
            </div>
            {/* Bloque duplicado removido para evitar repetir 'Para' y mostrar solo datos del colegio configurado */}

            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Descripción</th>
                    <th className="text-right px-4 py-2">Cantidad</th>
                    <th className="text-right px-4 py-2">Precio</th>
                    <th className="text-right px-4 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(detalles) && detalles.length > 0 ? detalles.map((d: any) => (
                    <tr key={d.IdDetalle} className="border-t">
                      <td className="px-4 py-2">{d.NombreConcepto || 'Concepto'}</td>
                      <td className="px-4 py-2 text-right">{d.Cantidad || 1}</td>
                      <td className="px-4 py-2 text-right">S/ {(d.PrecioUnitario || d.Subtotal).toFixed?.(2) || Number(d.PrecioUnitario || d.Subtotal).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">S/ {Number(d.Subtotal).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr className="border-t">
                      <td className="px-4 py-2" colSpan={4}>Sin detalle</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-600">Subtotal: S/ {Number(factura.Subtotal).toFixed(2)}</div>
                <div className="text-sm text-gray-600">Descuento: S/ {Number(factura.Descuento).toFixed(2)}</div>
                <div className="text-lg font-semibold text-gray-900">Total: S/ {Number(factura.Total).toFixed(2)}</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end no-print">
              <PrintButton />
            </div>
          </CardContent>
        </Card>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      ` }} />
    </AdminLayout>
  )
}
