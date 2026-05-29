import type MockAdapter from 'axios-mock-adapter'
import type { TipoAlerta } from '@/types'
import { getAlertas } from '../store'
import { delay, getParam, jsonOk } from '../utils'

const TIPOS_VALIDOS: TipoAlerta[] = ['RENOVACION', 'ALTO_RIESGO', 'DOC_PENDIENTE']

export function registerAlertasHandlers(mock: MockAdapter): void {
  mock.onGet('/api/alertas/').reply(async (config) => {
    await delay()
    const tipo = getParam(config, 'tipo') as TipoAlerta | undefined
    let alertas = getAlertas()
    if (tipo && TIPOS_VALIDOS.includes(tipo)) {
      alertas = alertas.filter((a) => a.tipo === tipo)
    }
    return jsonOk(alertas)
  })

  mock.onGet('/api/alertas/recientes/').reply(async () => {
    await delay(120)
    return jsonOk(getAlertas().slice(0, 5))
  })
}
