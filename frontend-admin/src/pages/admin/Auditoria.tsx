import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, CalendarClock, Users, TrendingUp, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { getAuditStats, getAuditLogs, type AuditFiltros } from '@/api/audit'
import { formatDate } from '@/lib/utils'
import type { Paginated, Usuario } from '@/types'

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'creacion', label: 'Creación' },
  { value: 'actualizacion', label: 'Actualización' },
  { value: 'eliminacion', label: 'Eliminación' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'login', label: 'Inicio de sesión' },
  { value: 'logout', label: 'Cierre de sesión' },
]

const BAR_COLORS = ['#3b82f6', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

function Kpi({ icon: Icon, label, value, tint }: {
  icon: typeof Activity; label: string; value: string | number; tint: string
}): JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`rounded-lg p-3 ${tint}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const selectCls =
  'h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

export default function AuditoriaPage(): JSX.Element {
  const [filtros, setFiltros] = useState<AuditFiltros>({})
  const set = (k: keyof AuditFiltros, v: string) =>
    setFiltros((f) => ({ ...f, [k]: v || undefined }))

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['auditoria', 'stats', filtros],
    queryFn: () => getAuditStats(filtros),
  })
  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['auditoria', 'logs', filtros],
    queryFn: () => getAuditLogs(filtros),
  })
  const { data: usuarios } = useQuery({
    queryKey: ['usuarios', 'all'],
    queryFn: async () => (await apiClient.get<Paginated<Usuario>>('/api/usuarios/')).data,
  })

  const hayFiltros = useMemo(() => Object.values(filtros).some(Boolean), [filtros])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Auditoría</h1>
          <p className="text-sm text-muted-foreground">
            Métricas y trazabilidad de toda la actividad del sistema
          </p>
        </div>
        {hayFiltros && (
          <Button variant="outline" size="sm" onClick={() => setFiltros({})}>
            <RotateCcw className="h-4 w-4" /> Limpiar filtros
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingStats || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Kpi icon={Activity} label="Eventos totales" value={stats.total_eventos}
                 tint="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
            <Kpi icon={CalendarClock} label="Eventos hoy" value={stats.eventos_hoy}
                 tint="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
            <Kpi icon={Users} label="Usuarios activos" value={stats.usuarios_activos}
                 tint="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
            <Kpi icon={TrendingUp} label="Acción más común" value={stats.accion_mas_comun}
                 tint="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
          </>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 py-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Usuario</label>
            <select className={selectCls} value={filtros.usuario ?? ''} onChange={(e) => set('usuario', e.target.value)}>
              <option value="">Todos</option>
              {usuarios?.results.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Acción</label>
            <select className={selectCls} value={filtros.accion ?? ''} onChange={(e) => set('accion', e.target.value)}>
              {ACCIONES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Desde</label>
            <input type="date" className={selectCls} value={filtros.desde ?? ''} onChange={(e) => set('desde', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <input type="date" className={selectCls} value={filtros.hasta ?? ''} onChange={(e) => set('hasta', e.target.value)} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-muted-foreground">Buscar</label>
            <input type="text" placeholder="usuario o módulo..." className={selectCls}
                   value={filtros.search ?? ''} onChange={(e) => set('search', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Gráficas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Actividad (últimos 14 días)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {loadingStats || !stats ? <Skeleton className="h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.por_dia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6 }} />
                    <Bar dataKey="count" name="Eventos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Eventos por tipo de acción</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {loadingStats || !stats ? <Skeleton className="h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.por_accion} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <YAxis type="category" dataKey="accion" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6 }} />
                    <Bar dataKey="count" name="Eventos" radius={[0, 4, 4, 0]}>
                      {stats.por_accion.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Registro de eventos {logs ? `(${logs.count})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLogs ? <Skeleton className="h-40" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Usuario</th>
                    <th className="p-2">Acción</th>
                    <th className="p-2">Módulo</th>
                    <th className="p-2">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs?.results ?? []).map((l) => (
                    <tr key={l.id} className="border-b hover:bg-muted/40">
                      <td className="whitespace-nowrap p-2">{formatDate(l.fecha, true)}</td>
                      <td className="p-2">{l.usuario}</td>
                      <td className="p-2">
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {l.categoria ?? l.accion}
                        </span>
                      </td>
                      <td className="p-2 text-muted-foreground">{l.modelo ?? '-'}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{l.ip ?? '-'}</td>
                    </tr>
                  ))}
                  {logs && logs.results.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        Sin eventos para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
