import { installMockAdapter } from './setup'

export const MOCK_ENABLED: boolean =
  String(import.meta.env.VITE_USE_MOCK ?? '').toLowerCase() === 'true'

let bootstrapped = false

export function bootstrapMockBackend(): void {
  if (!MOCK_ENABLED || bootstrapped) return
  installMockAdapter()
  bootstrapped = true
  // eslint-disable-next-line no-console
  console.info(
    '%c[MOCK]%c Modo demo activo — backend simulado. Para desactivar: VITE_USE_MOCK=false',
    'background:#16a34a;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold',
    'color:#16a34a',
  )
}
