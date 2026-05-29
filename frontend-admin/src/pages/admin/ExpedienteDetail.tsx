import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, FileText, History, ListChecks, MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EstadoBadge, RiesgoBadge } from '@/components/admin/Badges'
import {
  crearObservacion,
  getExpediente,
  listDocumentos,
  listHistorial,
  listObservaciones,
  recalcularRiesgo,
} from '@/api/expedientes'
import { useAudit } from '@/hooks/useAudit'
import { extractErrorMessage } from '@/api/client'
import { cn, formatDate } from '@/lib/utils'

type TabKey = 'general' | 'riesgo' | 'documentos' | 'historial' | 'auditoria' | 'observaciones'

const TABS: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: 'general', label: 'Información General', icon: FileText },
  { key: 'riesgo', label: 'Evaluación de Riesgo', icon: Sparkles },
  { key: 'documentos', label: 'Documentos', icon: Download },
  { key: 'historial', label: 'Historial Renovaciones', icon: History },
  { key: 'auditoria', label: 'Auditoría', icon: ListChecks },
  { key: 'observaciones', label: 'Observaciones', icon: MessageSquare },
]

export default function ExpedienteDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const audit = useAudit()
  const qc = useQueryClient()
  const expedienteId = Number(id)
  const [tab, setTab] = useState<TabKey>('general')

  const expQuery = useQuery({
    queryKey: ['expediente', expedienteId],
    queryFn: () => getExpediente(expedienteId),
    enabled: !Number.isNaN(expedienteId),
  })

  useEffect(() => {
    if (!Number.isNaN(expedienteId)) {
      void audit({ accion: 'VER_EXPEDIENTE', expediente_id: expedienteId })
    }
  }, [expedienteId, audit])

  const docsQuery = useQuery({
    queryKey: ['expediente', expedienteId, 'documentos'],
    queryFn: () => listDocumentos(expedienteId),
    enabled: tab === 'documentos' && !Number.isNaN(expedienteId),
  })

  const histQuery = useQuery({
    queryKey: ['expediente', expedienteId, 'historial'],
    queryFn: () => listHistorial(expedienteId),
    enabled: tab === 'historial' && !Number.isNaN(expedienteId),
  })

  const obsQuery = useQuery({
    queryKey: ['expediente', expedienteId, 'observaciones'],
    queryFn: () => listObservaciones(expedienteId),
    enabled: tab === 'observaciones' && !Number.isNaN(expedienteId),
  })

  const recalcMut = useMutation({
    mutationFn: () => recalcularRiesgo(expedienteId),
    onSuccess: async () => {
      toast.success('Riesgo recalculado')
      await audit({ accion: 'RECALCULAR_RIESGO', expediente_id: expedienteId })
      await qc.invalidateQueries({ queryKey: ['expediente', expedienteId] })
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const [obsTexto, setObsTexto] = useState('')
  const obsMut = useMutation({
    mutationFn: () => crearObservacion(expedienteId, obsTexto),
    onSuccess: async () => {
      toast.success('Observación añadida')
      await audit({ accion: 'CREAR_OBSERVACION', expediente_id: expedienteId })
      setObsTexto('')
      await qc.invalidateQueries({ queryKey: ['expediente', expedienteId, 'observaciones'] })
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  if (Number.isNaN(expedienteId)) return <p>ID inválido</p>
  if (expQuery.isLoading) return <Skeleton className="h-64" />
  const e = expQuery.data
  if (!e) return <p>Expediente no encontrado.</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Expediente {e.codigo ?? e.id}</p>
          <h1 className="text-2xl font-semibold">{e.nombre_razon_social}</h1>
          <div className="mt-1 flex gap-2">
            <EstadoBadge value={e.estado} />
            <RiesgoBadge value={e.nivel_riesgo} />
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/expedientes/${e.id}/workflow`)}>
          Ir a Workflow
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors',
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              aria-current={tab === t.key ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'general' && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <Field label="Tipo" value={e.tipo_cliente === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'} />
            <Field label="Estado" value={<EstadoBadge value={e.estado} />} />
            <Field label="Última renovación" value={formatDate(e.ultima_renovacion)} />
            <Field label="Próxima renovación" value={formatDate(e.proxima_renovacion)} />
            <Field label="Creado" value={formatDate(e.creado_en, true)} />
            <Field label="Creado por (id)" value={String(e.creado_por ?? '-')} />
          </CardContent>
        </Card>
      )}

      {tab === 'riesgo' && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluación de Riesgo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-3xl font-bold">{e.score_riesgo ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nivel</p>
                <RiesgoBadge value={e.nivel_riesgo} />
              </div>
              <Button
                variant="outline"
                onClick={() => recalcMut.mutate()}
                disabled={recalcMut.isPending}
              >
                {recalcMut.isPending ? 'Recalculando...' : 'Recalcular'}
              </Button>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Factores de riesgo</p>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {(e.factores_riesgo ?? []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
                {(!e.factores_riesgo || e.factores_riesgo.length === 0) && (
                  <li>No se han registrado factores específicos.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'documentos' && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            {docsQuery.isLoading && <Skeleton className="h-20" />}
            {docsQuery.data?.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{d.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.tipo} · {(d.tamano / 1024).toFixed(1)} KB · {formatDate(d.fecha_subida)}
                  </p>
                </div>
                <a
                  href={d.url_descarga}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={() => audit({ accion: 'DESCARGAR_DOCUMENTO', expediente_id: e.id, detalles: { doc_id: d.id } })}
                >
                  <Download className="h-4 w-4" /> Descargar
                </a>
              </div>
            ))}
            {docsQuery.data && docsQuery.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin documentos.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'historial' && (
        <Card>
          <CardContent className="pt-6">
            {histQuery.isLoading && <Skeleton className="h-20" />}
            <ol className="space-y-3 border-l pl-4">
              {histQuery.data?.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-sm font-medium">
                    {h.usuario} · <EstadoBadge value={h.estado} />
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.fecha, true)}</p>
                  {h.notas && <p className="mt-1 text-sm">{h.notas}</p>}
                </li>
              ))}
              {histQuery.data && histQuery.data.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin historial.</p>
              )}
            </ol>
          </CardContent>
        </Card>
      )}

      {tab === 'auditoria' && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Ver registro completo en la sección{' '}
              <Link to="/admin/auditoria" className="text-primary hover:underline">
                Auditoría
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {tab === 'observaciones' && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe una observación..."
                value={obsTexto}
                onChange={(ev) => setObsTexto(ev.target.value)}
                rows={3}
              />
              <Button
                onClick={() => obsMut.mutate()}
                disabled={obsMut.isPending || obsTexto.trim().length < 2}
              >
                {obsMut.isPending ? 'Guardando...' : 'Añadir observación'}
              </Button>
            </div>
            <div className="space-y-2">
              {obsQuery.data?.map((o) => (
                <div key={o.id} className="rounded-md border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {o.autor} · {formatDate(o.fecha, true)}
                  </p>
                  <p className="mt-1">{o.texto}</p>
                </div>
              ))}
              {obsQuery.data && obsQuery.data.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin observaciones.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }): JSX.Element {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
