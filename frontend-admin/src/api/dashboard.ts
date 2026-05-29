import { apiClient } from './client'
import type { Alerta, DashboardStats, TipoAlerta } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/api/dashboard/stats/')
  return data
}

export async function getAlertasActivasCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get<{ count: number }>('/api/alertas/activas/count/')
  return data
}

export async function listAlertas(tipo?: TipoAlerta): Promise<Alerta[]> {
  const { data } = await apiClient.get<Alerta[]>('/api/alertas/', {
    params: tipo ? { tipo } : undefined,
  })
  return data
}
