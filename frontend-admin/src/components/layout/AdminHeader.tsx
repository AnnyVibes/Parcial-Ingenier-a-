import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronRight, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { getAlertasActivasCount, listAlertas } from '@/api/dashboard'
import { MOCK_ENABLED } from '@/api/mock'
import { formatRelativeTime } from '@/lib/utils'

interface Props {
  onOpenSidebar: () => void
}

const SEGMENT_LABEL: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  expedientes: 'Expedientes',
  auditoria: 'Auditoría',
  reportes: 'Reportes y Alertas',
  usuarios: 'Usuarios',
  workflow: 'Workflow',
}

function buildBreadcrumb(pathname: string): Array<{ label: string; to: string }> {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs: Array<{ label: string; to: string }> = []
  let acc = ''
  for (const p of parts) {
    acc += `/${p}`
    crumbs.push({ label: SEGMENT_LABEL[p] ?? decodeURIComponent(p), to: acc })
  }
  return crumbs
}

export function AdminHeader({ onOpenSidebar }: Props): JSX.Element {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(false)

  const crumbs = buildBreadcrumb(location.pathname)

  const { data: alertCount } = useQuery({
    queryKey: ['alertas', 'count'],
    queryFn: getAlertasActivasCount,
    refetchInterval: 30_000,
  })

  const { data: alertas } = useQuery({
    queryKey: ['alertas', 'recientes'],
    queryFn: () => listAlertas(),
    enabled: openDropdown,
  })

  return (
    <header className="flex h-16 items-center gap-3 border-b bg-card px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Abrir menú"
        className="lg:hidden"
        onClick={onOpenSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <span key={c.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />}
            {i === crumbs.length - 1 ? (
              <span className="truncate font-medium">{c.label}</span>
            ) : (
              <Link to={c.to} className="truncate text-muted-foreground hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {MOCK_ENABLED && (
        <Badge
          variant="warning"
          title="Modo demo: usando backend simulado en memoria"
          className="hidden sm:inline-flex"
        >
          DEMO
        </Badge>
      )}

      {/* Notificaciones */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notificaciones"
          onClick={() => setOpenDropdown((v) => !v)}
        >
          <Bell className="h-5 w-5" />
          {alertCount && alertCount.count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {alertCount.count > 99 ? '99+' : alertCount.count}
            </span>
          )}
        </Button>
        {openDropdown && (
          <div
            className="absolute right-0 top-full z-30 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md"
            onMouseLeave={() => setOpenDropdown(false)}
          >
            <div className="border-b p-3 text-sm font-semibold">Alertas recientes</div>
            <div className="max-h-80 overflow-y-auto">
              {(alertas ?? []).slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  to={`/admin/expedientes/${a.expediente_id}`}
                  className="block border-b p-3 text-sm last:border-0 hover:bg-accent"
                  onClick={() => setOpenDropdown(false)}
                >
                  <p className="font-medium">{a.expediente_nombre}</p>
                  <p className="text-xs text-muted-foreground">{a.mensaje}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatRelativeTime(a.fecha)}
                  </p>
                </Link>
              ))}
              {(!alertas || alertas.length === 0) && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No hay alertas recientes
                </p>
              )}
            </div>
            <Link
              to="/admin/reportes"
              className="block border-t p-3 text-center text-sm font-medium text-primary hover:bg-accent"
              onClick={() => setOpenDropdown(false)}
            >
              Ver todas
            </Link>
          </div>
        )}
      </div>

      {/* Tema */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        onClick={toggle}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  )
}
