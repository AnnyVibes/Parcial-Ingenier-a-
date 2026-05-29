import { apiClient } from './client'
import type { LoginResponse, MfaVerifyResponse, Usuario } from '@/types'

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login/', { email, password })
  return data
}

export async function verifyMfa(temp_token: string, code: string): Promise<MfaVerifyResponse> {
  const { data } = await apiClient.post<MfaVerifyResponse>('/api/auth/mfa/verify/', {
    temp_token,
    code,
  })
  return data
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean }> {
  const { data } = await apiClient.post<{ ok: boolean }>('/api/auth/password-reset/', { email })
  return data
}

export async function getCurrentUser(): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>('/api/auth/me/')
  return data
}
