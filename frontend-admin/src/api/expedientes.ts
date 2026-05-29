import { apiClient } from './client'
import type {
  Documento,
  EstadoExpediente,
  Expediente,
  HistorialRenovacion,
  Observacion,
  Paginated,
} from '@/types'

export interface ExpedientesQuery {
  search?: string
  estado?: EstadoExpediente | ''
  riesgo?: 'BAJO' | 'MEDIO' | 'ALTO' | ''
  page?: number
  page_size?: number
}

export async function listExpedientes(q: ExpedientesQuery = {}): Promise<Paginated<Expediente>> {
  const { data } = await apiClient.get<Paginated<Expediente>>('/api/expedientes/', { params: q })
  return data
}

export async function getExpediente(id: number): Promise<Expediente> {
  const { data } = await apiClient.get<Expediente>(`/api/expedientes/${id}/`)
  return data
}

export async function cambiarEstadoExpediente(
  id: number,
  payload: { estado: EstadoExpediente; observacion?: string },
): Promise<Expediente> {
  const { data } = await apiClient.patch<Expediente>(`/api/expedientes/${id}/estado/`, payload)
  return data
}

export async function generarAccesoUsuario(id: number): Promise<{ token: string; url: string }> {
  const { data } = await apiClient.post<{ token: string; url: string }>(
    `/api/expedientes/${id}/generar-acceso/`,
  )
  return data
}

export async function recalcularRiesgo(id: number): Promise<Expediente> {
  const { data } = await apiClient.post<Expediente>(`/api/expedientes/${id}/recalcular-riesgo/`)
  return data
}

export async function listDocumentos(id: number): Promise<Documento[]> {
  const { data } = await apiClient.get<Documento[]>(`/api/expedientes/${id}/documentos/`)
  return data
}

export async function listHistorial(id: number): Promise<HistorialRenovacion[]> {
  const { data } = await apiClient.get<HistorialRenovacion[]>(`/api/expedientes/${id}/historial/`)
  return data
}

export async function listObservaciones(id: number): Promise<Observacion[]> {
  const { data } = await apiClient.get<Observacion[]>(`/api/expedientes/${id}/observaciones/`)
  return data
}

export async function crearObservacion(id: number, texto: string): Promise<Observacion> {
  const { data } = await apiClient.post<Observacion>(`/api/expedientes/${id}/observaciones/`, {
    texto,
  })
  return data
}
