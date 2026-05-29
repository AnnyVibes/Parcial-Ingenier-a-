import type MockAdapter from 'axios-mock-adapter'
import { findUserByEmail, publicUser } from '../data/users'
import {
  consumeTempMfa,
  issueSession,
  issueTempMfa,
  recordActividad,
  recordAudit,
  userFromToken,
} from '../store'
import { delay, jsonOk, parseBody, currentAuthHeader } from '../utils'

export function registerAuthHandlers(mock: MockAdapter): void {
  mock.onPost('/api/auth/login/').reply(async (config) => {
    await delay()
    const body = parseBody<{ email?: string; password?: string }>(config.data)
    const email = (body.email ?? '').trim()
    const password = body.password ?? ''
    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      return [401, { detail: 'Credenciales inválidas' }]
    }
    if (!user.activo) {
      return [403, { detail: 'Cuenta deshabilitada' }]
    }
    if (user.requires_mfa) {
      const temp = issueTempMfa(user)
      return jsonOk({ requires_mfa: true, temp_token: temp })
    }
    const { access, refresh } = issueSession(user.id)
    user.ultimo_login = new Date().toISOString()
    recordActividad(user.nombre, 'Inició sesión en el portal')
    recordAudit(user.nombre, 'LOGIN', null, { email: user.email })
    return jsonOk({ requires_mfa: false, access, refresh, user: publicUser(user) })
  })

  mock.onPost('/api/auth/mfa/verify/').reply(async (config) => {
    await delay()
    const body = parseBody<{ temp_token?: string; code?: string }>(config.data)
    if (!body.temp_token || !body.code) {
      return [400, { detail: 'Datos incompletos' }]
    }
    const user = consumeTempMfa(body.temp_token)
    if (!user) {
      return [400, { detail: 'Token temporal inválido o expirado' }]
    }
    if (body.code !== user.mfa_code) {
      // Reemitir temp_token para permitir reintento
      const newTemp = issueTempMfa(user)
      return [400, { detail: 'Código MFA inválido', temp_token: newTemp }]
    }
    const { access, refresh } = issueSession(user.id)
    user.ultimo_login = new Date().toISOString()
    recordActividad(user.nombre, 'Inició sesión con MFA')
    recordAudit(user.nombre, 'LOGIN_MFA', null, { email: user.email })
    return jsonOk({ access, refresh, user: publicUser(user) })
  })

  mock.onPost('/api/auth/password-reset/').reply(async () => {
    await delay()
    return jsonOk({ ok: true })
  })

  mock.onGet('/api/auth/me/').reply(async (config) => {
    await delay(80)
    const user = userFromToken(currentAuthHeader(config))
    if (!user) return [401, { detail: 'No autenticado' }]
    return jsonOk(publicUser(user))
  })

  mock.onPost('/api/auditoria/log/').reply(async (config) => {
    await delay(60)
    const user = userFromToken(currentAuthHeader(config))
    const body = parseBody<{
      accion?: string
      expediente_id?: number | null
      resultado?: string
      detalles?: Record<string, unknown>
    }>(config.data)
    recordAudit(user?.nombre ?? 'anónimo', body.accion ?? 'EVENTO', body.expediente_id ?? null, {
      resultado: body.resultado,
      ...(body.detalles ?? {}),
    })
    return jsonOk({ ok: true })
  })
}
