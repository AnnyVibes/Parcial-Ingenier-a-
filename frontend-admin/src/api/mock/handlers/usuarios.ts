import type MockAdapter from 'axios-mock-adapter'
import type { Rol, Usuario } from '@/types'
import { nextUserId, publicUser, ROLES_DISPONIBLES, type MockUser } from '../data/users'
import { recordActividad, recordAudit, store, userFromToken } from '../store'
import {
  currentAuthHeader,
  delay,
  extractIdFromUrl,
  jsonOk,
  paginate,
  parseBody,
} from '../utils'

const USR_LIST_RE = /^\/api\/usuarios\/$/
const USR_DETAIL_RE = /^\/api\/usuarios\/(\d+)\/?$/

export function registerUsuariosHandlers(mock: MockAdapter): void {
  mock.onGet(USR_LIST_RE).reply(async () => {
    await delay()
    const items: Usuario[] = store.users.map((u) => publicUser(u))
    return jsonOk(paginate(items, 1, items.length))
  })

  mock.onPost(USR_LIST_RE).reply(async (config) => {
    await delay()
    const body = parseBody<{ email?: string; nombre?: string; rol?: Rol; password?: string }>(
      config.data,
    )
    if (!body.email || !body.nombre || !body.rol) {
      return [400, { detail: 'email, nombre y rol son requeridos' }]
    }
    if (!ROLES_DISPONIBLES.includes(body.rol)) {
      return [400, { detail: 'Rol no válido' }]
    }
    const newUser: MockUser = {
      id: nextUserId(),
      email: body.email,
      nombre: body.nombre,
      rol: body.rol,
      activo: true,
      ultimo_login: null,
      password: body.password ?? 'changeme123',
      requires_mfa: body.rol === 'OFICIAL_CUMPLIMIENTO',
      mfa_code: '123456',
    }
    store.users.push(newUser)
    const actor = userFromToken(currentAuthHeader(config))
    recordActividad(actor?.nombre ?? 'sistema', `Creó usuario ${newUser.email}`)
    recordAudit(actor?.nombre ?? 'sistema', 'CREAR_USUARIO', null, { email: newUser.email })
    return jsonOk(publicUser(newUser), 201)
  })

  mock.onPatch(USR_DETAIL_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, USR_DETAIL_RE)
    const user = store.users.find((u) => u.id === id)
    if (!user) return [404, { detail: 'Usuario no encontrado' }]
    const body = parseBody<Partial<Pick<MockUser, 'nombre' | 'rol' | 'activo' | 'password'>>>(
      config.data,
    )
    if (body.nombre !== undefined) user.nombre = body.nombre
    if (body.rol !== undefined && ROLES_DISPONIBLES.includes(body.rol)) user.rol = body.rol
    if (body.activo !== undefined) user.activo = body.activo
    if (body.password !== undefined) user.password = body.password
    const actor = userFromToken(currentAuthHeader(config))
    recordAudit(actor?.nombre ?? 'sistema', 'ACTUALIZAR_USUARIO', null, { id: user.id })
    return jsonOk(publicUser(user))
  })

  mock.onDelete(USR_DETAIL_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, USR_DETAIL_RE)
    const idx = store.users.findIndex((u) => u.id === id)
    if (idx === -1) return [404, { detail: 'Usuario no encontrado' }]
    const [removed] = store.users.splice(idx, 1)
    const actor = userFromToken(currentAuthHeader(config))
    recordAudit(actor?.nombre ?? 'sistema', 'ELIMINAR_USUARIO', null, { email: removed.email })
    return [204, undefined]
  })
}
