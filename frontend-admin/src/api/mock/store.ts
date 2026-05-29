import type {
  Alerta,
  AuditLog,
  DashboardStats,
  Documento,
  Expediente,
  HistorialRenovacion,
  Observacion,
} from '@/types'
import {
  buildInitialDocumentos,
  buildInitialExpedientes,
  buildInitialHistorial,
  buildInitialObservaciones,
} from './data/expedientes'
import { buildAlertas } from './data/alertas'
import { buildInitialActividad } from './data/actividad'
import { MOCK_USERS, type MockUser } from './data/users'

interface SessionToken {
  userId: number
  issuedAt: number
}

interface TempMfaToken {
  userId: number
  email: string
  issuedAt: number
}

interface AccessFormToken {
  expedienteId: number
  issuedAt: number
}

interface MockStore {
  users: MockUser[]
  expedientes: Expediente[]
  documentos: Record<number, Documento[]>
  historial: Record<number, HistorialRenovacion[]>
  observaciones: Record<number, Observacion[]>
  actividad: DashboardStats['actividad_reciente']
  auditLogs: AuditLog[]
  sessions: Map<string, SessionToken>
  tempMfa: Map<string, TempMfaToken>
  accessForms: Map<string, AccessFormToken>
  nextExpedienteId: number
  nextObservacionId: number
  nextAuditId: number
  nextActividadId: number
}

function build(): MockStore {
  const expedientes = buildInitialExpedientes()
  return {
    users: [...MOCK_USERS],
    expedientes,
    documentos: buildInitialDocumentos(),
    historial: buildInitialHistorial(),
    observaciones: buildInitialObservaciones(),
    actividad: buildInitialActividad(),
    auditLogs: [],
    sessions: new Map(),
    tempMfa: new Map(),
    accessForms: new Map(),
    nextExpedienteId: expedientes.length + 1,
    nextObservacionId: 100_000,
    nextAuditId: 1,
    nextActividadId: 1_000,
  }
}

export const store: MockStore = build()

export function getAlertas(): Alerta[] {
  return buildAlertas(store.expedientes)
}

export function recordActividad(usuario: string, accion: string): void {
  const id = store.nextActividadId++
  store.actividad.unshift({
    id,
    usuario,
    accion,
    fecha: new Date().toISOString(),
  })
  if (store.actividad.length > 30) store.actividad.length = 30
}

export function recordAudit(
  usuario: string,
  accion: string,
  expedienteId: number | null | undefined,
  detalles?: Record<string, unknown>,
): void {
  store.auditLogs.unshift({
    id: store.nextAuditId++,
    accion,
    usuario,
    fecha: new Date().toISOString(),
    expediente_id: expedienteId ?? null,
    detalles,
  })
  if (store.auditLogs.length > 500) store.auditLogs.length = 500
}

export function issueSession(userId: number): { access: string; refresh: string } {
  const access = `mock-jwt-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const refresh = `mock-refresh-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  store.sessions.set(access, { userId, issuedAt: Date.now() })
  return { access, refresh }
}

export function userFromToken(token: string | null | undefined): MockUser | undefined {
  if (!token) return undefined
  const t = token.startsWith('Bearer ') ? token.slice(7) : token
  const session = store.sessions.get(t)
  if (!session) {
    // Token desconocido (recargado desde localStorage): inferir desde el formato
    const match = /^mock-jwt-(\d+)-/.exec(t)
    if (!match) return undefined
    const userId = Number(match[1])
    const user = store.users.find((u) => u.id === userId)
    if (user) {
      store.sessions.set(t, { userId, issuedAt: Date.now() })
    }
    return user
  }
  return store.users.find((u) => u.id === session.userId)
}

export function issueTempMfa(user: MockUser): string {
  const tok = `mock-temp-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  store.tempMfa.set(tok, { userId: user.id, email: user.email, issuedAt: Date.now() })
  return tok
}

export function consumeTempMfa(token: string): MockUser | undefined {
  const entry = store.tempMfa.get(token)
  if (!entry) return undefined
  store.tempMfa.delete(token)
  return store.users.find((u) => u.id === entry.userId)
}

export function issueAccessForm(expedienteId: number): { token: string; url: string } {
  const token = `mock-form-${expedienteId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  store.accessForms.set(token, { expedienteId, issuedAt: Date.now() })
  const origin =
    typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:5173'
  return { token, url: `${origin}/formulario/${token}` }
}
