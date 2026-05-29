import type MockAdapter from 'axios-mock-adapter'
import type { EstadoExpediente, NivelRiesgo, Observacion } from '@/types'
import {
  issueAccessForm,
  recordActividad,
  recordAudit,
  store,
  userFromToken,
} from '../store'
import {
  currentAuthHeader,
  delay,
  extractIdFromUrl,
  getNumberParam,
  getParam,
  jsonOk,
  paginate,
  parseBody,
} from '../utils'

const EXP_LIST_RE = /^\/api\/expedientes\/$/
const EXP_DETAIL_RE = /^\/api\/expedientes\/(\d+)\/$/
const EXP_ESTADO_RE = /^\/api\/expedientes\/(\d+)\/estado\/$/
const EXP_ACCESO_RE = /^\/api\/expedientes\/(\d+)\/generar-acceso\/$/
const EXP_RECALC_RE = /^\/api\/expedientes\/(\d+)\/recalcular-riesgo\/$/
const EXP_DOCS_RE = /^\/api\/expedientes\/(\d+)\/documentos\/$/
const EXP_HIST_RE = /^\/api\/expedientes\/(\d+)\/historial\/$/
const EXP_OBS_RE = /^\/api\/expedientes\/(\d+)\/observaciones\/$/

function nivelFromScore(score: number): NivelRiesgo {
  if (score < 33) return 'BAJO'
  if (score < 66) return 'MEDIO'
  return 'ALTO'
}

export function registerExpedientesHandlers(mock: MockAdapter): void {
  // Listado
  mock.onGet(EXP_LIST_RE).reply(async (config) => {
    await delay()
    const search = getParam(config, 'search')?.toLowerCase()
    const estado = getParam(config, 'estado') as EstadoExpediente | undefined
    const riesgo = getParam(config, 'riesgo')?.toUpperCase() as NivelRiesgo | undefined
    const page = getNumberParam(config, 'page', 1)
    const pageSize = getNumberParam(config, 'page_size', 20)

    let list = [...store.expedientes]
    if (search) {
      list = list.filter(
        (e) =>
          e.nombre_razon_social.toLowerCase().includes(search) ||
          (e.codigo ?? '').toLowerCase().includes(search) ||
          String(e.id).includes(search),
      )
    }
    if (estado) list = list.filter((e) => e.estado === estado)
    if (riesgo) list = list.filter((e) => e.nivel_riesgo === riesgo)
    list.sort((a, b) => b.id - a.id)
    return jsonOk(paginate(list, page, pageSize))
  })

  // Detalle
  mock.onGet(EXP_DETAIL_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_DETAIL_RE)
    const exp = store.expedientes.find((e) => e.id === id)
    if (!exp) return [404, { detail: 'Expediente no encontrado' }]
    return jsonOk(exp)
  })

  // Cambiar estado
  mock.onPatch(EXP_ESTADO_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_ESTADO_RE)
    const exp = store.expedientes.find((e) => e.id === id)
    if (!exp) return [404, { detail: 'Expediente no encontrado' }]
    const body = parseBody<{ estado?: EstadoExpediente; observacion?: string }>(config.data)
    if (!body.estado) return [400, { detail: 'Estado requerido' }]
    const user = userFromToken(currentAuthHeader(config))
    const prev = exp.estado
    exp.estado = body.estado
    if (body.estado === 'APROBADO') {
      const ahora = new Date()
      exp.ultima_renovacion = ahora.toISOString()
      const prox = new Date(ahora)
      prox.setUTCFullYear(prox.getUTCFullYear() + 1)
      exp.proxima_renovacion = prox.toISOString()
    }
    const histList = store.historial[exp.id] ?? []
    histList.push({
      id: Date.now(),
      fecha: new Date().toISOString(),
      estado: body.estado,
      usuario: user?.nombre ?? 'sistema',
      notas: body.observacion,
    })
    store.historial[exp.id] = histList
    recordActividad(user?.nombre ?? 'sistema', `Cambió estado de ${exp.codigo} a ${body.estado}`)
    recordAudit(user?.nombre ?? 'sistema', 'CAMBIO_ESTADO', exp.id, {
      estado_anterior: prev,
      estado_nuevo: body.estado,
      observacion: body.observacion,
    })
    return jsonOk(exp)
  })

  // Generar acceso
  mock.onPost(EXP_ACCESO_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_ACCESO_RE)
    const exp = store.expedientes.find((e) => e.id === id)
    if (!exp) return [404, { detail: 'Expediente no encontrado' }]
    const acceso = issueAccessForm(exp.id)
    const user = userFromToken(currentAuthHeader(config))
    recordActividad(user?.nombre ?? 'sistema', `Generó acceso al formulario para ${exp.codigo}`)
    return jsonOk(acceso)
  })

  // Recalcular riesgo
  mock.onPost(EXP_RECALC_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_RECALC_RE)
    const exp = store.expedientes.find((e) => e.id === id)
    if (!exp) return [404, { detail: 'Expediente no encontrado' }]
    const base = exp.score_riesgo ?? 30
    const delta = Math.floor(Math.random() * 21) - 10
    const newScore = Math.max(0, Math.min(100, base + delta))
    exp.score_riesgo = newScore
    exp.nivel_riesgo = nivelFromScore(newScore)
    const user = userFromToken(currentAuthHeader(config))
    recordActividad(user?.nombre ?? 'sistema', `Recalculó riesgo de ${exp.codigo}`)
    recordAudit(user?.nombre ?? 'sistema', 'RECALCULAR_RIESGO', exp.id, {
      score_anterior: base,
      score_nuevo: newScore,
    })
    return jsonOk(exp)
  })

  // Documentos
  mock.onGet(EXP_DOCS_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_DOCS_RE)
    if (id === null) return [400, { detail: 'ID inválido' }]
    return jsonOk(store.documentos[id] ?? [])
  })

  // Historial
  mock.onGet(EXP_HIST_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_HIST_RE)
    if (id === null) return [400, { detail: 'ID inválido' }]
    return jsonOk(store.historial[id] ?? [])
  })

  // Observaciones GET
  mock.onGet(EXP_OBS_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_OBS_RE)
    if (id === null) return [400, { detail: 'ID inválido' }]
    return jsonOk(store.observaciones[id] ?? [])
  })

  // Observaciones POST
  mock.onPost(EXP_OBS_RE).reply(async (config) => {
    await delay()
    const id = extractIdFromUrl(config.url, EXP_OBS_RE)
    if (id === null) return [400, { detail: 'ID inválido' }]
    const exp = store.expedientes.find((e) => e.id === id)
    if (!exp) return [404, { detail: 'Expediente no encontrado' }]
    const body = parseBody<{ texto?: string }>(config.data)
    if (!body.texto || body.texto.trim().length < 2) {
      return [400, { detail: 'La observación es muy corta' }]
    }
    const user = userFromToken(currentAuthHeader(config))
    const obs: Observacion = {
      id: ++store.nextObservacionId,
      autor: user?.nombre ?? 'anónimo',
      fecha: new Date().toISOString(),
      texto: body.texto.trim(),
    }
    const list = store.observaciones[id] ?? []
    list.unshift(obs)
    store.observaciones[id] = list
    recordActividad(user?.nombre ?? 'sistema', `Agregó observación en ${exp.codigo}`)
    recordAudit(user?.nombre ?? 'sistema', 'CREAR_OBSERVACION', exp.id, { texto: obs.texto })
    return jsonOk(obs, 201)
  })
}
