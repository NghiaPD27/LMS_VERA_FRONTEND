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

export const useGetPublicPrograms = (params: ProgramQueryParams = {}) =>
  useQuery({
    queryKey: ['public-programs', params],
    queryFn: () => programApi.getPublicPrograms(params)
  })

export const useGetPublicProgram = (id: number) =>
  useQuery({
    queryKey: ['public-program', id],
    queryFn: () => programApi.getPublicProgram(id),
    enabled: !!id
  })

export const useCreateProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgramRequest) => programApi.createProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      queryClient.invalidateQueries({ queryKey: ['public-programs'] })
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
      queryClient.invalidateQueries({ queryKey: ['public-programs'] })
      queryClient.invalidateQueries({ queryKey: ['public-program', variables.id] })
    }
  })
}

export const useDeleteProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => programApi.deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      queryClient.invalidateQueries({ queryKey: ['public-programs'] })
    }
  })
}
