import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, Plus, Send, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Radio } from '@/components/ui/radio'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WizardProgress } from '@/components/forms/WizardProgress'
import { FileDropzone } from '@/components/forms/FileDropzone'
import { SignatureCanvasField } from '@/components/forms/SignatureCanvas'
import {
  emailSchema,
  phoneMobileSchema,
  phoneResidenceSchema,
  cedulaSchema,
  validarRucDV,
} from '@/lib/validators'
import { getFormularioByToken, submitFormulario } from '@/api/formularios'
import { extractErrorMessage } from '@/api/client'
import type { TipoCliente } from '@/types'

const PROPOSITOS = ['Apertura de cuenta', 'Préstamo', 'Inversión', 'Otro'] as const
const PAISES = ['Panamá', 'Colombia', 'Costa Rica', 'México', 'Estados Unidos', 'España', 'Otro'] as const
const TIPOS_DOC = ['Cédula', 'Pasaporte'] as const
const GENEROS = ['M', 'F', 'OTRO'] as const
const ESTADOS_CIVILES = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'] as const
const TIPOS_EMPRESA = ['S.A.', 'S.R.L.', 'Fundación', 'Otro'] as const
const TIPOS_CONTROL = ['Propiedad', 'Voto', 'Influencia'] as const

const LABELS_NATURAL = [
  'Tipo de cliente',
  'Identificación',
  'Domicilio y contacto',
  'Profesión y fondos',
  'PEP',
  'Referencias',
  'Documentos',
  'Consentimiento',
]

const LABELS_JURIDICA = [
  'Tipo de cliente',
  'Información de empresa',
  'Representante legal',
  'Beneficiarios finales',
  'Domicilio y actividad',
  'PEP',
  'Referencias',
  'Documentos',
  'Consentimiento',
]

const fileSchema = z.instanceof(File, { message: 'Archivo requerido' })
const fileOptionalSchema = z.instanceof(File).optional().nullable()

const referenciaBancariaSchema = z.object({
  banco: z.string().min(1, 'Requerido'),
  cuenta: z.string().min(1, 'Requerido'),
  contacto: z.string().min(1, 'Requerido'),
})

const referenciaContactoSchema = z.object({
  empresa: z.string().min(1, 'Requerido'),
  contacto: z.string().min(1, 'Requerido'),
  telefono: z.string().min(1, 'Requerido'),
})

const pepSchema = z
  .object({
    es_pep: z.enum(['SI', 'NO']),
    familiar_pep: z.enum(['SI', 'NO']),
    asociado_pep: z.enum(['SI', 'NO']),
    cargo_actual: z.string().optional(),
    cargo_anterior: z.string().optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    nombre_pep: z.string().optional(),
    relacion_pep: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const algunoSi =
      data.es_pep === 'SI' || data.familiar_pep === 'SI' || data.asociado_pep === 'SI'
    if (!algunoSi) return
    if (!data.cargo_actual || data.cargo_actual.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['cargo_actual'], message: 'Requerido' })
    }
    if (!data.nombre_pep || data.nombre_pep.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['nombre_pep'], message: 'Requerido' })
    }
    if (!data.relacion_pep || data.relacion_pep.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['relacion_pep'], message: 'Requerido' })
    }
  })

const referenciasSchema = z.object({
  bancarias: z.array(referenciaBancariaSchema).min(1, 'Agrega al menos 1 referencia bancaria'),
  proveedores: z
    .array(referenciaContactoSchema)
    .min(2, 'Agrega al menos 2 referencias de proveedores'),
  clientes: z.array(referenciaContactoSchema).min(2, 'Agrega al menos 2 referencias de clientes'),
})

const consentimientoSchema = z
  .object({
    confirma_veridica: z.boolean(),
    autoriza_verificacion: z.boolean(),
    acepta_terminos: z.boolean(),
    autoriza_datos: z.boolean(),
    declara_cumplimiento: z.boolean(),
    firma: z.string().min(1, 'La firma es requerida'),
  })
  .superRefine((data, ctx) => {
    const keys = [
      'confirma_veridica',
      'autoriza_verificacion',
      'acepta_terminos',
      'autoriza_datos',
      'declara_cumplimiento',
    ] as const
    for (const k of keys) {
      if (!data[k]) {
        ctx.addIssue({ code: 'custom', path: [k], message: 'Debe aceptar' })
      }
    }
  })

const tipoClienteSchema = z.object({
  tipo_cliente: z.enum(['NATURAL', 'JURIDICA']),
  proposito: z.enum(PROPOSITOS),
  pais_operacion: z.enum(PAISES),
})

const identificacionNaturalSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  tipo_documento: z.enum(TIPOS_DOC),
  numero_documento: cedulaSchema,
  fecha_nacimiento: z.string().min(1, 'Requerido'),
  nacionalidad: z.enum(PAISES),
  genero: z.enum(GENEROS),
  estado_civil: z.enum(ESTADOS_CIVILES),
  doc_identidad: fileSchema,
})

const domicilioNaturalSchema = z.object({
  direccion: z.string().min(5, 'Mínimo 5 caracteres'),
  pais_residencia: z.enum(PAISES),
  telefono_residencia: phoneResidenceSchema,
  telefono_movil: phoneMobileSchema,
  email: emailSchema,
})

