import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api/client'
import { formatDate } from '@/lib/utils'
import type { Paginated, Usuario } from '@/types'

async function fetchUsuarios(): Promise<Paginated<Usuario>> {
  const { data } = await apiClient.get<Paginated<Usuario>>('/api/usuarios/')
  return data
}

export default function UsuariosPage(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', 'list'],
    queryFn: fetchUsuarios,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Rol</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Último login</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.results ?? []).map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="p-2 font-medium">{u.nombre}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.rol}</td>
                      <td className="p-2">
                        <Badge variant={u.activo === false ? 'destructive' : 'success'}>
                          {u.activo === false ? 'Inactivo' : 'Activo'}
                        </Badge>
                      </td>
                      <td className="p-2">{formatDate(u.ultimo_login, true)}</td>
                    </tr>
                  ))}
                  {data && data.results.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        Sin usuarios.
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
