import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Rol } from '@/types'

interface PrivateRouteProps {
  children: ReactNode
  roles?: Rol[]
}

export function PrivateRoute({ children, roles }: PrivateRouteProps): JSX.Element {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <>{children}</>
}
