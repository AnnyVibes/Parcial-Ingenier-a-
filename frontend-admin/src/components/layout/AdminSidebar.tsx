import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Folder,
  KanbanSquare,
  ShieldAlert,
  BellRing,
  Users,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useAudit } from '@/hooks/useAudit'
import { cn, getInitials } from '@/lib/utils'
import type { Rol } from '@/types'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: Rol[]
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/expedientes', label: 'Expedientes', icon: Folder },
  { to: '/admin/kanban', label: 'Tablero Kanban', icon: KanbanSquare },
  { to: '/admin/auditoria', label: 'Auditoría', icon: ShieldAlert },
  { to: '/admin/reportes', label: 'Reportes y Alertas', icon: BellRing },
  { to: '/admin/usuarios', label: 'Gestión de Usuarios', icon: Users, roles: ['ADMINISTRADOR'] },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: Props): JSX.Element {
  const { user, hasRole, logout } = useAuth()
  const audit = useAudit()

  async function handleLogout(): Promise<void> {
    await audit({ accion: 'LOGOUT' })
    logout()
  }

  return (
    <>
      {/* Drawer mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar de navegación"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Debida</p>
              <p className="text-xs text-muted-foreground">Diligencia</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar menú"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            if (item.roles && !hasRole(item.roles)) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-md p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground">
              {getInitials(user?.nombre ?? user?.email ?? '?')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.nombre ?? user?.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.rol}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  )
}