const profesionSchema = z.object({
  profesion: z.string().min(1, 'Requerido'),
  ocupacion: z.string().min(1, 'Requerido'),
  procedencia_fondos: z.string().min(5, 'Mínimo 5 caracteres'),
  monto_usd: z.coerce.number().nonnegative('Debe ser >= 0'),
})

const documentosNaturalSchema = z.object({
  doc_cedula: fileSchema,
  doc_domicilio: fileSchema,
  doc_estados_financieros: fileOptionalSchema,
  doc_otros: fileOptionalSchema,
})

const empresaSchema = z
  .object({
    nombre_legal: z.string().min(1, 'Requerido'),
    nombre_comercial: z.string().optional(),
    tipo_empresa: z.enum(TIPOS_EMPRESA),
    ruc: z.string().min(1, 'Requerido'),
    dv: z.string().regex(/^\d{1,2}$/, 'DV inválido'),
    aviso_operacion: z.string().min(1, 'Requerido'),
    pais_constitucion: z.enum(PAISES),
    fecha_constitucion: z.string().min(1, 'Requerido'),
    doc_inscripcion: fileSchema,
  })
  .refine((data) => validarRucDV(data.ruc, data.dv), {
    message: 'RUC + DV no coincide (módulo 11)',
    path: ['dv'],
  })

const representanteSchema = z.object({
  rep_nombre: z.string().min(1, 'Requerido'),
  rep_identificacion: cedulaSchema,
  rep_direccion: z.string().min(5, 'Mínimo 5 caracteres'),
  rep_telefono: phoneMobileSchema,
  rep_email: emailSchema,
})

const beneficiarioSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  identificacion: z.string().min(1, 'Requerido'),
  porcentaje: z.coerce.number().min(0).max(100),
  tipo_control: z.enum(TIPOS_CONTROL),
})

const beneficiariosSchema = z
  .object({
    beneficiarios: z.array(beneficiarioSchema).min(1, 'Agrega al menos 1 beneficiario'),
  })
  .refine(
    (data) => data.beneficiarios.reduce((acc, b) => acc + (Number(b.porcentaje) || 0), 0) <= 100,
    {
      message: 'La suma de porcentajes no puede exceder 100%',
      path: ['beneficiarios'],
    },
  )

const domicilioJuridicaSchema = z.object({
  direccion_fisica: z.string().min(5, 'Mínimo 5 caracteres'),
  pais: z.enum(PAISES),
  telefono: phoneMobileSchema,
  actividad_economica: z.string().min(1, 'Requerido'),
  sector: z.string().min(1, 'Requerido'),
})

const documentosJuridicaSchema = z.object({
  doc_ruc: fileSchema,
  doc_aviso_operacion: fileSchema,
  doc_registro_publico: fileSchema,
  doc_estados_financieros: fileSchema,
  doc_poder_representante: fileSchema,
})

type FormValues = {
  tipo_cliente?: TipoCliente
  proposito?: string
  pais_operacion?: string

  nombres?: string
  apellidos?: string
  tipo_documento?: string
  numero_documento?: string
  fecha_nacimiento?: string
  nacionalidad?: string
  genero?: string
  estado_civil?: string
  doc_identidad?: File | null

  direccion?: string
  pais_residencia?: string
  telefono_residencia?: string
  telefono_movil?: string
  email?: string

  profesion?: string
  ocupacion?: string
  procedencia_fondos?: string
  monto_usd?: number | string

  es_pep?: 'SI' | 'NO'
  familiar_pep?: 'SI' | 'NO'
  asociado_pep?: 'SI' | 'NO'
  cargo_actual?: string
  cargo_anterior?: string
  fecha_inicio?: string
  fecha_fin?: string
  nombre_pep?: string
  relacion_pep?: string

  bancarias?: Array<{ banco: string; cuenta: string; contacto: string }>
  proveedores?: Array<{ empresa: string; contacto: string; telefono: string }>
  clientes?: Array<{ empresa: string; contacto: string; telefono: string }>

  doc_cedula?: File | null
  doc_domicilio?: File | null
  doc_estados_financieros?: File | null
  doc_otros?: File | null

  nombre_legal?: string
  nombre_comercial?: string
  tipo_empresa?: string
  ruc?: string
  dv?: string
  aviso_operacion?: string
  pais_constitucion?: string
  fecha_constitucion?: string
  doc_inscripcion?: File | null

  rep_nombre?: string
  rep_identificacion?: string
  rep_direccion?: string
  rep_telefono?: string
  rep_email?: string

  beneficiarios?: Array<{
    nombre: string
    identificacion: string
    porcentaje: number | string
    tipo_control: string
  }>

  direccion_fisica?: string
  pais?: string
  telefono?: string
  actividad_economica?: string
  sector?: string

  doc_ruc?: File | null
  doc_aviso_operacion?: File | null
  doc_registro_publico?: File | null
  doc_poder_representante?: File | null

  confirma_veridica?: boolean
  autoriza_verificacion?: boolean
  acepta_terminos?: boolean
  autoriza_datos?: boolean
  declara_cumplimiento?: boolean
  firma?: string
}

