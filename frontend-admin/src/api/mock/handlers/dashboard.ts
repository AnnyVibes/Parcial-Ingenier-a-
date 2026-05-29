import type MockAdapter from 'axios-mock-adapter'
import type { DashboardStats } from '@/types'
import { getAlertas, store } from '../store'
import { delay, jsonOk } from '../utils'

function computeDistribucion(): DashboardStats['distribucion_riesgo'] {
  const dist = { bajo: 0, medio: 0, alto: 0 }
  for (const e of store.expedientes) {
    if (e.nivel_riesgo === 'BAJO') dist.bajo += 1
    else if (e.nivel_riesgo === 'MEDIO') dist.medio += 1
    else if (e.nivel_riesgo === 'ALTO') dist.alto += 1
  }
  return dist
}

const ESTADISTICAS_MENSUALES: DashboardStats['estadisticas_mensuales'] = [
  { mes: 'Dic', creados: 15, aprobados: 13 },
  { mes: 'Ene', creados: 18, aprobados: 16 },
  { mes: 'Feb', creados: 22, aprobados: 20 },
  { mes: 'Mar', creados: 19, aprobados: 17 },
  { mes: 'Abr', creados: 25, aprobados: 22 },
  { mes: 'May', creados: 28, aprobados: 24 },
]

export function registerDashboardHandlers(mock: MockAdapter): void {
  mock.onGet('/api/dashboard/stats/').reply(async () => {
    await delay()
    const total = store.expedientes.length
    const aprobados = store.expedientes.filter((e) => e.estado === 'APROBADO').length
    const alto_riesgo = store.expedientes.filter((e) => e.nivel_riesgo === 'ALTO').length
    const hoy = new Date('2026-05-28T00:00:00.000Z').getTime()
    const limite = hoy + 30 * 24 * 60 * 60 * 1000
    const pendientes_renovacion = store.expedientes.filter((e) => {
      if (!e.proxima_renovacion) return false
      const t = new Date(e.proxima_renovacion).getTime()
      return t <= limite
    }).length

    const stats: DashboardStats = {
      total_expedientes: total,
      pendientes_renovacion,
      aprobados,
      alto_riesgo,
      actividad_reciente: store.actividad.slice(0, 8),
      distribucion_riesgo: computeDistribucion(),
      estadisticas_mensuales: ESTADISTICAS_MENSUALES,
    }
    return jsonOk(stats)
  })

  mock.onGet('/api/alertas/activas/count/').reply(async () => {
    await delay(80)
    return jsonOk({ count: getAlertas().length })
  })
}
