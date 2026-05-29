import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { registerAlertasHandlers } from './handlers/alertas'
import { registerAuditoriaHandlers } from './handlers/auditoria'
import { registerAuthHandlers } from './handlers/auth'
import { registerDashboardHandlers } from './handlers/dashboard'
import { registerExpedientesHandlers } from './handlers/expedientes'
import { registerUsuariosHandlers } from './handlers/usuarios'

let installed = false

export function installMockAdapter(): MockAdapter {
  if (installed) {
    // Solo se debe instalar una vez (HMR podría reejecutar)
    throw new Error('Mock adapter ya instalado')
  }
  const mock = new MockAdapter(apiClient, { delayResponse: 0, onNoMatch: 'passthrough' })

  registerAuthHandlers(mock)
  registerDashboardHandlers(mock)
  registerExpedientesHandlers(mock)
  registerAlertasHandlers(mock)
  registerUsuariosHandlers(mock)
  registerAuditoriaHandlers(mock)

  // Loguear cada petición que el mock atiende
  apiClient.interceptors.request.use((config) => {
    // eslint-disable-next-line no-console
    console.info(
      '[MOCK]',
      (config.method ?? 'get').toUpperCase(),
      config.url,
    )
    return config
  })

  installed = true
  return mock
}
