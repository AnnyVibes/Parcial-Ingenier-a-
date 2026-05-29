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
