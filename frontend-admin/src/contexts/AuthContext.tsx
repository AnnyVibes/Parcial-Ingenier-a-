import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  REFRESH_STORAGE_KEY,
  USER_STORAGE_KEY,
  getStoredToken,
  setStoredToken,
} from '@/api/client'
import type { Rol, Usuario } from '@/types'

interface AuthContextValue {
  user: Usuario | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, refresh: string, user: Usuario) => void
  logout: () => void
  hasRole: (role: Rol | Rol[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<Usuario | null>(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Usuario) : null
    } catch {
      return null
    }
  })

  const login = useCallback((newToken: string, refresh: string, u: Usuario) => {
    setStoredToken(newToken)
    try {
      localStorage.setItem(REFRESH_STORAGE_KEY, refresh)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
    } catch {
      /* noop */
    }
    setToken(newToken)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    try {
      localStorage.removeItem(REFRESH_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      /* noop */
    }
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: Rol | Rol[]): boolean => {
      if (!user) return false
      if (Array.isArray(role)) return role.includes(user.rol)
      return user.rol === role
    },
    [user],
  )

  // Sincronizar entre pestañas
  useEffect(() => {
    function onStorage(e: StorageEvent): void {
      if (e.key === USER_STORAGE_KEY) {
        setUser(e.newValue ? (JSON.parse(e.newValue) as Usuario) : null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      hasRole,
    }),
    [user, token, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
