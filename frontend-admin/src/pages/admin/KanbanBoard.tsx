import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertCircle, GripVertical, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EstadoBadge, RiesgoBadge } from '@/components/admin/Badges'
import { cambiarEstadoExpediente, listExpedientes } from '@/api/expedientes'
import { extractErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useAudit } from '@/hooks/useAudit'
import { cn } from '@/lib/utils'
import type { EstadoExpediente, Expediente } from '@/types'

const COLUMNS: EstadoExpediente[] = ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO']

const COL_META: Record<
  string,
  { label: string; border: string; header: string }
> = {
  PENDIENTE:   { label: 'Pendiente',   border: 'border-amber-400',  header: 'bg-amber-50 dark:bg-amber-950/30' },
  EN_REVISION: { label: 'En Revisión', border: 'border-blue-400',   header: 'bg-blue-50 dark:bg-blue-950/30' },
  APROBADO:    { label: 'Aprobado',    border: 'border-green-500',  header: 'bg-green-50 dark:bg-green-950/30' },
  RECHAZADO:   { label: 'Rechazado',   border: 'border-red-500',    header: 'bg-red-50 dark:bg-red-950/30' },
}

interface PendingMove {
  exp: Expediente
  to: EstadoExpediente
}

export default function KanbanBoardPage(): JSX.Element {
  const qc = useQueryClient()
  const { hasRole, user } = useAuth()
  const audit = useAudit()
  const canModify = hasRole(['OFICIAL_CUMPLIMIENTO', 'ADMINISTRADOR'])

  const [dragOver, setDragOver] = useState<EstadoExpediente | null>(null)
  const [pending, setPending] = useState<PendingMove | null>(null)
  const [observacion, setObservacion] = useState('')

  const dragRef = useRef<Expediente | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['expedientes', 'kanban'],
    queryFn: () => listExpedientes({ page_size: 200 }),
  })

  const moveMut = useMutation({
    mutationFn: (p: { id: number; estado: EstadoExpediente; observacion?: string }) =>
      cambiarEstadoExpediente(p.id, { estado: p.estado, observacion: p.observacion }),
    onSuccess: async (_d, vars) => {
      toast.success(`Expediente movido a "${COL_META[vars.estado].label}"`)
      await audit({
        accion: 'CAMBIO_ESTADO',
        expediente_id: vars.id,
        estado_anterior: pending?.exp.estado,
        estado_nuevo: vars.estado,
        observacion: vars.observacion,
      })
      closePending()
      await qc.invalidateQueries({ queryKey: ['expedientes', 'kanban'] })
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  function closePending(): void {
    setPending(null)
    setObservacion('')
  }

  function onDragStart(e: React.DragEvent, exp: Expediente): void {
    dragRef.current = exp
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, col: EstadoExpediente): void {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(col)
  }

  function onDrop(e: React.DragEvent, col: EstadoExpediente): void {
    e.preventDefault()
    setDragOver(null)
    const exp = dragRef.current
    dragRef.current = null
    if (!exp || exp.estado === col) return
    if (!canModify) {
      toast.error('Tu rol no permite cambiar estados desde el tablero.')
      return
    }
    if ((col === 'APROBADO' || col === 'RECHAZADO') && exp.creado_por === user?.id) {
      toast.error('No podés aprobar/rechazar un expediente que vos mismo creaste.')
      return
    }
    setPending({ exp, to: col })
  }

  function confirmMove(): void {
    if (!pending) return
    if (pending.to === 'RECHAZADO' && observacion.trim().length < 3) {
      toast.error('El motivo del rechazo es obligatorio.')
      return
    }
    moveMut.mutate({
      id: pending.exp.id,
      estado: pending.to,
      observacion: observacion.trim() || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {COLUMNS.map((c) => <Skeleton key={c} className="h-64" />)}
        </div>
      </div>
    )
  }

  const all = data?.results ?? []
  const grouped = Object.fromEntries(
    COLUMNS.map((col) => [col, all.filter((e) => e.estado === col)]),
  ) as Record<EstadoExpediente, Expediente[]>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tablero Kanban</h1>
        {!canModify && (
          <span className="text-sm text-muted-foreground">
            Solo lectura — tu rol no permite mover expedientes
          </span>
        )}
      </div>

      <div className="grid min-h-[600px] grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const meta = COL_META[col]
          const cards = grouped[col]
          const isOver = dragOver === col
          return (
            <div
              key={col}
              className={cn(
                'flex flex-col rounded-lg border-2 transition-all',
                meta.border,
                isOver && 'ring-2 ring-primary ring-offset-2 scale-[1.01]',
              )}
              onDragOver={(e) => onDragOver(e, col)}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onDrop(e, col)}
            >
              <div className={cn('flex items-center justify-between rounded-t-md px-3 py-2', meta.header)}>
                <span className="text-sm font-semibold">{meta.label}</span>
                <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                {cards.length === 0 && (
                  <p className="mt-6 text-center text-xs text-muted-foreground">Sin expedientes</p>
                )}
                {cards.map((exp) => (
                  <div
                    key={exp.id}
                    draggable={canModify}
                    onDragStart={(e) => onDragStart(e, exp)}
                    className={cn(
                      'rounded-md border bg-card p-3 shadow-sm transition-shadow',
                      canModify && 'cursor-grab hover:shadow-md active:cursor-grabbing',
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-snug">
                          {exp.nombre_razon_social}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {exp.codigo ?? `#${exp.id}`}
                        </p>
                      </div>
                      {canModify && (
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <RiesgoBadge value={exp.nivel_riesgo} />
                      <Badge variant="outline" className="text-[10px]">
                        {exp.tipo_cliente === 'NATURAL' ? 'Natural' : 'Jurídica'}
                      </Badge>
                    </div>

                    <Link
                      to={`/admin/expedientes/${exp.id}`}
                      className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User className="h-3 w-3" />
                      Ver detalle
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!pending}
        onOpenChange={(v) => !v && closePending()}
        title={pending ? `Mover a "${COL_META[pending.to].label}"` : ''}
        description={
          pending
            ? `${pending.exp.nombre_razon_social} · ${COL_META[pending.exp.estado as string].label} → ${COL_META[pending.to].label}. La acción queda registrada en auditoría.`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={closePending} disabled={moveMut.isPending}>
              Cancelar
            </Button>
            <Button onClick={confirmMove} disabled={moveMut.isPending}>
              Confirmar
            </Button>
          </>
        }
      >
        {pending && (
          <div className="space-y-2">
            {pending.to === 'RECHAZADO' && (
              <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>El motivo del rechazo es obligatorio.</p>
              </div>
            )}
            <Label required={pending.to === 'RECHAZADO'}>
              {pending.to === 'RECHAZADO' ? 'Motivo del rechazo' : 'Observación (opcional)'}
            </Label>
            <Textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder={
                pending.to === 'RECHAZADO'
                  ? 'Indicá el motivo del rechazo...'
                  : 'Comentario opcional...'
              }
            />
          </div>
        )}
      </Dialog>
    </div>
  )
}
