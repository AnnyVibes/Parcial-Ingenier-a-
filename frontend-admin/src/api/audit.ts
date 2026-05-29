import { apiClient } from './client'
import type { AuditPayload } from '@/types'

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
