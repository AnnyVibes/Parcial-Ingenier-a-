export type TipoCliente = 'NATURAL' | 'JURIDICA'

export type EstadoFormulario = 'PENDIENTE' | 'ENVIADO' | 'USADO' | 'EXPIRADO'

export interface TokenInfo {
  token: string
  valido: boolean
  estado: EstadoFormulario
  tipo_sugerido?: TipoCliente
  expira_en: string | null
}

export interface SubmitResult {
  ok: boolean
  expediente_id: number
  expediente_numero: string
  codigo: string
}

export interface PersonaNatural {
  nombres: string
  apellidos: string
  cedula_pasaporte: string
  fecha_nacimiento: string
  nacionalidad: string
  genero: 'M' | 'F' | 'OTRO'
  estado_civil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'UNION_LIBRE'
}

export interface PersonaJuridica {
  nombre_legal: string
  nombre_comercial?: string
  tipo_entidad: string
  ruc: string
  dv: string
  aviso_operacion: string
  pais_constitucion: string
  fecha_constitucion: string
}
