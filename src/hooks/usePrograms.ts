import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { programApi } from '../api/programApi'
import type { CreateProgramRequest, ProgramQueryParams } from '../types/program'

export const useGetPrograms = (params: ProgramQueryParams = {}) =>
  useQuery({
    queryKey: ['programs', params],
    queryFn: () => programApi.getPrograms(params)
  })

export const useGetProgram = (id: number) =>
  useQuery({
    queryKey: ['program', id],
    queryFn: () => programApi.getProgram(id),
    enabled: !!id
  })

export const useCreateProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgramRequest) => programApi.createProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    }
  })
}

export const useUpdateProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProgramRequest }) =>
      programApi.updateProgram(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      queryClient.invalidateQueries({ queryKey: ['program', variables.id] })
    }
  })
}

export const useDeleteProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => programApi.deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    }
  })
}
