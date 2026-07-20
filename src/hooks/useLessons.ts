import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi } from '../api/lessonApi'
import type {
  CreateLessonRequest,
  CreateVideoUploadSessionRequest,
  LearningState,
  UpsertLessonVideoRequest,
  UpdateLessonRequest,
  UpdateVideoProgressRequest
} from '../types/lesson'

export const lessonsQueryKey = (programId: number) => ['lessons', programId] as const
export const lessonQueryKey = (id: number) => ['lesson', id] as const
export const lessonVideoQueryKey = (lessonId: number) => ['lesson-video', lessonId] as const
export const videoPlaybackQueryKey = (lessonId: number) => ['video-playback', lessonId] as const
export const lessonLearningStateQueryKey = (lessonId: number) => ['lesson-learning-state', lessonId] as const
export const lessonVideoProgressQueryKey = (lessonId: number) => ['lesson-video-progress', lessonId] as const

export const useGetProgramLessons = (programId: number) =>
  useQuery({
    queryKey: lessonsQueryKey(programId),
    queryFn: () => lessonApi.getProgramLessons(programId),
    enabled: !!programId
  })

export const useGetLesson = (id: number) =>
  useQuery({
    queryKey: lessonQueryKey(id),
    queryFn: () => lessonApi.getLesson(id),
    enabled: !!id
  })

export const useCreateLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLessonRequest) => lessonApi.createLesson(programId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
    }
  })
}

export const useUpdateLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonRequest }) =>
      lessonApi.updateLesson(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
      queryClient.invalidateQueries({ queryKey: lessonQueryKey(variables.id) })
    }
  })
}

export const usePublishLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => lessonApi.publishLesson(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
      queryClient.invalidateQueries({ queryKey: lessonQueryKey(id) })
    }
  })
}

export const useDeleteLesson = (programId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => lessonApi.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
    }
  })
}

export const useCreateLessonVideoUploadSession = () =>
  useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: CreateVideoUploadSessionRequest }) =>
      lessonApi.createLessonVideoUploadSession(lessonId, data),
  })

export const useGetLessonVideo = (lessonId?: number, enabled = true) =>
  useQuery({
    queryKey: lessonVideoQueryKey(lessonId || 0),
    queryFn: () => lessonApi.getLessonVideo(lessonId as number),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useSyncLessonVideo = (programId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: number) => lessonApi.syncLessonVideo(lessonId),
    onSuccess: (video, lessonId) => {
      queryClient.setQueryData(lessonVideoQueryKey(lessonId), video)
      queryClient.invalidateQueries({ queryKey: lessonVideoQueryKey(lessonId) })
      queryClient.invalidateQueries({ queryKey: videoPlaybackQueryKey(lessonId) })
      if (programId) {
        queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
      }
    },
  })
}

export const useUpsertLessonVideo = (programId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: UpsertLessonVideoRequest }) =>
      lessonApi.upsertLessonVideo(lessonId, data),
    onSuccess: (video, variables) => {
      queryClient.setQueryData(lessonVideoQueryKey(variables.lessonId), video)
      queryClient.invalidateQueries({ queryKey: lessonVideoQueryKey(variables.lessonId) })
      queryClient.invalidateQueries({ queryKey: videoPlaybackQueryKey(variables.lessonId) })
      if (programId) {
        queryClient.invalidateQueries({ queryKey: lessonsQueryKey(programId) })
      }
    },
  })
}

export const useGetLessonVideoPlayback = (lessonId?: number) =>
  useQuery({
    queryKey: videoPlaybackQueryKey(lessonId || 0),
    queryFn: () => lessonApi.getLessonVideoPlayback(lessonId as number),
    enabled: !!lessonId,
    retry: false,
  })

export const useGetLessonLearningState = (lessonId?: number) =>
  useQuery({
    queryKey: lessonLearningStateQueryKey(lessonId || 0),
    queryFn: () => lessonApi.getLessonLearningState(lessonId as number),
    enabled: !!lessonId,
    retry: false,
  })

export const useGetLessonVideoProgress = (lessonId?: number) =>
  useQuery({
    queryKey: lessonVideoProgressQueryKey(lessonId || 0),
    queryFn: () => lessonApi.getLessonVideoProgress(lessonId as number),
    enabled: !!lessonId,
    retry: false,
  })

export const useUpdateLessonVideoProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: UpdateVideoProgressRequest }) =>
      lessonApi.updateLessonVideoProgress(lessonId, data),
    onSuccess: (progress, variables) => {
      queryClient.setQueryData(lessonVideoProgressQueryKey(variables.lessonId), progress)
      queryClient.setQueryData<LearningState | undefined>(
        lessonLearningStateQueryKey(variables.lessonId),
        (current) => ({
          ...current,
          lessonId: current?.lessonId ?? progress.lessonId ?? variables.lessonId,
          progress: {
            currentSecond: progress.currentSecond,
            furthestWatchedSecond: progress.furthestWatchedSecond,
            watchedPercentage: progress.watchedPercentage,
            completed: progress.completed,
            lessonProgressStatus: progress.lessonProgressStatus,
          },
          quizAvailable:
            current?.quizAvailable === true ||
            (progress.completed === true && progress.lessonProgressStatus === 'QUIZ_AVAILABLE'),
        })
      )
      queryClient.invalidateQueries({ queryKey: lessonLearningStateQueryKey(variables.lessonId) })
    },
  })
}
