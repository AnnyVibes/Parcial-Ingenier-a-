import { FileX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="rounded-full bg-muted p-4">
            <FileX className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Enlace no válido</h1>
          <p className="text-sm text-muted-foreground">
            Este formulario no existe o ya fue completado. Contacta al oficial de
            cumplimiento para obtener un nuevo enlace.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
