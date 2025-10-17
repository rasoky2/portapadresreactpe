'use client'

import ParentLayout from '@/components/parent/parent-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useMemo, useState } from 'react'

interface InvoiceResponse {
  factura: { IdFactura: number; NumeroFactura: string; Total: number }
}

export default function DemoCheckoutPage({ params }: { params: { id: string } }) {
  const [processing, setProcessing] = useState(false)
  const [factura, setFactura] = useState<InvoiceResponse['factura'] | null>(null)
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)

  const brand = useMemo(() => {
    const n = number.replace(/\s+/g, '')
    if (/^4[0-9]{0,}$/.test(n)) return 'visa'
    if (/^(5[1-5]|22[2-9]|2[3-7])[0-9]{0,}$/.test(n)) return 'mastercard'
    if (/^3[47][0-9]{0,}$/.test(n)) return 'amex'
    if (/^(6011|65|64[4-9])[0-9]{0,}$/.test(n)) return 'discover'
    return 'desconocida'
  }, [number])

  // ===== In-house card validation helpers =====
  const luhnCheck = (num: string) => {
    let sum = 0
    let shouldDouble = false
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10)
      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      shouldDouble = !shouldDouble
    }
    return sum % 10 === 0
  }

  const expectedLengths: Record<string, number[]> = {
    visa: [13, 16, 19],
    mastercard: [16],
    amex: [15],
    discover: [16, 19],
    desconocida: [12, 13, 14, 15, 16, 17, 18, 19]
  }

  const cvvSizeByBrand: Record<string, number> = {
    visa: 3,
    mastercard: 3,
    amex: 4,
    discover: 3,
    desconocida: 3
  }

  useEffect(() => {
    fetch(`/api/admin/payments/invoices/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: InvoiceResponse | null) => {
        if (data?.factura) setFactura(data.factura)
      })
      .catch(() => {})
  }, [params.id])

  const validate = () => {
    setError('')
    const clean = number.replace(/\s+/g, '')
    if (!holder.trim()) { setError('Titular requerido'); return false }
    if (!/^[0-9]+$/.test(clean)) { setError('Número inválido'); return false }
    if (!expectedLengths[brand].includes(clean.length)) { setError('Longitud de tarjeta inválida'); return false }
    if (!luhnCheck(clean)) { setError('Número no supera validación Luhn'); return false }

    const m = expiry.match(/^(\d{2})\/(\d{2})$/)
    if (!m) { setError('Fecha inválida (MM/AA)'); return false }
    const mm = parseInt(m[1], 10), yy = parseInt('20' + m[2], 10)
    if (mm < 1 || mm > 12) { setError('Mes inválido'); return false }
    const now = new Date()
    const expDate = new Date(yy, mm)
    if (expDate <= now) { setError('Tarjeta vencida'); return false }

    const needCvv = cvvSizeByBrand[brand]
    if (!new RegExp(`^\\d{${needCvv}}$`).test(cvv)) { setError(`CVV debe tener ${needCvv} dígitos`); return false }
    return true
  }

  const payNow = async () => {
    if (!validate()) return
    setProcessing(true)
    try {
      // Simular procesamiento (aprobado)
      await new Promise(r => setTimeout(r, 800))
      await fetch('/api/payments/demo/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facturaId: Number(params.id), status: 'approved' })
      })
      window.location.href = '/parent/payments'
    } finally {
      setProcessing(false)
    }
  }

  return (
    <ParentLayout>
      <div className="max-w-xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Pasarela de pago (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Card Preview */}
            <div className="mb-6">
              <div className="relative w-full h-48 [perspective:1000px]">
                <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 rounded-2xl p-5 text-white bg-gradient-to-br from-slate-800 to-slate-600 shadow-lg [backface-visibility:hidden]">
                    <div className="flex justify-between items-center text-xs opacity-80">
                      <span>{brand.toUpperCase()}</span>
                      <span>DEMO</span>
                    </div>
                    <div className="mt-8 tracking-widest text-lg">
                      {(number || '•••• •••• •••• ••••').replace(/(\d{4})(?=\d)/g, '$1 ')}
                    </div>
                    <div className="mt-6 flex justify-between text-sm">
                      <div>
                        <div className="opacity-70">TITULAR</div>
                        <div className="font-medium">{holder || 'NOMBRE APELLIDO'}</div>
                      </div>
                      <div>
                        <div className="opacity-70">VENCE</div>
                        <div className="font-medium">{expiry || 'MM/AA'}</div>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 rounded-2xl bg-slate-700 text-white shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <div className="h-10 bg-black/70 mt-6"></div>
                    <div className="px-5 mt-6 text-sm">
                      <div className="opacity-70 mb-1">CVV</div>
                      <div className="bg-white text-black inline-block px-3 py-1 rounded">{cvv || '•••'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4 text-sm text-gray-600">
              {factura ? (
                <span>
                  Factura #{factura.NumeroFactura} • Monto: <b>S/ {Number(factura.Total).toFixed(2)}</b>
                </span>
              ) : (
                <span>Factura #{params.id}</span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label>Titular de la tarjeta</Label>
                <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre como figura en la tarjeta" />
              </div>
              <div>
                <Label>Número de tarjeta</Label>
                <Input
                  value={number}
                  onChange={(e) => {
                    // formatear en grupos de 4 (salvo amex 4-6-5 aprox, dejamos 4 grupos para demo)
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    const spaced = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
                    setNumber(spaced)
                  }}
                  placeholder="4111 1111 1111 1111"
                  autoComplete="cc-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vencimiento (MM/AA)</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => {
                      const d = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                      const masked = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
                      setExpiry(masked)
                    }}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="12/28"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    placeholder={brand === 'amex' ? '1234' : '123'}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex gap-3 pt-2">
                <Button disabled={processing} className="bg-green-600 hover:bg-green-700" onClick={payNow}>
                  {processing ? 'Procesando…' : 'Pagar ahora'}
                </Button>
                <Button disabled={processing} variant="outline" onClick={() => history.back()}>Cancelar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  )
}
