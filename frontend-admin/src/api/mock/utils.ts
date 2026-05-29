import type { AxiosRequestConfig } from 'axios'

export function delay(ms?: number): Promise<void> {
  const wait = ms ?? 150 + Math.floor(Math.random() * 250)
  return new Promise((resolve) => setTimeout(resolve, wait))
}

export function jsonOk<T>(data: T, status = 200): [number, T] {
  return [status, data]
}

export function parseBody<T extends Record<string, unknown>>(data: unknown): T {
  if (!data) return {} as T
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T
    } catch {
      return {} as T
    }
  }
  return data as T
}

export function currentAuthHeader(config: AxiosRequestConfig): string | undefined {
  const headers = config.headers as Record<string, unknown> | undefined
  if (!headers) return undefined
  const raw = headers.Authorization ?? headers.authorization
  return typeof raw === 'string' ? raw : undefined
}

export function getParam(config: AxiosRequestConfig, key: string): string | undefined {
  const params = (config.params ?? {}) as Record<string, unknown>
  const v = params[key]
  if (v === undefined || v === null || v === '') return undefined
  return String(v)
}

export function getNumberParam(
  config: AxiosRequestConfig,
  key: string,
  fallback: number,
): number {
  const v = getParam(config, key)
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    count: items.length,
    next: end < items.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: items.slice(start, end),
  }
}

export function extractIdFromUrl(url: string | undefined, pattern: RegExp): number | null {
  if (!url) return null
  const match = pattern.exec(url)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}
