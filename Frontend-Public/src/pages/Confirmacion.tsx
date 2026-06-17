import { Printer } from 'lucide-react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LocationState {
  expediente_numero?: string
}

export default function ConfirmacionPage(): JSX.Element {
  const location = useLocation()
  const [search] = useSearchParams()
  const state = (location.state ?? {}) as LocationState
  const expediente = state.expediente_numero ?? search.get('expediente') ?? '—'

  function handlePrint(): void {
    window.print()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="kyc-pop rounded-full bg-green-100 p-4">
            <svg className="kyc-check h-12 w-12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="11" stroke="#16a34a" strokeWidth="1.5" opacity="0.3" />
              <path d="M7 12.5l3.2 3.2L17 9" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="kyc-fade-up text-3xl font-semibold tracking-tight" style={{ animationDelay: '0.3s' }}>
            ¡Formulario enviado!
          </h1>
          <div className="kyc-fade-up space-y-1" style={{ animationDelay: '0.45s' }}>
            <p className="text-sm text-muted-foreground">Tu número de expediente es</p>
            <p className="text-3xl font-bold tracking-wider text-primary">{expediente}</p>
          </div>
          <p className="kyc-fade-up max-w-sm text-sm text-muted-foreground" style={{ animationDelay: '0.6s' }}>
            Recibirás un correo de confirmación. Guarda este número para futuras
            referencias con el oficial de cumplimiento.
          </p>
          <Button type="button" variant="outline" onClick={handlePrint} className="kyc-fade-up mt-2" style={{ animationDelay: '0.75s' }}>
            <Printer className="h-4 w-4" /> Imprimir comprobante
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
