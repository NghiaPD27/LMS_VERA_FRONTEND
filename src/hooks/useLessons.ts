import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi } from '../api/lessonApi'
import type { CreateLessonRequest, UpdateLessonRequest } from '../types/lesson'

export const useGetProgramLessons = (programId: number) =>
  useQuery({
    queryKey: ['lessons', programId],
    queryFn: () => lessonApi.getProgramLessons(programId),
    enabled: !!programId
  })

export const useGetLesson = (id: number) =>
  useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonApi.getLesson(id),
    enabled: !!id
  })

export const useCreateLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLessonRequest) => lessonApi.createLesson(programId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', programId] })
    }
  })
}

export const useUpdateLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonRequest }) =>
      lessonApi.updateLesson(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', programId] })
      queryClient.invalidateQueries({ queryKey: ['lesson', variables.id] })
    }
  })
}

export const usePublishLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => lessonApi.publishLesson(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', programId] })
      queryClient.invalidateQueries({ queryKey: ['lesson', id] })
    }
  })
}

export const useDeleteLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => lessonApi.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', programId] })
    }
  })
}
