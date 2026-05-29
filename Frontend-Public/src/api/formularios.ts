import { apiClient } from './client'
import type { TipoCliente } from '@/types'

export interface PublicTokenInfo {
  token: string
  tipo: TipoCliente
  cliente_sugerido: string
  creado: string
}

export interface SubmitFormularioResponse {
  ok: boolean
  expediente_numero: string
}

export async function getFormularioByToken(token: string): Promise<PublicTokenInfo> {
  const res = await apiClient.get<PublicTokenInfo>(
    `/api/formularios/public/${encodeURIComponent(token)}/`,
    { headers: { 'X-Form-Token': token } },
  )
  return res.data
}

export async function submitFormulario(
  token: string,
  payload: Record<string, unknown>,
): Promise<SubmitFormularioResponse> {
  const res = await apiClient.post<SubmitFormularioResponse>(
    '/api/formularios/public/submit/',
    payload,
    { headers: { 'X-Form-Token': token } },
  )
  return res.data
}
