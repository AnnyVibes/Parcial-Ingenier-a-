import type {
  Documento,
  EstadoExpediente,
  Expediente,
  HistorialRenovacion,
  NivelRiesgo,
  Observacion,
  TipoCliente,
} from '@/types'

interface Seed {
  nombre_razon_social: string
  tipo_cliente: TipoCliente
  estado: EstadoExpediente
  nivel_riesgo: NivelRiesgo
  score_riesgo: number
  meses_ultima_renovacion: number | null
  meses_proxima_renovacion: number | null
  creado_por: number
  factores_riesgo?: string[]
}

const HOY = new Date('2026-05-28T00:00:00.000Z')

function addMonths(months: number): string {
  const d = new Date(HOY)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

const SEEDS: Seed[] = [
  {
    nombre_razon_social: 'Comercializadora Istmeña, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 18,
    meses_ultima_renovacion: -8,
    meses_proxima_renovacion: 4,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Roberto Antonio Núñez Quintero',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 12,
    meses_ultima_renovacion: -10,
    meses_proxima_renovacion: 2,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Inversiones Marbella Holdings Corp.',
    tipo_cliente: 'JURIDICA',
    estado: 'EN_REVISION',
    nivel_riesgo: 'ALTO',
    score_riesgo: 78,
    meses_ultima_renovacion: -14,
    meses_proxima_renovacion: -2,
    creado_por: 3,
    factores_riesgo: [
      'Estructura societaria con beneficiarios finales en jurisdicción de alto riesgo',
      'Cliente PEP relacionado',
      'Operaciones en efectivo superiores al umbral',
    ],
  },
  {
    nombre_razon_social: 'Distribuidora Centroamericana de Suministros, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'PENDIENTE',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 48,
    meses_ultima_renovacion: null,
    meses_proxima_renovacion: 12,
    creado_por: 5,
    factores_riesgo: ['Documentación incompleta', 'Sector con exposición media'],
  },
  {
    nombre_razon_social: 'María Cecilia Domínguez de Pérez',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 14,
    meses_ultima_renovacion: -6,
    meses_proxima_renovacion: 6,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Constructora Pacífico, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 52,
    meses_ultima_renovacion: -11,
    meses_proxima_renovacion: 1,
    creado_por: 5,
    factores_riesgo: ['Operaciones recientes con proveedores nuevos'],
  },
  {
    nombre_razon_social: 'Servicios Logísticos del Atlántico, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 20,
    meses_ultima_renovacion: -7,
    meses_proxima_renovacion: 5,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Jorge Luis Bethancourt Saavedra',
    tipo_cliente: 'NATURAL',
    estado: 'EN_REVISION',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 44,
    meses_ultima_renovacion: -12,
    meses_proxima_renovacion: 0,
    creado_por: 3,
    factores_riesgo: ['Vencimiento próximo', 'Cambio reciente de actividad económica'],
  },
  {
    nombre_razon_social: 'Importadora Multimarcas, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 22,
    meses_ultima_renovacion: -5,
    meses_proxima_renovacion: 7,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Patricia Iveth Sánchez Cedeño',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 11,
    meses_ultima_renovacion: -9,
    meses_proxima_renovacion: 3,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Inversiones Veraguas, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'PENDIENTE',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 41,
    meses_ultima_renovacion: null,
    meses_proxima_renovacion: 12,
    creado_por: 5,
    factores_riesgo: ['Pendiente declaración beneficiario final'],
  },
  {
    nombre_razon_social: 'Carlos Eduardo Mendoza Vergara',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 16,
    meses_ultima_renovacion: -8,
    meses_proxima_renovacion: 4,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Hoteles del Istmo Group, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 49,
    meses_ultima_renovacion: -10,
    meses_proxima_renovacion: 2,
    creado_por: 5,
    factores_riesgo: ['Cliente con alto volumen de transacciones en efectivo'],
  },
  {
    nombre_razon_social: 'Ana Lucía Espino Castillo',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 9,
    meses_ultima_renovacion: -4,
    meses_proxima_renovacion: 8,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Agroindustrias del Chiriquí, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 26,
    meses_ultima_renovacion: -6,
    meses_proxima_renovacion: 6,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Luis Alberto Quintero González',
    tipo_cliente: 'NATURAL',
    estado: 'EN_REVISION',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 47,
    meses_ultima_renovacion: -13,
    meses_proxima_renovacion: -1,
    creado_por: 3,
    factores_riesgo: ['Renovación vencida', 'Documentación parcial'],
  },
  {
    nombre_razon_social: 'Tecnología y Soluciones Panamá, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 19,
    meses_ultima_renovacion: -7,
    meses_proxima_renovacion: 5,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Yarissa Coraima Pinilla Batista',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 13,
    meses_ultima_renovacion: -3,
    meses_proxima_renovacion: 9,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Mayoristas del Caribe, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 38,
    meses_ultima_renovacion: -11,
    meses_proxima_renovacion: 1,
    creado_por: 5,
    factores_riesgo: ['Sector con monitoreo intensivo'],
  },
  {
    nombre_razon_social: 'Rafael Enrique Arosemena Pérez',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 17,
    meses_ultima_renovacion: -8,
    meses_proxima_renovacion: 4,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Inmobiliaria Costa del Sol, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'PENDIENTE',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 55,
    meses_ultima_renovacion: null,
    meses_proxima_renovacion: 12,
    creado_por: 5,
    factores_riesgo: ['Transacciones inmobiliarias de alto valor'],
  },
  {
    nombre_razon_social: 'Luz Mariela Tejada Ureña',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 15,
    meses_ultima_renovacion: -5,
    meses_proxima_renovacion: 7,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Servicios Financieros del Pacífico, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'EN_REVISION',
    nivel_riesgo: 'MEDIO',
    score_riesgo: 58,
    meses_ultima_renovacion: -10,
    meses_proxima_renovacion: 2,
    creado_por: 5,
    factores_riesgo: ['Actividad financiera regulada', 'Volúmenes operativos altos'],
  },
  {
    nombre_razon_social: 'José Antonio Carrasco Murgas',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 21,
    meses_ultima_renovacion: -6,
    meses_proxima_renovacion: 6,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Transporte Multimodal Coln, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 24,
    meses_ultima_renovacion: -9,
    meses_proxima_renovacion: 3,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Eliana Cristina Vásquez Lara',
    tipo_cliente: 'NATURAL',
    estado: 'PENDIENTE',
    nivel_riesgo: 'BAJO',
    score_riesgo: 25,
    meses_ultima_renovacion: null,
    meses_proxima_renovacion: 12,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Comercial El Dorado de David, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 18,
    meses_ultima_renovacion: -4,
    meses_proxima_renovacion: 8,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Daniel Eduardo Martínez Romero',
    tipo_cliente: 'NATURAL',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 19,
    meses_ultima_renovacion: -7,
    meses_proxima_renovacion: 5,
    creado_por: 3,
  },
  {
    nombre_razon_social: 'Distribuidora Farmacéutica Nacional, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 23,
    meses_ultima_renovacion: -8,
    meses_proxima_renovacion: 4,
    creado_por: 5,
  },
  {
    nombre_razon_social: 'Construye y Diseña Veraguas, S.A.',
    tipo_cliente: 'JURIDICA',
    estado: 'APROBADO',
    nivel_riesgo: 'BAJO',
    score_riesgo: 20,
    meses_ultima_renovacion: -2,
    meses_proxima_renovacion: 10,
    creado_por: 5,
  },
]

function codeFor(id: number): string {
  return `EXP-2026-${String(id).padStart(4, '0')}`
}

export function buildInitialExpedientes(): Expediente[] {
  return SEEDS.map((s, i) => {
    const id = i + 1
    const ultima = s.meses_ultima_renovacion === null ? null : addMonths(s.meses_ultima_renovacion)
    const proxima =
      s.meses_proxima_renovacion === null ? null : addMonths(s.meses_proxima_renovacion)
    const creado = ultima ?? addMonths(-1)
    return {
      id,
      codigo: codeFor(id),
      nombre_razon_social: s.nombre_razon_social,
      tipo_cliente: s.tipo_cliente,
      ultima_renovacion: ultima,
      proxima_renovacion: proxima,
      estado: s.estado,
      nivel_riesgo: s.nivel_riesgo,
      score_riesgo: s.score_riesgo,
      creado_por: s.creado_por,
      creado_en: creado,
      factores_riesgo: s.factores_riesgo ?? [],
    }
  })
}

export function buildInitialDocumentos(): Record<number, Documento[]> {
  const map: Record<number, Documento[]> = {}
  const tipos: Array<{ nombre: string; tipo: string }> = [
    { nombre: 'Cédula o pasaporte.pdf', tipo: 'application/pdf' },
    { nombre: 'Constancia de domicilio.pdf', tipo: 'application/pdf' },
    { nombre: 'Declaración de origen de fondos.pdf', tipo: 'application/pdf' },
    { nombre: 'Referencia bancaria.pdf', tipo: 'application/pdf' },
  ]
  for (let id = 1; id <= SEEDS.length; id++) {
    map[id] = tipos.map((t, idx) => ({
      id: id * 100 + idx,
      nombre: t.nombre,
      tipo: t.tipo,
      tamano: 184_320 + idx * 12_500,
      url_descarga: '#',
      fecha_subida: addMonths(-6 - (idx % 3)),
    }))
  }
  return map
}

export function buildInitialHistorial(): Record<number, HistorialRenovacion[]> {
  const map: Record<number, HistorialRenovacion[]> = {}
  for (let id = 1; id <= SEEDS.length; id++) {
    map[id] = [
      {
        id: id * 10 + 1,
        fecha: addMonths(-14),
        estado: 'PENDIENTE',
        usuario: 'Carla Colaboradora',
        notas: 'Expediente creado tras carga inicial',
      },
      {
        id: id * 10 + 2,
        fecha: addMonths(-13),
        estado: 'EN_REVISION',
        usuario: 'Oscar Oficial',
        notas: 'Inicio de revisión documental',
      },
      {
        id: id * 10 + 3,
        fecha: addMonths(-12),
        estado: 'APROBADO',
        usuario: 'Oscar Oficial',
        notas: 'Cumple con los requisitos KYC',
      },
    ]
  }
  return map
}

export function buildInitialObservaciones(): Record<number, Observacion[]> {
  const map: Record<number, Observacion[]> = {}
  for (let id = 1; id <= SEEDS.length; id++) {
    if (id % 3 === 0) {
      map[id] = [
        {
          id: id * 100 + 1,
          autor: 'Oscar Oficial',
          fecha: addMonths(-2),
          texto: 'Solicitar comprobante de renta del último periodo fiscal.',
        },
      ]
    } else {
      map[id] = []
    }
  }
  return map
}
