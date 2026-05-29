import type MockAdapter from 'axios-mock-adapter'
import type { AxiosRequestConfig } from 'axios'
import { store } from '../store'
import { delay, getNumberParam, jsonOk, paginate } from '../utils'

const AUD_LIST_RE = /^\/api\/auditoria\/logs\/?$/
const AUD_LIST_ALT_RE = /^\/api\/auditoria\/?$/

export function registerAuditoriaHandlers(mock: MockAdapter): void {
  const handler = async (config: AxiosRequestConfig) => {
    await delay()
    const page = getNumberParam(config, 'page', 1)
    const pageSize = getNumberParam(config, 'page_size', 50)
    return jsonOk(paginate(store.auditLogs, page, pageSize))
  }
  mock.onGet(AUD_LIST_RE).reply(handler)
  mock.onGet(AUD_LIST_ALT_RE).reply(handler)
}
