import type { Alerta, Expediente } from '@/types'

const DIAS_30_MS = 30 * 24 * 60 * 60 * 1000

export function buildAlertas(expedientes: Expediente[], hoy: Date = new Date('2026-05-28T00:00:00.000Z')): Alerta[] {
  const alertas: Alerta[] = []
  let nextId = 1

  for (const e of expedientes) {
    if (e.proxima_renovacion) {
      const prox = new Date(e.proxima_renovacion).getTime()
      const diff = prox - hoy.getTime()
      if (diff <= DIAS_30_MS) {
        const vencido = diff < 0
        alertas.push({
          id: nextId++,
          tipo: 'RENOVACION',
          expediente_id: e.id,
          expediente_nombre: e.nombre_razon_social,
          mensaje: vencido
            ? `Renovación vencida hace ${Math.abs(Math.round(diff / (1000 * 60 * 60 * 24)))} días`
            : `Renovación próxima en ${Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))} días`,
          fecha: hoy.toISOString(),
          prioridad: vencido ? 'ALTA' : 'MEDIA',
        })
      }
    }

    if (e.nivel_riesgo === 'ALTO') {
      alertas.push({
        id: nextId++,
        tipo: 'ALTO_RIESGO',
        expediente_id: e.id,
        expediente_nombre: e.nombre_razon_social,
        mensaje: `Score de riesgo ${e.score_riesgo ?? '-'}: requiere evaluación especial`,
        fecha: hoy.toISOString(),
        prioridad: 'ALTA',
      })
    }

    if (e.estado === 'PENDIENTE') {
      alertas.push({
        id: nextId++,
        tipo: 'DOC_PENDIENTE',
        expediente_id: e.id,
        expediente_nombre: e.nombre_razon_social,
        mensaje: 'Documentación incompleta o pendiente de verificación',
        fecha: hoy.toISOString(),
        prioridad: 'MEDIA',
      })
    }
  }

  return alertas
}
