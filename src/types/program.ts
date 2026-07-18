import type { components } from '../api/openapi'

export type Program = components['schemas']['ProgramResponse']
export type ProgramPage = components['schemas']['PageResponseProgramResponse']
export type CreateProgramRequest = components['schemas']['CreateProgramRequest']

export interface ProgramQueryParams {
  keyword?: string
  page?: number
  size?: number
}

