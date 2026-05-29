import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Key, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoBadge, RiesgoBadge } from '@/components/admin/Badges'
import { generarAccesoUsuario, listExpedientes } from '@/api/expedientes'
import { useAudit } from '@/hooks/useAudit'
import { extractErrorMessage } from '@/api/client'
import { formatDate } from '@/lib/utils'
import type { EstadoExpediente, NivelRiesgo } from '@/types'

const PAGE_SIZE = 20

export default function ExpedientesListPage(): JSX.Element {
  const navigate = useNavigate()
  const audit = useAudit()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoExpediente | ''>('')
  const [riesgo, setRiesgo] = useState<NivelRiesgo | ''>('')
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['expedientes', { search, estado, riesgo, page }],
    queryFn: () =>
      listExpedientes({
        search: search || undefined,
        estado: estado || undefined,
        riesgo: riesgo || undefined,
        page,
        page_size: PAGE_SIZE,
      }),
  })

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1),
    [data],
  )

  async function handleGenerarAcceso(id: number): Promise<void> {
    try {
      const resp = await generarAccesoUsuario(id)
      await audit({ accion: 'GENERAR_ACCESO_USUARIO', expediente_id: id })
      await navigator.clipboard.writeText(resp.url).catch(() => undefined)
      toast.success(`Acceso generado. URL copiada al portapapeles.`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Expedientes</h1>
        <Button onClick={() => navigate('/admin/expedientes/nuevo')}>
          <Plus className="h-4 w-4" /> Nuevo Expediente
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Buscar expediente"
                placeholder="Buscar por nombre, ID, RUC..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select
              aria-label="Filtrar por estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as EstadoExpediente | '')
                setPage(1)
              }}
            >
              <option value="">Todos los estados</option>
              <option value="FORMULARIO_PUBLICO">Formulario público</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </Select>
            <Select
              aria-label="Filtrar por riesgo"
              value={riesgo}
              onChange={(e) => {
                setRiesgo(e.target.value as NivelRiesgo | '')
                setPage(1)
              }}
            >
              <option value="">Todos los riesgos</option>
              <option value="BAJO">Bajo</option>
              <option value="MEDIO">Medio</option>
              <option value="ALTO">Alto</option>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Nombre / Razón Social</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Última renov.</th>
                  <th className="p-2">Próxima renov.</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Riesgo</th>
                  <th className="p-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="p-2">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : (data?.results ?? []).map((e) => (
                      <tr key={e.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs">{e.codigo ?? e.id}</td>
                        <td className="p-2 font-medium">{e.nombre_razon_social}</td>
                        <td className="p-2">
                          {e.tipo_cliente === 'NATURAL' ? 'Natural' : 'Jurídica'}
                        </td>
                        <td className="p-2">{formatDate(e.ultima_renovacion)}</td>
                        <td className="p-2">{formatDate(e.proxima_renovacion)}</td>
                        <td className="p-2">
                          <EstadoBadge value={e.estado} />
                        </td>
                        <td className="p-2">
                          <RiesgoBadge value={e.nivel_riesgo} />
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/expedientes/${e.id}`}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
                            >
                              Ver
                            </Link>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGenerarAcceso(e.id)}
                            >
                              <Key className="h-3 w-3" /> Acceso
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && data && data.results.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                      Sin resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                {data.count} resultados · Página {page} de {totalPages}
                {isFetching && ' · actualizando...'}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
