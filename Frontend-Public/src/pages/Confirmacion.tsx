import { CheckCircle2, Printer } from 'lucide-react'
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
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">¡Formulario enviado!</h1>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tu número de expediente es</p>
            <p className="text-3xl font-bold tracking-wider text-primary">{expediente}</p>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Recibirás un correo de confirmación. Guarda este número para futuras
            referencias con el oficial de cumplimiento.
          </p>
          <Button type="button" variant="outline" onClick={handlePrint} className="mt-2">
            <Printer className="h-4 w-4" /> Imprimir comprobante
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
