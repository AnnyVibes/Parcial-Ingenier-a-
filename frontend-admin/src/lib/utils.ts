import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return '-'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '-'
  const date = d.toLocaleDateString('es-PA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  if (!withTime) return date
  const time = d.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

export function formatRelativeTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const diffMs = Date.now() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'hace unos segundos'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `hace ${diffHr} h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `hace ${diffDay} d`
  return formatDate(d)
}

export function debounce<F extends (...args: never[]) => unknown>(
  fn: F,
  ms: number,
): (...args: Parameters<F>) => void {
  let t: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
