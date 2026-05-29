import type { Rol, Usuario } from '@/types'

export interface MockUser extends Usuario {
  password: string
  requires_mfa: boolean
  mfa_code: string
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    email: 'admin@dda.test',
    nombre: 'Ana Admin',
    rol: 'ADMINISTRADOR',
    activo: true,
    ultimo_login: '2026-05-27T08:14:00.000Z',
    password: 'admin123',
    requires_mfa: false,
    mfa_code: '123456',
  },
  {
    id: 2,
    email: 'oficial@dda.test',
    nombre: 'Oscar Oficial',
    rol: 'OFICIAL_CUMPLIMIENTO',
    activo: true,
    ultimo_login: '2026-05-27T11:42:00.000Z',
    password: 'oficial123',
    requires_mfa: true,
    mfa_code: '123456',
  },
  {
    id: 3,
    email: 'colaborador@dda.test',
    nombre: 'Carla Colaboradora',
    rol: 'COLABORADOR',
    activo: true,
    ultimo_login: '2026-05-26T16:20:00.000Z',
    password: 'colab123',
    requires_mfa: false,
    mfa_code: '123456',
  },
  {
    id: 4,
    email: 'auditor@dda.test',
    nombre: 'Aura Auditora',
    rol: 'AUDITOR',
    activo: true,
    ultimo_login: '2026-05-25T09:05:00.000Z',
    password: 'auditor123',
    requires_mfa: false,
    mfa_code: '123456',
  },
  {
    id: 5,
    email: 'lcastillo@dda.test',
    nombre: 'Luis Castillo',
    rol: 'COLABORADOR',
    activo: true,
    ultimo_login: '2026-05-20T10:00:00.000Z',
    password: 'colab123',
    requires_mfa: false,
    mfa_code: '123456',
  },
  {
    id: 6,
    email: 'mvera@dda.test',
    nombre: 'María Vera',
    rol: 'OFICIAL_CUMPLIMIENTO',
    activo: false,
    ultimo_login: '2026-04-15T13:30:00.000Z',
    password: 'oficial123',
    requires_mfa: true,
    mfa_code: '123456',
  },
]

export function publicUser(u: MockUser): Usuario {
  const { password: _p, requires_mfa: _m, mfa_code: _c, ...rest } = u
  return rest
}

export function findUserByEmail(email: string): MockUser | undefined {
  const norm = email.trim().toLowerCase()
  return MOCK_USERS.find((u) => u.email.toLowerCase() === norm)
}

export function findUserById(id: number): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

export function nextUserId(): number {
  return Math.max(...MOCK_USERS.map((u) => u.id)) + 1
}

export const ROLES_DISPONIBLES: Rol[] = [
  'ADMINISTRADOR',
  'OFICIAL_CUMPLIMIENTO',
  'COLABORADOR',
  'AUDITOR',
]
