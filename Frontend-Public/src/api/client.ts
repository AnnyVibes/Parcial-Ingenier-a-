import axios, { AxiosError, type AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

export function setFormToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['X-Form-Token'] = token
  } else {
    delete apiClient.defaults.headers.common['X-Form-Token']
  }
}

interface ErrorBody {
  detail?: string
  message?: string
  error?: string
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ErrorBody | string | undefined
    if (typeof data === 'string') return data
    if (data) {
      if (typeof data.detail === 'string') return data.detail
      if (typeof data.message === 'string') return data.message
      if (typeof data.error === 'string') return data.error
    }
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Error desconocido'
}
