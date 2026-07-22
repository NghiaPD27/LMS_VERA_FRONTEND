import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '../api/quizApi'
import type { SubmitQuizAttemptRequest, UpsertQuizRequest } from '../types/quiz'

export const lessonQuizQueryKey = (lessonId: number) => ['lesson-quiz', lessonId] as const
export const quizAttemptQueryKey = (attemptId: number) => ['quiz-attempt', attemptId] as const
export const lessonQuizAttemptsQueryKey = (lessonId?: number) => ['lesson-quiz-attempts', lessonId] as const

export const useGetLessonQuiz = (lessonId?: number, enabled = true) =>
  useQuery({
    queryKey: lessonQuizQueryKey(lessonId || 0),
    queryFn: () => quizApi.getLessonQuiz(lessonId as number),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useUpsertLessonQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: UpsertQuizRequest }) =>
      quizApi.upsertLessonQuiz(lessonId, data),
    onSuccess: (quiz, variables) => {
      queryClient.setQueryData(lessonQuizQueryKey(variables.lessonId), quiz)
      queryClient.invalidateQueries({ queryKey: lessonQuizQueryKey(variables.lessonId) })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export const useDeleteLessonQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: number) => quizApi.deleteLessonQuiz(lessonId),
    onSuccess: (_, lessonId) => {
      queryClient.removeQueries({ queryKey: lessonQuizQueryKey(lessonId) })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export const useGetLessonQuizAttempts = (lessonId?: number, enabled = true) =>
  useQuery({
    queryKey: lessonQuizAttemptsQueryKey(lessonId),
    queryFn: () => quizApi.getLessonQuizAttempts(lessonId as number),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useStartQuizAttempt = () =>
  useMutation({
    mutationFn: (quizId: number) => quizApi.startQuizAttempt(quizId),
  })

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: SubmitQuizAttemptRequest }) =>
      quizApi.submitQuizAttempt(attemptId, data),
    onSuccess: (attempt, variables) => {
      queryClient.setQueryData(quizAttemptQueryKey(variables.attemptId), attempt)
      if (attempt.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson-learning-state', attempt.lessonId] })
      }
    },
  })
}
