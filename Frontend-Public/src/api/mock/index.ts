import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { registrarHandlers } from './setup'

let bootstrapped = false

export function bootstrapMockBackend(): void {
  if (bootstrapped) return
  if (import.meta.env.VITE_USE_MOCK !== 'true') return

  const mock = new MockAdapter(apiClient, { delayResponse: 0, onNoMatch: 'passthrough' })
  registrarHandlers(mock)
  bootstrapped = true

  // eslint-disable-next-line no-console
  console.info('[mock] Backend simulado activo. Tokens demo:', [
    'demo-natural-001',
    'demo-juridica-002',
    'demo-natural-003',
  ])
}
