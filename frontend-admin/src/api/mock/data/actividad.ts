import type { DashboardStats } from '@/types'

type ActividadItem = DashboardStats['actividad_reciente'][number]

const ACCIONES: Array<{ usuario: string; accion: string; minutosAtras: number }> = [
  { usuario: 'Oscar Oficial', accion: 'Aprobó el expediente EXP-2026-0009', minutosAtras: 12 },
  { usuario: 'Carla Colaboradora', accion: 'Creó nuevo expediente EXP-2026-0030', minutosAtras: 38 },
  { usuario: 'Ana Admin', accion: 'Recalculó riesgo en EXP-2026-0003', minutosAtras: 55 },
  { usuario: 'Aura Auditora', accion: 'Generó reporte de auditoría mensual', minutosAtras: 95 },
  { usuario: 'Oscar Oficial', accion: 'Inició revisión de EXP-2026-0016', minutosAtras: 140 },
  { usuario: 'Luis Castillo', accion: 'Subió documentos a EXP-2026-0011', minutosAtras: 210 },
  { usuario: 'Carla Colaboradora', accion: 'Agregó observación en EXP-2026-0023', minutosAtras: 320 },
  { usuario: 'Ana Admin', accion: 'Activó cuenta de usuario lcastillo@dda.test', minutosAtras: 480 },
]

export function buildInitialActividad(now: Date = new Date('2026-05-28T15:30:00.000Z')): ActividadItem[] {
  return ACCIONES.map((a, idx) => ({
    id: idx + 1,
    usuario: a.usuario,
    accion: a.accion,
    fecha: new Date(now.getTime() - a.minutosAtras * 60 * 1000).toISOString(),
  }))
}
