import { http } from './client'
import type { Program, CreateProgramRequest, ProgramPage, ProgramQueryParams } from '../types/program'

export const programApi = {
  getPrograms: async (params: ProgramQueryParams = {}): Promise<ProgramPage> => {
    const response = await http.get('/programs', { params })
    return response.data
  },

  createProgram: async (data: CreateProgramRequest): Promise<Program> => {
    const response = await http.post('/programs', data)
    return response.data
  },

  getProgram: async (id: number): Promise<Program> => {
    const response = await http.get(`/programs/${id}`)
    return response.data
  },

  updateProgram: async (id: number, data: CreateProgramRequest): Promise<Program> => {
    const response = await http.put(`/programs/${id}`, data)
    return response.data
  },

  deleteProgram: async (id: number): Promise<void> => {
    await http.delete(`/programs/${id}`)
  }
}
