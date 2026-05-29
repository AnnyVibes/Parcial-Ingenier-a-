import { Badge } from '@/components/ui/badge'
import type { EstadoExpediente, NivelRiesgo } from '@/types'

const ESTADO_VARIANT: Record<EstadoExpediente, 'default' | 'secondary' | 'warning' | 'success' | 'destructive' | 'info'> = {
  FORMULARIO_PUBLICO: 'secondary',
  PENDIENTE: 'warning',
  EN_REVISION: 'info',
  APROBADO: 'success',
  RECHAZADO: 'destructive',
}

const ESTADO_LABEL: Record<EstadoExpediente, string> = {
  FORMULARIO_PUBLICO: 'Formulario público',
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

export function EstadoBadge({ value }: { value: EstadoExpediente }): JSX.Element {
  return <Badge variant={ESTADO_VARIANT[value]}>{ESTADO_LABEL[value]}</Badge>
}

const RIESGO_CLASS: Record<NivelRiesgo, string> = {
  BAJO: 'bg-risk-low text-white border-transparent',
  MEDIO: 'bg-risk-medium text-white border-transparent',
  ALTO: 'bg-risk-high text-white border-transparent',
}

export function RiesgoBadge({ value }: { value: NivelRiesgo }): JSX.Element {
  return <Badge className={RIESGO_CLASS[value]}>{value}</Badge>
}