type StepKey =
  | 'tipo'
  | 'identificacion'
  | 'domicilio_natural'
  | 'profesion'
  | 'pep'
  | 'referencias'
  | 'documentos_natural'
  | 'consentimiento'
  | 'empresa'
  | 'representante'
  | 'beneficiarios'
  | 'domicilio_juridica'
  | 'documentos_juridica'

const stepFieldsNatural: Record<number, Array<keyof FormValues>> = {
  0: ['tipo_cliente', 'proposito', 'pais_operacion'],
  1: [
    'nombres',
    'apellidos',
    'tipo_documento',
    'numero_documento',
    'fecha_nacimiento',
    'nacionalidad',
    'genero',
    'estado_civil',
    'doc_identidad',
  ],
  2: ['direccion', 'pais_residencia', 'telefono_residencia', 'telefono_movil', 'email'],
  3: ['profesion', 'ocupacion', 'procedencia_fondos', 'monto_usd'],
  4: [
    'es_pep',
    'familiar_pep',
    'asociado_pep',
    'cargo_actual',
    'cargo_anterior',
    'fecha_inicio',
    'fecha_fin',
    'nombre_pep',
    'relacion_pep',
  ],
  5: ['bancarias', 'proveedores', 'clientes'],
  6: ['doc_cedula', 'doc_domicilio', 'doc_estados_financieros', 'doc_otros'],
  7: [
    'confirma_veridica',
    'autoriza_verificacion',
    'acepta_terminos',
    'autoriza_datos',
    'declara_cumplimiento',
    'firma',
  ],
}

const stepFieldsJuridica: Record<number, Array<keyof FormValues>> = {
  0: ['tipo_cliente', 'proposito', 'pais_operacion'],
  1: [
    'nombre_legal',
    'nombre_comercial',
    'tipo_empresa',
    'ruc',
    'dv',
    'aviso_operacion',
    'pais_constitucion',
    'fecha_constitucion',
    'doc_inscripcion',
  ],
  2: ['rep_nombre', 'rep_identificacion', 'rep_direccion', 'rep_telefono', 'rep_email'],
  3: ['beneficiarios'],
  4: ['direccion_fisica', 'pais', 'telefono', 'actividad_economica', 'sector'],
  5: [
    'es_pep',
    'familiar_pep',
    'asociado_pep',
    'cargo_actual',
    'cargo_anterior',
    'fecha_inicio',
    'fecha_fin',
    'nombre_pep',
    'relacion_pep',
  ],
  6: ['bancarias', 'proveedores', 'clientes'],
  7: [
    'doc_ruc',
    'doc_aviso_operacion',
    'doc_registro_publico',
    'doc_estados_financieros',
    'doc_poder_representante',
  ],
  8: [
    'confirma_veridica',
    'autoriza_verificacion',
    'acepta_terminos',
    'autoriza_datos',
    'declara_cumplimiento',
    'firma',
  ],
}

function stepKeyNatural(index: number): StepKey {
  const map: StepKey[] = [
    'tipo',
    'identificacion',
    'domicilio_natural',
    'profesion',
    'pep',
    'referencias',
    'documentos_natural',
    'consentimiento',
  ]
  return map[index]
}

function stepKeyJuridica(index: number): StepKey {
  const map: StepKey[] = [
    'tipo',
    'empresa',
    'representante',
    'beneficiarios',
    'domicilio_juridica',
    'pep',
    'referencias',
    'documentos_juridica',
    'consentimiento',
  ]
  return map[index]
}

function validateStepWith(values: FormValues, key: StepKey): { ok: boolean; message?: string } {
  try {
    switch (key) {
      case 'tipo':
        tipoClienteSchema.parse(values)
        return { ok: true }
      case 'identificacion':
        identificacionNaturalSchema.parse(values)
        return { ok: true }
      case 'domicilio_natural':
        domicilioNaturalSchema.parse(values)
        return { ok: true }
      case 'profesion':
        profesionSchema.parse(values)
        return { ok: true }
      case 'pep':
        pepSchema.parse(values)
        return { ok: true }
      case 'referencias':
        referenciasSchema.parse({
          bancarias: values.bancarias ?? [],
          proveedores: values.proveedores ?? [],
          clientes: values.clientes ?? [],
        })
        return { ok: true }
      case 'documentos_natural':
        documentosNaturalSchema.parse(values)
        return { ok: true }
      case 'empresa':
        empresaSchema.parse(values)
        return { ok: true }
      case 'representante':
        representanteSchema.parse(values)
        return { ok: true }
      case 'beneficiarios':
        beneficiariosSchema.parse({ beneficiarios: values.beneficiarios ?? [] })
        return { ok: true }
      case 'domicilio_juridica':
        domicilioJuridicaSchema.parse(values)
        return { ok: true }
      case 'documentos_juridica':
        documentosJuridicaSchema.parse(values)
        return { ok: true }
      case 'consentimiento':
        consentimientoSchema.parse(values)
        return { ok: true }
      default:
        return { ok: true }
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0]
      const path = first.path.length > 0 ? `${first.path.join('.')}: ` : ''
      return { ok: false, message: `${path}${first.message}` }
    }
    return { ok: false, message: 'Datos inválidos' }
  }
}

interface TokenState {
  tipo: TipoCliente
  cliente_sugerido: string
}

