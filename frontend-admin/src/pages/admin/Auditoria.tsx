import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/api/client'
import { formatDate } from '@/lib/utils'
import type { AuditLog, Paginated } from '@/types'

async function fetchAuditLogs(): Promise<Paginated<AuditLog>> {
  const { data } = await apiClient.get<Paginated<AuditLog>>('/api/auditoria/logs/')
  return data
}

export default function AuditoriaPage(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ['auditoria', 'logs'],
    queryFn: fetchAuditLogs,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Auditoría</h1>
      <Card>
        <CardHeader>
          <CardTitle>Últimos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Usuario</th>
                    <th className="p-2">Acción</th>
                    <th className="p-2">Expediente</th>
                    <th className="p-2">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.results ?? []).map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="p-2 whitespace-nowrap">{formatDate(l.fecha, true)}</td>
                      <td className="p-2">{l.usuario}</td>
                      <td className="p-2 font-medium">{l.accion}</td>
                      <td className="p-2">{l.expediente_id ?? '-'}</td>
                      <td className="p-2 text-xs text-muted-foreground">
                        <code>{l.detalles ? JSON.stringify(l.detalles) : '-'}</code>
                      </td>
                    </tr>
                  ))}
                  {data && data.results.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        Sin registros.
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
