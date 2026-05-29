import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

export const TOKEN_STORAGE_KEY = 'dd_access_token'
export const REFRESH_STORAGE_KEY = 'dd_refresh_token'
export const USER_STORAGE_KEY = 'dd_user'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* noop */
  }
}

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado: limpiar y notificar
      const path = window.location.pathname
      if (!path.startsWith('/login')) {
        setStoredToken(null)
        localStorage.removeItem(REFRESH_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
        window.location.assign('/login?expired=1')
      }
    }
    return Promise.reject(error)
  },
)

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined
    if (data) {
      if (typeof data.detail === 'string') return data.detail
      if (typeof data.message === 'string') return data.message
      const firstKey = Object.keys(data)[0]
      const firstVal = firstKey ? data[firstKey] : undefined
      if (Array.isArray(firstVal) && typeof firstVal[0] === 'string') return firstVal[0]
      if (typeof firstVal === 'string') return firstVal
    }
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Error inesperado'
}
