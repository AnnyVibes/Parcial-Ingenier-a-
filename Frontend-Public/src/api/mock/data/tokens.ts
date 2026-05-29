import type { TipoCliente } from '@/types'

export interface MockTokenInfo {
  tipo: TipoCliente
  cliente_sugerido: string
  creado: string
}

export const TOKENS_VALIDOS: Record<string, MockTokenInfo> = {
  'demo-natural-001': {
    tipo: 'NATURAL',
    cliente_sugerido: 'Juan Pérez',
    creado: '2026-05-20',
  },
  'demo-juridica-002': {
    tipo: 'JURIDICA',
    cliente_sugerido: 'Constructora Panamá S.A.',
    creado: '2026-05-22',
  },
  'demo-natural-003': {
    tipo: 'NATURAL',
    cliente_sugerido: 'María Rodríguez',
    creado: '2026-05-25',
  },
}