function defaultValues(): FormValues {
  return {
    proposito: undefined,
    pais_operacion: undefined,
    es_pep: 'NO',
    familiar_pep: 'NO',
    asociado_pep: 'NO',
    bancarias: [{ banco: '', cuenta: '', contacto: '' }],
    proveedores: [
      { empresa: '', contacto: '', telefono: '' },
      { empresa: '', contacto: '', telefono: '' },
    ],
    clientes: [
      { empresa: '', contacto: '', telefono: '' },
      { empresa: '', contacto: '', telefono: '' },
    ],
    beneficiarios: [{ nombre: '', identificacion: '', porcentaje: 0, tipo_control: 'Propiedad' }],
    confirma_veridica: false,
    autoriza_verificacion: false,
    acepta_terminos: false,
    autoriza_datos: false,
    declara_cumplimiento: false,
    firma: '',
  }
}

function getStorageKey(token: string): string {
  return `kyc_${token}`
}

function serializeForStorage(values: FormValues): string {
  const clone: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(values)) {
    if (v instanceof File) continue
    clone[k] = v
  }
  return JSON.stringify(clone)
}

export default function FormularioKYCPage(): JSX.Element {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [tokenInfo, setTokenInfo] = useState<TokenState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const methods = useForm<FormValues>({
    defaultValues: defaultValues(),
    mode: 'onSubmit',
    resolver: zodResolver(z.object({}).passthrough()),
  })

  const { watch, setValue, getValues, register, formState, reset } = methods
  const tipoCliente = (watch('tipo_cliente') as TipoCliente | undefined) ?? tokenInfo?.tipo
  const labels = useMemo(
    () => (tipoCliente === 'JURIDICA' ? LABELS_JURIDICA : LABELS_NATURAL),
    [tipoCliente],
  )
  const totalSteps = labels.length

  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const info = await getFormularioByToken(token!)
        if (cancelled) return
        setTokenInfo({ tipo: info.tipo, cliente_sugerido: info.cliente_sugerido })

        const raw = sessionStorage.getItem(getStorageKey(token!))
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<FormValues>
            reset({ ...defaultValues(), ...parsed, tipo_cliente: info.tipo })
          } catch {
            reset({ ...defaultValues(), tipo_cliente: info.tipo })
          }
        } else {
          setValue('tipo_cliente', info.tipo)
        }
      } catch {
        if (!cancelled) navigate('/no-encontrado', { replace: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token, navigate, reset, setValue])

  useEffect(() => {
    if (!token) return
    const subscription = watch((values) => {
      sessionStorage.setItem(getStorageKey(token), serializeForStorage(values as FormValues))
    })
    return () => subscription.unsubscribe()
  }, [token, watch])

  function getStepKey(index: number): StepKey {
    return tipoCliente === 'JURIDICA' ? stepKeyJuridica(index) : stepKeyNatural(index)
  }

  async function handleNext(): Promise<void> {
    const key = getStepKey(stepIndex)
    const values = getValues()
    const res = validateStepWith(values, key)
    if (!res.ok) {
      toast.error(res.message ?? 'Revisa los campos del paso actual')
      return
    }
    if (stepIndex < totalSteps - 1) {
      setStepIndex((s) => s + 1)
    }
  }

  function handlePrev(): void {
    if (stepIndex > 0) setStepIndex((s) => s - 1)
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!token) return
    const key = getStepKey(stepIndex)
    const res = validateStepWith(values, key)
    if (!res.ok) {
      toast.error(res.message ?? 'Revisa el consentimiento')
      return
    }

    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v instanceof File) {
        payload[k] = { nombre: v.name, tamano: v.size, tipo: v.type }
      } else {
        payload[k] = v
      }
    }
    payload.token = token
    payload.fecha_envio = new Date().toISOString()

    setSubmitting(true)
    try {
      const data = await submitFormulario(token, payload)
      toast.success('Formulario enviado correctamente')
      sessionStorage.removeItem(getStorageKey(token))
      navigate(`/formulario/${token}/exito`, {
        state: { expediente_numero: data.expediente_numero },
      })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando formulario...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto w-full max-w-4xl px-4">
        <header className="mb-6 flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary p-2 text-primary-foreground">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Debida Diligencia</h1>
              <p className="text-xs text-muted-foreground">
                Formulario de Debida Diligencia
                {tokenInfo?.cliente_sugerido ? ` · ${tokenInfo.cliente_sugerido}` : ''}
              </p>
            </div>
          </div>
        </header>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{labels[stepIndex]}</CardTitle>
          </CardHeader>
          <CardContent>
            <WizardProgress current={stepIndex} total={totalSteps} labels={labels} />

            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div key={stepIndex} className="kyc-step-anim">
                <StepBody
                  stepKey={getStepKey(stepIndex)}
                  methods={methods}
                  tipoSugerido={tokenInfo?.tipo}
                />
              </div>

              {formState.errors.root?.message && (
                <p className="text-sm text-red-600">{formState.errors.root.message}</p>
              )}

              <div className="flex flex-col-reverse items-stretch justify-between gap-2 border-t pt-4 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={stepIndex === 0 || submitting}
                >
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </Button>

                {stepIndex < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Siguiente <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Enviar formulario
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  function StepBody({
    stepKey,
    methods,
    tipoSugerido,
  }: {
    stepKey: StepKey
    methods: UseFormReturn<FormValues>
    tipoSugerido?: TipoCliente
  }): JSX.Element {
    void register // ensure imports used in scope
    switch (stepKey) {
      case 'tipo':
        return <StepTipo methods={methods} tipoSugerido={tipoSugerido} />
      case 'identificacion':
        return <StepIdentificacion methods={methods} />
      case 'domicilio_natural':
        return <StepDomicilioNatural methods={methods} />
      case 'profesion':
        return <StepProfesion methods={methods} />
      case 'pep':
        return <StepPEP methods={methods} />
      case 'referencias':
        return <StepReferencias methods={methods} />
      case 'documentos_natural':
        return <StepDocumentosNatural methods={methods} />
      case 'empresa':
        return <StepEmpresa methods={methods} />
      case 'representante':
        return <StepRepresentante methods={methods} />
      case 'beneficiarios':
        return <StepBeneficiarios methods={methods} />
      case 'domicilio_juridica':
        return <StepDomicilioJuridica methods={methods} />
      case 'documentos_juridica':
        return <StepDocumentosJuridica methods={methods} />
      case 'consentimiento':
        return <StepConsentimiento methods={methods} tipoCliente={tipoCliente} />
      default:
        return <></>
    }
  }
}

/* ---------------------- STEPS ---------------------- */

function FieldRow({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function FieldGroup({
  label,
  required,
  htmlFor,
  children,
  hint,
}: {
  label: string
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  hint?: string
}): JSX.Element {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function StepTipo({
  methods,
  tipoSugerido,
}: {
  methods: UseFormReturn<FormValues>
  tipoSugerido?: TipoCliente
}): JSX.Element {
  const { register, watch, setValue } = methods
  const tipo = watch('tipo_cliente') ?? tipoSugerido
  return (
    <div className="space-y-5">
      <FieldGroup label="Tipo de cliente" required>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Radio
              name="tipo_cliente"
              value="NATURAL"
              checked={tipo === 'NATURAL'}
              onChange={() => setValue('tipo_cliente', 'NATURAL')}
            />
            Persona Natural
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Radio
              name="tipo_cliente"
              value="JURIDICA"
              checked={tipo === 'JURIDICA'}
              onChange={() => setValue('tipo_cliente', 'JURIDICA')}
            />
            Persona Jurídica
          </label>
        </div>
      </FieldGroup>

      <FieldRow>
        <FieldGroup label="Propósito de la relación" required htmlFor="proposito">
          <Select id="proposito" {...register('proposito')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PROPOSITOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="País de operación" required htmlFor="pais_operacion">
          <Select id="pais_operacion" {...register('pais_operacion')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </FieldRow>
    </div>
  )
}

function StepIdentificacion({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { register, watch, setValue } = methods
  const docFile = watch('doc_identidad') as File | null | undefined
  return (
    <div className="space-y-5">
      <FieldRow>
        <FieldGroup label="Nombres" required htmlFor="nombres">
          <Input id="nombres" {...register('nombres')} />
        </FieldGroup>
        <FieldGroup label="Apellidos" required htmlFor="apellidos">
          <Input id="apellidos" {...register('apellidos')} />
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <FieldGroup label="Tipo de documento" required htmlFor="tipo_documento">
          <Select id="tipo_documento" {...register('tipo_documento')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {TIPOS_DOC.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup
          label="Número de documento"
          required
          htmlFor="numero_documento"
          hint="Ejemplo: 8-893-602"
        >
          <Input id="numero_documento" {...register('numero_documento')} />
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <FieldGroup label="Fecha de nacimiento" required htmlFor="fecha_nacimiento">
          <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
        </FieldGroup>
        <FieldGroup label="Nacionalidad" required htmlFor="nacionalidad">
          <Select id="nacionalidad" {...register('nacionalidad')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </FieldRow>

      <FieldGroup label="Género" required>
        <div className="flex flex-wrap gap-4">
          {GENEROS.map((g) => (
            <label key={g} className="flex items-center gap-2 text-sm">
              <Radio value={g} {...register('genero')} /> {g === 'M' ? 'Masculino' : g === 'F' ? 'Femenino' : 'Otro'}
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Estado civil" required htmlFor="estado_civil">
        <Select id="estado_civil" {...register('estado_civil')} defaultValue="">
          <option value="" disabled>
            Selecciona...
          </option>
          {ESTADOS_CIVILES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FileDropzone
        label="Documento de identidad (PDF/JPG/PNG)"
        required
        value={docFile ?? null}
        onChange={(f) => setValue('doc_identidad', f)}
      />
    </div>
  )
}

function StepDomicilioNatural({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { register } = methods
  return (
    <div className="space-y-5">
      <FieldGroup label="Dirección" required htmlFor="direccion">
        <Textarea id="direccion" rows={3} {...register('direccion')} />
      </FieldGroup>
      <FieldRow>
        <FieldGroup label="País de residencia" required htmlFor="pais_residencia">
          <Select id="pais_residencia" {...register('pais_residencia')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Teléfono residencia" htmlFor="telefono_residencia" hint="Opcional · 2XX-XXXX">
          <Input id="telefono_residencia" {...register('telefono_residencia')} placeholder="269-1234" />
        </FieldGroup>
      </FieldRow>
      <FieldRow>
        <FieldGroup label="Teléfono móvil" required htmlFor="telefono_movil" hint="Formato 6XXX-XXXX">
          <Input id="telefono_movil" {...register('telefono_movil')} placeholder="6123-4567" />
        </FieldGroup>
        <FieldGroup label="Email" required htmlFor="email">
          <Input id="email" type="email" {...register('email')} />
        </FieldGroup>
      </FieldRow>
    </div>
  )
}

function StepProfesion({ methods }: { methods: UseFormReturn<FormValues> }): JSX.Element {
  const { register, watch } = methods
  const monto = Number(watch('monto_usd') ?? 0)
  return (
    <div className="space-y-5">
      <FieldRow>
        <FieldGroup label="Profesión" required htmlFor="profesion">
          <Input id="profesion" {...register('profesion')} />
        </FieldGroup>
        <FieldGroup label="Ocupación actual" required htmlFor="ocupacion">
          <Input id="ocupacion" {...register('ocupacion')} />
        </FieldGroup>
      </FieldRow>
      <FieldGroup label="Procedencia de fondos" required htmlFor="procedencia_fondos">
        <Textarea
          id="procedencia_fondos"
          rows={3}
          {...register('procedencia_fondos')}
          placeholder="Describe el origen de los fondos (salario, inversiones, herencias, etc.)"
        />
      </FieldGroup>
      <FieldGroup label="Monto estimado (USD)" required htmlFor="monto_usd">
        <Input id="monto_usd" type="number" min={0} step="0.01" {...register('monto_usd')} />
      </FieldGroup>
      {monto >= 10000 && (
        <Alert variant="warning">
          <AlertTitle>Monto sujeto a revisión</AlertTitle>
          <AlertDescription>
            Los montos iguales o superiores a USD 10,000.00 serán revisados manualmente por el
            oficial de cumplimiento.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function YesNo({
  name,
  register,
  value,
}: {
  name: keyof FormValues
  register: UseFormReturn<FormValues>['register']
  value: string | undefined
}): JSX.Element {
  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm">
        <Radio value="SI" {...register(name)} defaultChecked={value === 'SI'} /> Sí
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Radio value="NO" {...register(name)} defaultChecked={value !== 'SI'} /> No
      </label>
    </div>
  )
}

function StepPEP({ methods }: { methods: UseFormReturn<FormValues> }): JSX.Element {
  const { register, watch } = methods
  const esPep = watch('es_pep')
  const familiar = watch('familiar_pep')
  const asociado = watch('asociado_pep')
  const algunoSi = esPep === 'SI' || familiar === 'SI' || asociado === 'SI'

  return (
    <div className="space-y-5">
      <FieldGroup label="¿Es usted una Persona Expuesta Políticamente (PEP)?" required>
        <YesNo name="es_pep" register={register} value={esPep} />
      </FieldGroup>
      <FieldGroup label="¿Tiene un familiar cercano que sea PEP?" required>
        <YesNo name="familiar_pep" register={register} value={familiar} />
      </FieldGroup>
      <FieldGroup label="¿Tiene un asociado cercano que sea PEP?" required>
        <YesNo name="asociado_pep" register={register} value={asociado} />
      </FieldGroup>

      {algunoSi && (
        <div className="space-y-4 rounded-md border bg-muted/20 p-4">
          <p className="text-sm font-medium">Información del PEP relacionado</p>
          <FieldRow>
            <FieldGroup label="Cargo actual" required htmlFor="cargo_actual">
              <Input id="cargo_actual" {...register('cargo_actual')} />
            </FieldGroup>
            <FieldGroup label="Cargo anterior" htmlFor="cargo_anterior">
              <Input id="cargo_anterior" {...register('cargo_anterior')} />
            </FieldGroup>
          </FieldRow>
          <FieldRow>
            <FieldGroup label="Fecha inicio" htmlFor="fecha_inicio">
              <Input id="fecha_inicio" type="date" {...register('fecha_inicio')} />
            </FieldGroup>
            <FieldGroup label="Fecha fin" htmlFor="fecha_fin">
              <Input id="fecha_fin" type="date" {...register('fecha_fin')} />
            </FieldGroup>
          </FieldRow>
          <FieldRow>
            <FieldGroup label="Nombre del PEP" required htmlFor="nombre_pep">
              <Input id="nombre_pep" {...register('nombre_pep')} />
            </FieldGroup>
            <FieldGroup label="Relación / parentesco" required htmlFor="relacion_pep">
              <Input id="relacion_pep" {...register('relacion_pep')} />
            </FieldGroup>
          </FieldRow>
        </div>
      )}
    </div>
  )
}

function StepReferencias({ methods }: { methods: UseFormReturn<FormValues> }): JSX.Element {
  const { register, control } = methods
  const bancarias = useFieldArray({ control, name: 'bancarias' })
  const proveedores = useFieldArray({ control, name: 'proveedores' })
  const clientes = useFieldArray({ control, name: 'clientes' })

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Referencias bancarias (mín. 1)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => bancarias.append({ banco: '', cuenta: '', contacto: '' })}
          >
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
        {bancarias.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Banco" {...register(`bancarias.${i}.banco` as const)} />
            <Input placeholder="N° de cuenta" {...register(`bancarias.${i}.cuenta` as const)} />
            <Input placeholder="Contacto" {...register(`bancarias.${i}.contacto` as const)} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar referencia"
              onClick={() => bancarias.remove(i)}
              disabled={bancarias.fields.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Referencias de proveedores (mín. 2)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => proveedores.append({ empresa: '', contacto: '', telefono: '' })}
          >
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
        {proveedores.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Empresa" {...register(`proveedores.${i}.empresa` as const)} />
            <Input placeholder="Contacto" {...register(`proveedores.${i}.contacto` as const)} />
            <Input placeholder="Teléfono" {...register(`proveedores.${i}.telefono` as const)} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar referencia"
              onClick={() => proveedores.remove(i)}
              disabled={proveedores.fields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Referencias de clientes (mín. 2)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => clientes.append({ empresa: '', contacto: '', telefono: '' })}
          >
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
        {clientes.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Empresa" {...register(`clientes.${i}.empresa` as const)} />
            <Input placeholder="Contacto" {...register(`clientes.${i}.contacto` as const)} />
            <Input placeholder="Teléfono" {...register(`clientes.${i}.telefono` as const)} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar referencia"
              onClick={() => clientes.remove(i)}
              disabled={clientes.fields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </section>
    </div>
  )
}

function StepDocumentosNatural({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { watch, setValue } = methods
  return (
    <div className="space-y-4">
      <FileDropzone
        label="Copia de cédula / pasaporte"
        required
        value={(watch('doc_cedula') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_cedula', f)}
      />
      <FileDropzone
        label="Comprobante de domicilio"
        required
        value={(watch('doc_domicilio') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_domicilio', f)}
      />
      <FileDropzone
        label="Estados financieros (opcional)"
        value={(watch('doc_estados_financieros') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_estados_financieros', f)}
      />
      <FileDropzone
        label="Otros documentos (opcional)"
        value={(watch('doc_otros') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_otros', f)}
      />
    </div>
  )
}

function StepEmpresa({ methods }: { methods: UseFormReturn<FormValues> }): JSX.Element {
  const { register, watch, setValue } = methods
  return (
    <div className="space-y-5">
      <FieldRow>
        <FieldGroup label="Nombre legal" required htmlFor="nombre_legal">
          <Input id="nombre_legal" {...register('nombre_legal')} />
        </FieldGroup>
        <FieldGroup label="Nombre comercial" htmlFor="nombre_comercial">
          <Input id="nombre_comercial" {...register('nombre_comercial')} />
        </FieldGroup>
      </FieldRow>
      <FieldRow>
        <FieldGroup label="Tipo de empresa" required htmlFor="tipo_empresa">
          <Select id="tipo_empresa" {...register('tipo_empresa')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {TIPOS_EMPRESA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <FieldGroup label="RUC" required htmlFor="ruc">
            <Input id="ruc" {...register('ruc')} placeholder="155677123-2-2025" />
          </FieldGroup>
          <FieldGroup label="DV" required htmlFor="dv">
            <Input id="dv" {...register('dv')} maxLength={2} placeholder="00" />
          </FieldGroup>
        </div>
      </FieldRow>
      <FieldGroup label="Aviso de operación" required htmlFor="aviso_operacion">
        <Input id="aviso_operacion" {...register('aviso_operacion')} />
      </FieldGroup>
      <FieldRow>
        <FieldGroup label="País de constitución" required htmlFor="pais_constitucion">
          <Select id="pais_constitucion" {...register('pais_constitucion')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Fecha de constitución" required htmlFor="fecha_constitucion">
          <Input id="fecha_constitucion" type="date" {...register('fecha_constitucion')} />
        </FieldGroup>
      </FieldRow>
      <FileDropzone
        label="Documento de inscripción"
        required
        value={(watch('doc_inscripcion') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_inscripcion', f)}
      />
    </div>
  )
}

function StepRepresentante({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { register } = methods
  return (
    <div className="space-y-5">
      <FieldGroup label="Nombre completo" required htmlFor="rep_nombre">
        <Input id="rep_nombre" {...register('rep_nombre')} />
      </FieldGroup>
      <FieldRow>
        <FieldGroup label="Identificación" required htmlFor="rep_identificacion">
          <Input id="rep_identificacion" {...register('rep_identificacion')} placeholder="8-893-602" />
        </FieldGroup>
        <FieldGroup label="Teléfono" required htmlFor="rep_telefono">
          <Input id="rep_telefono" {...register('rep_telefono')} placeholder="6123-4567" />
        </FieldGroup>
      </FieldRow>
      <FieldGroup label="Dirección" required htmlFor="rep_direccion">
        <Textarea id="rep_direccion" rows={3} {...register('rep_direccion')} />
      </FieldGroup>
      <FieldGroup label="Email" required htmlFor="rep_email">
        <Input id="rep_email" type="email" {...register('rep_email')} />
      </FieldGroup>
    </div>
  )
}

function StepBeneficiarios({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { register, control, watch } = methods
  const beneficiarios = useFieldArray({ control, name: 'beneficiarios' })
  const items = (watch('beneficiarios') ?? []) as FormValues['beneficiarios']
  const total = (items ?? []).reduce((acc, b) => acc + (Number(b.porcentaje) || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Beneficiarios finales (mín. 1)</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            beneficiarios.append({
              nombre: '',
              identificacion: '',
              porcentaje: 0,
              tipo_control: 'Propiedad',
            })
          }
        >
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>
      {beneficiarios.fields.map((f, i) => (
        <div
          key={f.id}
          className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1.4fr_1fr_120px_140px_auto]"
        >
          <Input placeholder="Nombre" {...register(`beneficiarios.${i}.nombre` as const)} />
          <Input
            placeholder="Identificación"
            {...register(`beneficiarios.${i}.identificacion` as const)}
          />
          <Input
            type="number"
            min={0}
            max={100}
            step="0.01"
            placeholder="%"
            {...register(`beneficiarios.${i}.porcentaje` as const)}
          />
          <Select {...register(`beneficiarios.${i}.tipo_control` as const)} defaultValue="Propiedad">
            {TIPOS_CONTROL.map((tc) => (
              <option key={tc} value={tc}>
                {tc}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar beneficiario"
            onClick={() => beneficiarios.remove(i)}
            disabled={beneficiarios.fields.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-end text-sm">
        <span
          className={
            total > 100
              ? 'font-semibold text-red-600'
              : 'font-medium text-muted-foreground'
          }
        >
          Suma de participación: {total.toFixed(2)}%
        </span>
      </div>
      {total > 100 && (
        <Alert variant="destructive">
          <AlertDescription>La suma de participación no puede exceder 100%.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function StepDomicilioJuridica({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { register } = methods
  return (
    <div className="space-y-5">
      <FieldGroup label="Dirección física" required htmlFor="direccion_fisica">
        <Textarea id="direccion_fisica" rows={3} {...register('direccion_fisica')} />
      </FieldGroup>
      <FieldRow>
        <FieldGroup label="País" required htmlFor="pais">
          <Select id="pais" {...register('pais')} defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Teléfono" required htmlFor="telefono" hint="Formato 6XXX-XXXX">
          <Input id="telefono" {...register('telefono')} placeholder="6123-4567" />
        </FieldGroup>
      </FieldRow>
      <FieldRow>
        <FieldGroup label="Actividad económica" required htmlFor="actividad_economica">
          <Input id="actividad_economica" {...register('actividad_economica')} />
        </FieldGroup>
        <FieldGroup label="Sector" required htmlFor="sector">
          <Input id="sector" {...register('sector')} />
        </FieldGroup>
      </FieldRow>
    </div>
  )
}

function StepDocumentosJuridica({
  methods,
}: {
  methods: UseFormReturn<FormValues>
}): JSX.Element {
  const { watch, setValue } = methods
  return (
    <div className="space-y-4">
      <FileDropzone
        label="RUC"
        required
        value={(watch('doc_ruc') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_ruc', f)}
      />
      <FileDropzone
        label="Aviso de operación"
        required
        value={(watch('doc_aviso_operacion') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_aviso_operacion', f)}
      />
      <FileDropzone
        label="Registro público"
        required
        value={(watch('doc_registro_publico') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_registro_publico', f)}
      />
      <FileDropzone
        label="Estados financieros"
        required
        value={(watch('doc_estados_financieros') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_estados_financieros', f)}
      />
      <FileDropzone
        label="Poder del representante legal"
        required
        value={(watch('doc_poder_representante') as File | null | undefined) ?? null}
        onChange={(f) => setValue('doc_poder_representante', f)}
      />
    </div>
  )
}

function StepConsentimiento({
  methods,
  tipoCliente,
}: {
  methods: UseFormReturn<FormValues>
  tipoCliente?: TipoCliente
}): JSX.Element {
  const { register, setValue, watch } = methods
  const fecha = new Date().toLocaleDateString('es-PA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const items: Array<{ name: keyof FormValues; label: string }> = [
    { name: 'confirma_veridica', label: 'Confirmo que la información proporcionada es verídica.' },
    {
      name: 'autoriza_verificacion',
      label: 'Autorizo la verificación de mis datos con terceros.',
    },
    { name: 'acepta_terminos', label: 'Acepto los términos y condiciones.' },
    {
      name: 'autoriza_datos',
      label: 'Autorizo el tratamiento de mis datos personales conforme a la ley.',
    },
    {
      name: 'declara_cumplimiento',
      label: 'Declaro conocer las obligaciones de cumplimiento aplicables.',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {items.map((item) => (
          <label key={item.name} className="flex items-start gap-3 text-sm">
            <Checkbox className="mt-0.5" {...register(item.name)} />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label required>
          Firma {tipoCliente === 'JURIDICA' ? 'del Representante Legal' : 'del Titular'}
        </Label>
        <SignatureCanvasField onChange={(dataUrl) => setValue('firma', dataUrl ?? '')} />
        {watch('firma') ? (
          <p className="text-xs text-green-700">Firma registrada.</p>
        ) : (
          <p className="text-xs text-muted-foreground">Dibuja tu firma en el recuadro.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Fecha del consentimiento: {fecha}</p>
    </div>
  )
}
