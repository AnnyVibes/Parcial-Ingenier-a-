import { apiClient } from './client'
import type { AuditLog, AuditPayload, Paginated } from '@/types'

export async function postAuditLog(payload: AuditPayload): Promise<void> {
  try {
    await apiClient.post('/api/auditoria/log/', payload)
  } catch {
    // Auditoría no debe romper la app: registrar en consola y continuar
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[audit] no se pudo registrar', payload)
    }
  }
}

export interface AuditFiltros {
  usuario?: string
  accion?: string
  desde?: string
  hasta?: string
  search?: string
}

export interface AuditStats {
  total_eventos: number
  eventos_hoy: number
  usuarios_activos: number
  accion_mas_comun: string
  por_accion: Array<{ accion: string; count: number }>
  por_usuario: Array<{ usuario: string; count: number }>
  por_dia: Array<{ dia: string; count: number }>
}

const clean = (f: AuditFiltros): Record<string, string> =>
  Object.fromEntries(Object.entries(f).filter(([, v]) => v))

export async function getAuditStats(f: AuditFiltros = {}): Promise<AuditStats> {
  const { data } = await apiClient.get<AuditStats>('/api/auditoria/stats/', { params: clean(f) })
  return data
}

export async function getAuditLogs(f: AuditFiltros = {}): Promise<Paginated<AuditLog>> {
  const { data } = await apiClient.get<Paginated<AuditLog>>('/api/auditoria/logs/', { params: clean(f) })
  return data
}
