import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cambiarEstadoExpediente, getExpediente } from '@/api/expedientes'
import { useAuth } from '@/contexts/AuthContext'
import { useAudit } from '@/hooks/useAudit'
import { extractErrorMessage } from '@/api/client'
import type { EstadoExpediente } from '@/types'
import { cn } from '@/lib/utils'

const STEPS: EstadoExpediente[] = ['FORMULARIO_PUBLICO', 'PENDIENTE', 'EN_REVISION', 'APROBADO']
const STEP_LABELS: Record<EstadoExpediente, string> = {
  FORMULARIO_PUBLICO: 'Formulario público',
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

type ModalKind = null | 'iniciar' | 'aprobar' | 'rechazar' | 'info_adicional'

export default function WorkflowPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const audit = useAudit()
  const qc = useQueryClient()
  const { user, hasRole } = useAuth()
  const expedienteId = Number(id)

  const [modal, setModal] = useState<ModalKind>(null)
  const [observacion, setObservacion] = useState('')

  const { data: e, isLoading } = useQuery({
    queryKey: ['expediente', expedienteId],
    queryFn: () => getExpediente(expedienteId),
    enabled: !Number.isNaN(expedienteId),
  })

  const cambiarEstadoMut = useMutation({
    mutationFn: (payload: { estado: EstadoExpediente; observacion?: string }) =>
      cambiarEstadoExpediente(expedienteId, payload),
    onSuccess: async (_data, vars) => {
      toast.success(`Estado actualizado a ${STEP_LABELS[vars.estado]}`)
      await audit({
        accion: 'CAMBIO_ESTADO',
        expediente_id: expedienteId,
        estado_anterior: e?.estado,
        estado_nuevo: vars.estado,
        observacion: vars.observacion,
      })
      setModal(null)
      setObservacion('')
      await qc.invalidateQueries({ queryKey: ['expediente', expedienteId] })
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  if (Number.isNaN(expedienteId)) return <p>ID inválido</p>
  if (isLoading) return <Skeleton className="h-64" />
  if (!e) return <p>Expediente no encontrado.</p>

  const esCreador = !!user && !!e.creado_por && e.creado_por === user.id
  const puedeAprobar = hasRole(['OFICIAL_CUMPLIMIENTO', 'ADMINISTRADOR'])
  const currentStepIdx = STEPS.indexOf(e.estado as EstadoExpediente)

  function tryAction(kind: NonNullable<ModalKind>): void {
    if ((kind === 'aprobar' || kind === 'rechazar') && esCreador) {
      toast.error('No puedes aprobar un expediente que tú mismo creaste.')
      return
    }
    setModal(kind)
  }

  function handleConfirm(estado: EstadoExpediente, requireObs: boolean): void {
    if (requireObs && observacion.trim().length < 3) {
      toast.error('La observación es obligatoria')
      return
    }
    cambiarEstadoMut.mutate({ estado, observacion: observacion.trim() || undefined })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Workflow del expediente {e.codigo ?? e.id}</p>
          <h1 className="text-2xl font-semibold">{e.nombre_razon_social}</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(`/admin/expedientes/${e.id}`)}>
          Volver al detalle
        </Button>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
            {STEPS.map((s, idx) => {
              const isCurrent = idx === currentStepIdx
              const isPast = idx < currentStepIdx
              return (
                <li key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2',
                      isPast
                        ? 'border-green-600 bg-green-600 text-white'
                        : isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-muted text-muted-foreground',
                    )}
                  >
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', isCurrent && 'text-primary')}>
                      {STEP_LABELS[s]}
                    </p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {esCreador && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>
                Tú creaste este expediente. Por separación de funciones,{' '}
                <strong>no puedes aprobarlo</strong>.
              </p>
            </div>
          )}
          {e.estado === 'PENDIENTE' && puedeAprobar && (
            <Button onClick={() => tryAction('iniciar')}>Iniciar Revisión</Button>
          )}
          {e.estado === 'EN_REVISION' && puedeAprobar && (
            <div className="flex flex-wrap gap-2">
              <Button variant="success" onClick={() => tryAction('aprobar')}>
                Aprobar
              </Button>
              <Button variant="destructive" onClick={() => tryAction('rechazar')}>
                Rechazar
              </Button>
              <Button variant="outline" onClick={() => tryAction('info_adicional')}>
                Solicitar info adicional
              </Button>
            </div>
          )}
          {e.estado === 'APROBADO' && (
            <div className="flex items-start gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/20 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>
                Este expediente está <strong>aprobado</strong>. El flujo de revisión está
                completo — no hay acciones pendientes.
              </p>
            </div>
          )}
          {e.estado === 'RECHAZADO' && (
            <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-900/20 dark:text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>
                Este expediente fue <strong>rechazado</strong>. Volvé al detalle para revisar
                el motivo o reabrirlo desde Pendiente.
              </p>
            </div>
          )}
          {!puedeAprobar && e.estado !== 'APROBADO' && e.estado !== 'RECHAZADO' && (
            <p className="text-sm text-muted-foreground">
              Tu rol ({user?.rol}) no permite ejecutar acciones de workflow en este estado.
            </p>
          )}
          {puedeAprobar &&
            e.estado !== 'PENDIENTE' &&
            e.estado !== 'EN_REVISION' &&
            e.estado !== 'APROBADO' &&
            e.estado !== 'RECHAZADO' && (
              <p className="text-sm text-muted-foreground">
                No hay acciones disponibles para el estado actual.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Modales */}
      <Dialog
        open={modal === 'iniciar'}
        onOpenChange={(v) => !v && setModal(null)}
        title="Iniciar revisión"
        description="Cambia el estado a EN_REVISION."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)} disabled={cambiarEstadoMut.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleConfirm('EN_REVISION', false)}
              disabled={cambiarEstadoMut.isPending}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label>Observación inicial (opcional)</Label>
          <Textarea
            rows={3}
            value={observacion}
            onChange={(e2) => setObservacion(e2.target.value)}
          />
        </div>
      </Dialog>

      <Dialog
        open={modal === 'aprobar'}
        onOpenChange={(v) => !v && setModal(null)}
        title="Aprobar expediente"
        description="¿Confirmas la aprobación? Esta acción quedará registrada en auditoría."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)} disabled={cambiarEstadoMut.isPending}>
              Cancelar
            </Button>
            <Button variant="success" onClick={() => handleConfirm('APROBADO', false)} disabled={cambiarEstadoMut.isPending}>
              Aprobar
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label>Observación (opcional)</Label>
          <Textarea rows={3} value={observacion} onChange={(e2) => setObservacion(e2.target.value)} />
        </div>
      </Dialog>

      <Dialog
        open={modal === 'rechazar'}
        onOpenChange={(v) => !v && setModal(null)}
        title="Rechazar expediente"
        description="Indica el motivo del rechazo (obligatorio)."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)} disabled={cambiarEstadoMut.isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => handleConfirm('RECHAZADO', true)} disabled={cambiarEstadoMut.isPending}>
              Rechazar
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label required>Motivo</Label>
          <Textarea rows={4} value={observacion} onChange={(e2) => setObservacion(e2.target.value)} />
        </div>
      </Dialog>

      <Dialog
        open={modal === 'info_adicional'}
        onOpenChange={(v) => !v && setModal(null)}
        title="Solicitar información adicional"
        description="El expediente vuelve a PENDIENTE con la solicitud registrada."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)} disabled={cambiarEstadoMut.isPending}>
              Cancelar
            </Button>
            <Button onClick={() => handleConfirm('PENDIENTE', true)} disabled={cambiarEstadoMut.isPending}>
              Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label required>Información solicitada</Label>
          <Textarea rows={4} value={observacion} onChange={(e2) => setObservacion(e2.target.value)} />
        </div>
      </Dialog>
    </div>
  )
}
