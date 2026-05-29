import { z } from 'zod'

/* ---------- Validaciones panameñas ---------- */

/** Móvil panameño: comienza con 6 + 3 dígitos + guion + 4 dígitos. Ej: 6123-4567 */
export const phoneMobilePanamaRegex = /^6\d{3}-\d{4}$/

/** Cédula panameña aproximada (formato N-NNNN-NNNNN o variantes con letras provinciales) */
export const cedulaPanamaRegex = /^(PE|E|N|\d{1,2})-?\d{1,4}-?\d{1,6}$/

/** Pasaporte alfanumérico 6-12 caracteres */
export const passportRegex = /^[A-Z0-9]{6,12}$/i

/** Email RFC 5322 simplificado */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validación del RUC panameño + DV (Dígito Verificador).
 * Algoritmo módulo 11 sobre los dígitos del RUC.
 */
export function validarRucDV(ruc: string, dv: string): boolean {
  const digits = ruc.replace(/\D/g, '')
  if (digits.length === 0 || digits.length > 20) return false
  if (!/^\d{1,2}$/.test(dv)) return false

  const pesos = [2, 3, 4, 5, 6, 7]
  let suma = 0
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[digits.length - 1 - i], 10)
    suma += d * pesos[i % pesos.length]
  }
  const resto = suma % 11
  const dvCalc = resto < 2 ? 0 : 11 - resto
  return dvCalc === parseInt(dv, 10)
}

/* ---------- Zod schemas reutilizables ---------- */

export const emailSchema = z.string().min(1, 'Requerido').regex(emailRegex, 'Email inválido')

export const phoneMobileSchema = z
  .string()
  .regex(phoneMobilePanamaRegex, 'Formato: 6XXX-XXXX')

export const phoneResidenceSchema = z
  .string()
  .regex(/^\d{3}-?\d{4}$/, 'Formato: 2XX-XXXX')
  .optional()
  .or(z.literal(''))

export const cedulaSchema = z
  .string()
  .regex(cedulaPanamaRegex, 'Cédula inválida')

export const rucWithDvSchema = z
  .object({
    ruc: z.string().min(1, 'RUC requerido'),
    dv: z.string().regex(/^\d{1,2}$/, 'DV inválido'),
  })
  .refine((data) => validarRucDV(data.ruc, data.dv), {
    message: 'RUC + DV no coincide (módulo 11)',
    path: ['dv'],
  })

/* ---------- File validators ---------- */

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ALLOWED_DOC_MIME = ['application/pdf', 'image/jpeg', 'image/png']

export function validateDocFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) return `Máximo ${MAX_FILE_SIZE_MB}MB`
  if (!ALLOWED_DOC_MIME.includes(file.type)) return 'Solo PDF/JPG/PNG'
  return null
}
