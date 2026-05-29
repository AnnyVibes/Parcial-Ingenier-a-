import { useState } from 'react'
import { ChevronDown, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoCred {
  email: string
  password: string
  rol: string
  mfa?: string
}

const CREDENTIALS: DemoCred[] = [
  { email: 'admin@dda.test', password: 'admin123', rol: 'ADMINISTRADOR' },
  {
    email: 'oficial@dda.test',
    password: 'oficial123',
    rol: 'OFICIAL_CUMPLIMIENTO',
    mfa: '123456',
  },
  { email: 'colaborador@dda.test', password: 'colab123', rol: 'COLABORADOR' },
  { email: 'auditor@dda.test', password: 'auditor123', rol: 'AUDITOR' },
]

export function DemoCredentials(): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 rounded-md border border-dashed bg-muted/30 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md p-3 text-left text-muted-foreground hover:bg-muted/60"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-medium">
          <KeyRound className="h-4 w-4" />
          Credenciales de demostración
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="space-y-2 px-3 pb-3">
          <p className="text-xs text-muted-foreground">
            El sistema corre en modo demo (sin backend real). Usa cualquiera de estas cuentas:
          </p>
          <ul className="space-y-2">
            {CREDENTIALS.map((c) => (
              <li key={c.email} className="rounded-md border bg-background p-2 text-xs">
                <p className="font-semibold">{c.rol}</p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <code className="font-mono">{c.email}</code>
                </p>
                <p>
                  <span className="text-muted-foreground">Contraseña:</span>{' '}
                  <code className="font-mono">{c.password}</code>
                </p>
                {c.mfa && (
                  <p>
                    <span className="text-muted-foreground">Código MFA:</span>{' '}
                    <code className="font-mono">{c.mfa}</code>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
