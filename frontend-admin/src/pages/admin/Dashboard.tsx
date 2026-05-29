import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Folder, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { getDashboardStats } from '@/api/dashboard'
import { cn, formatRelativeTime, getInitials } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: typeof Folder
  colorClass: string
}

function StatsCard({ title, value, icon: Icon, colorClass }: StatsCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', colorClass)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Sin datos disponibles.</p>
  }

  const totalRiesgo = data.distribucion_riesgo.bajo + data.distribucion_riesgo.medio + data.distribucion_riesgo.alto
  const pctBajo = totalRiesgo ? (data.distribucion_riesgo.bajo / totalRiesgo) * 100 : 0
  const pctMedio = totalRiesgo ? (data.distribucion_riesgo.medio / totalRiesgo) * 100 : 0
  const pctAlto = totalRiesgo ? (data.distribucion_riesgo.alto / totalRiesgo) * 100 : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Expedientes"
          value={data.total_expedientes}
          icon={Folder}
          colorClass="bg-blue-600"
        />
        <StatsCard
          title="Pendientes Renovación"
          value={data.pendientes_renovacion}
          icon={Clock}
          colorClass="bg-yellow-500"
        />
        <StatsCard
          title="Aprobados"
          value={data.aprobados}
          icon={CheckCircle2}
          colorClass="bg-green-600"
        />
        <StatsCard
          title="Alto Riesgo"
          value={data.alto_riesgo}
          icon={AlertTriangle}
          colorClass="bg-red-600"
        />
      </div>

      {/* Actividad + Riesgo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.actividad_reciente.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Avatar initials={getInitials(a.usuario)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.usuario}</p>
                  <p className="truncate text-sm text-muted-foreground">{a.accion}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(a.fecha)}</p>
                </div>
              </div>
            ))}
            {data.actividad_reciente.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-6 w-full overflow-hidden rounded-md">
              <div
                className="bg-risk-low transition-all"
                style={{ width: `${pctBajo}%` }}
                title={`Bajo: ${pctBajo.toFixed(1)}%`}
              />
              <div
                className="bg-risk-medium transition-all"
                style={{ width: `${pctMedio}%` }}
                title={`Medio: ${pctMedio.toFixed(1)}%`}
              />
              <div
                className="bg-risk-high transition-all"
                style={{ width: `${pctAlto}%` }}
                title={`Alto: ${pctAlto.toFixed(1)}%`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="inline-block h-3 w-3 rounded-sm bg-risk-low" /> Bajo
                <p className="text-xs text-muted-foreground">
                  {data.distribucion_riesgo.bajo} ({pctBajo.toFixed(1)}%)
                </p>
              </div>
              <div>
                <span className="inline-block h-3 w-3 rounded-sm bg-risk-medium" /> Medio
                <p className="text-xs text-muted-foreground">
                  {data.distribucion_riesgo.medio} ({pctMedio.toFixed(1)}%)
                </p>
              </div>
              <div>
                <span className="inline-block h-3 w-3 rounded-sm bg-risk-high" /> Alto
                <p className="text-xs text-muted-foreground">
                  {data.distribucion_riesgo.alto} ({pctAlto.toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.estadisticas_mensuales.slice(-6)}>
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
                <Bar dataKey="creados" name="Creados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aprobados" name="Aprobados" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
