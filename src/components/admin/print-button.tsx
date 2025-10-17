'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface PrintButtonProps {
  label?: string
}

export default function PrintButton({ label = 'Descargar / Imprimir PDF' }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        try { window.print() } catch {}
      }}
      title="Imprimir o guardar como PDF"
    >
      <FileText className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}
