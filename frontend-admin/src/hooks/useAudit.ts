import { useCallback } from 'react'
import { postAuditLog } from '@/api/audit'
import type { AuditPayload } from '@/types'

/**
 * Hook global de auditoría.
 * Cada acción del usuario en el portal admin debe disparar /api/auditoria/log/.
 */
export function useAudit(): (payload: AuditPayload) => Promise<void> {
  return useCallback((payload: AuditPayload) => postAuditLog(payload), [])
}
