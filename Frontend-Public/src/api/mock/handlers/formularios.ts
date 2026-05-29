import type MockAdapter from 'axios-mock-adapter'
import { TOKENS_VALIDOS } from '../data/tokens'

function delayMs(): number {
  return 300 + Math.floor(Math.random() * 200)
}

function generarExpedienteNumero(): string {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `EXP-2026-${random}`
}

export function registrarHandlersFormularios(mock: MockAdapter): void {
  mock.onGet(/\/api\/formularios\/public\/[^/]+\/?$/).reply((config) => {
    const url = config.url ?? ''
    const match = url.match(/\/api\/formularios\/public\/([^/?#]+)\/?$/)
    const token = match ? decodeURIComponent(match[1]) : ''
    const info = TOKENS_VALIDOS[token]
    if (!info) {
      return [404, { detail: 'Token no encontrado o ya utilizado' }]
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          200,
          {
            token,
            tipo: info.tipo,
            cliente_sugerido: info.cliente_sugerido,
            creado: info.creado,
          },
        ])
      }, delayMs())
    })
  })

  mock.onPost('/api/formularios/public/submit/').reply((config) => {
    const headers = config.headers ?? {}
    const tokenHeader = headers['X-Form-Token'] ?? headers['x-form-token']
    const token = typeof tokenHeader === 'string' ? tokenHeader : ''
    if (!token || !TOKENS_VALIDOS[token]) {
      return [401, { detail: 'Token inválido o ausente' }]
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          201,
          {
            ok: true,
            expediente_numero: generarExpedienteNumero(),
          },
        ])
      }, delayMs())
    })
  })
}
