import type MockAdapter from 'axios-mock-adapter'
import { registrarHandlersFormularios } from './handlers/formularios'

export function registrarHandlers(mock: MockAdapter): void {
  registrarHandlersFormularios(mock)
}
