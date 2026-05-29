import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, BellRing, FileWarning } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getDashboardStats, listAlertas } from '@/api/dashboard'
import type { TipoAlerta } from '@/types'

interface AlertaCardProps {
  tipo: TipoAlerta
  title: string
  count: number
  colorClass: string
  marker: string
  selected: boolean
  onClick: () => void
}

function AlertaCard({ tipo: _tipo, title, count, colorClass, marker, selected, onClick }: AlertaCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border p-4 text-left transition-shadow hover:shadow-md',
        selected && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-xl">{marker}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">Click para ver expedientes</p>
        </div>
      </div>
      <div className={cn('rounded-md px-3 py-1 text-lg font-bold text-white', colorClass)}>{count}</div>
    </button>
  )
}

export default function ReportesPage(): JSX.Element {
  const [selectedTipo, setSelectedTipo] = useState<TipoAlerta | null>(null)

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000,
  })

  const alertasAll = useQuery({
    queryKey: ['alertas', 'all'],
    queryFn: () => listAlertas(),
  })

  const alertasFiltradas = useQuery({
    queryKey: ['alertas', 'filtered', selectedTipo],
    queryFn: () => listAlertas(selectedTipo ?? undefined),
    enabled: !!selectedTipo,
  })

  const counts = useMemo(() => {
    const c = { RENOVACION: 0, ALTO_RIESGO: 0, DOC_PENDIENTE: 0 }
    for (const a of alertasAll.data ?? []) {
      if (a.tipo in c) c[a.tipo] += 1
    }
    return c
  }, [alertasAll.data])

  const stats = statsQuery.data
  const totalRiesgo = stats
    ? stats.distribucion_riesgo.bajo + stats.distribucion_riesgo.medio + stats.distribucion_riesgo.alto
    : 0
  const pctBajo = stats && totalRiesgo ? (stats.distribucion_riesgo.bajo / totalRiesgo) * 100 : 0
  const pctMedio = stats && totalRiesgo ? (stats.distribucion_riesgo.medio / totalRiesgo) * 100 : 0
  const pctAlto = stats && totalRiesgo ? (stats.distribucion_riesgo.alto / totalRiesgo) * 100 : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reportes y Alertas</h1>

      {/* Tarjetas de alertas */}
      <div className="grid gap-4 md:grid-cols-3">
        <AlertaCard
          tipo="RENOVACION"
          title="Renovación próxima (≤30 días)"
          count={counts.RENOVACION}
          colorClass="bg-yellow-500"
          marker="🟡"
          selected={selectedTipo === 'RENOVACION'}
          onClick={() => setSelectedTipo((s) => (s === 'RENOVACION' ? null : 'RENOVACION'))}
        />
        <AlertaCard
          tipo="ALTO_RIESGO"
          title="Alto riesgo"
          count={counts.ALTO_RIESGO}
          colorClass="bg-red-600"
          marker="🔴"
          selected={selectedTipo === 'ALTO_RIESGO'}
          onClick={() => setSelectedTipo((s) => (s === 'ALTO_RIESGO' ? null : 'ALTO_RIESGO'))}
        />
        <AlertaCard
          tipo="DOC_PENDIENTE"
          title="Documentos pendientes"
          count={counts.DOC_PENDIENTE}
          colorClass="bg-orange-500"
          marker="🟠"
          selected={selectedTipo === 'DOC_PENDIENTE'}
          onClick={() => setSelectedTipo((s) => (s === 'DOC_PENDIENTE' ? null : 'DOC_PENDIENTE'))}
        />
      </div>

      {selectedTipo && (
        <Card>
          <CardHeader>
            <CardTitle>
              Expedientes con alerta:{' '}
              {selectedTipo === 'RENOVACION'
                ? 'Renovación próxima'
                : selectedTipo === 'ALTO_RIESGO'
                ? 'Alto riesgo'
                : 'Documentos pendientes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertasFiltradas.isLoading && <Skeleton className="h-20" />}
            {alertasFiltradas.data?.map((a) => (
              <Link
                key={a.id}
                to={`/admin/expedientes/${a.expediente_id}`}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  {selectedTipo === 'RENOVACION' && <BellRing className="h-4 w-4 text-yellow-500" />}
                  {selectedTipo === 'ALTO_RIESGO' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {selectedTipo === 'DOC_PENDIENTE' && <FileWarning className="h-4 w-4 text-orange-500" />}
                  <div>
                    <p className="text-sm font-medium">{a.expediente_nombre}</p>
                    <p className="text-xs text-muted-foreground">{a.mensaje}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{a.prioridad}</span>
              </Link>
            ))}
            {alertasFiltradas.data && alertasFiltradas.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin expedientes en esta categoría.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribución de riesgo */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Riesgo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statsQuery.isLoading || !stats ? (
            <Skeleton className="h-12" />
          ) : (
            <>
              <div className="flex h-8 w-full overflow-hidden rounded-md">
                <div className="bg-risk-low" style={{ width: `${pctBajo}%` }} />
                <div className="bg-risk-medium" style={{ width: `${pctMedio}%` }} />
                <div className="bg-risk-high" style={{ width: `${pctAlto}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <p>Bajo: <strong>{pctBajo.toFixed(1)}%</strong> ({stats.distribucion_riesgo.bajo})</p>
                <p>Medio: <strong>{pctMedio.toFixed(1)}%</strong> ({stats.distribucion_riesgo.medio})</p>
                <p>Alto: <strong>{pctAlto.toFixed(1)}%</strong> ({stats.distribucion_riesgo.alto})</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          {statsQuery.isLoading || !stats ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.estadisticas_mensuales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 6,
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="creados" name="Creados" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="aprobados" name="Aprobados" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-muted-foreground">
                    <tr>
                      <th className="p-2">Mes</th>
                      <th className="p-2">Creados</th>
                      <th className="p-2">Aprobados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.estadisticas_mensuales.map((m) => (
                      <tr key={m.mes} className="border-b">
                        <td className="p-2 font-medium">{m.mes}</td>
                        <td className="p-2">{m.creados}</td>
                        <td className="p-2">{m.aprobados}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumen Cumplimiento */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">% expedientes completos</p>
              <p className="text-2xl font-bold">
                {stats.total_expedientes
                  ? ((stats.aprobados / stats.total_expedientes) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendientes renovación</p>
              <p className="text-2xl font-bold">{stats.pendientes_renovacion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alto riesgo</p>
              <p className="text-2xl font-bold text-red-600">{stats.alto_riesgo}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total expedientes</p>
              <p className="text-2xl font-bold">{stats.total_expedientes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
