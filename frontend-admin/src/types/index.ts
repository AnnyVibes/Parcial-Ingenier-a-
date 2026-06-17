/* ---------- Roles & Auth ---------- */
export type Rol = 'ADMINISTRADOR' | 'OFICIAL_CUMPLIMIENTO' | 'COLABORADOR' | 'AUDITOR'

export interface Usuario {
  id: number
  email: string
  nombre: string
  rol: Rol
  activo?: boolean
  ultimo_login?: string | null
}

export interface LoginResponse {
  requires_mfa: boolean
  temp_token?: string
  access?: string
  refresh?: string
  user?: Usuario
}

export interface MfaVerifyResponse {
  access: string
  refresh: string
  user: Usuario
}

/* ---------- Auditoría ---------- */
export interface AuditPayload {
  accion: string
  expediente_id?: number | null
  resultado?: 'EXITO' | 'FALLO'
  estado_anterior?: string
  estado_nuevo?: string
  observacion?: string
  detalles?: Record<string, unknown>
}

export interface AuditLog {
  id: number
  accion: string
  categoria?: string
  usuario: string
  fecha: string
  modelo?: string
  ip?: string
  expediente_id?: number | null
  detalles?: Record<string, unknown>
}

/* ---------- Expedientes ---------- */
export type TipoCliente = 'NATURAL' | 'JURIDICA'
export type EstadoExpediente =
  | 'FORMULARIO_PUBLICO'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO'

export interface Expediente {
  id: number
  codigo?: string
  nombre_razon_social: string
  tipo_cliente: TipoCliente
  ultima_renovacion: string | null
  proxima_renovacion: string | null
  estado: EstadoExpediente
  nivel_riesgo: NivelRiesgo
  score_riesgo?: number
  creado_por?: number
  creado_en?: string
  factores_riesgo?: string[]
}

export interface Observacion {
  id: number
  autor: string
  fecha: string
  texto: string
}

export interface Documento {
  id: number
  nombre: string
  tipo: string
  tamano: number
  url_descarga: string
  fecha_subida: string
}

export interface HistorialRenovacion {
  id: number
  fecha: string
  estado: EstadoExpediente
  usuario: string
  notas?: string
}

/* ---------- Dashboard / Stats ---------- */
export interface DashboardStats {
  total_expedientes: number
  pendientes_renovacion: number
  aprobados: number
  alto_riesgo: number
  actividad_reciente: Array<{
    id: number
    usuario: string
    accion: string
    fecha: string
  }>
  distribucion_riesgo: { bajo: number; medio: number; alto: number }
  estadisticas_mensuales: Array<{ mes: string; creados: number; aprobados: number }>
}

/* ---------- Alertas ---------- */
export type TipoAlerta = 'RENOVACION' | 'ALTO_RIESGO' | 'DOC_PENDIENTE'

export interface Alerta {
  id: number
  tipo: TipoAlerta
  expediente_id: number
  expediente_nombre: string
  mensaje: string
  fecha: string
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA'
}

/* ---------- Form KYC ---------- */
export interface ReferenciaItem {
  tipo: 'BANCARIA' | 'PROVEEDOR' | 'CLIENTE'
  nombre: string
  telefono?: string
  email?: string
  banco?: string
  numero_cuenta?: string
}

export interface BeneficiarioFinal {
  nombres: string
  apellidos: string
  cedula: string
  porcentaje: number
  tipo_control: 'DIRECTO' | 'INDIRECTO'
}

/* ---------- Paginación ---------- */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
