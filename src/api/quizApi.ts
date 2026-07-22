import { http } from './client'
import type { Quiz, QuizAttempt, SubmitQuizAttemptRequest, UpsertQuizRequest } from '../types/quiz'

export const quizApi = {
  getLessonQuiz: async (lessonId: number): Promise<Quiz> => {
    const response = await http.get(`/lessons/${lessonId}/quiz`)
    return response.data
  },

  upsertLessonQuiz: async (lessonId: number, data: UpsertQuizRequest): Promise<Quiz> => {
    const response = await http.post(`/lessons/${lessonId}/quiz`, data)
    return response.data
  },

  deleteLessonQuiz: async (lessonId: number): Promise<void> => {
    await http.delete(`/lessons/${lessonId}/quiz`)
  },

  getLessonQuizAttempts: async (lessonId: number): Promise<QuizAttempt[]> => {
    const response = await http.get(`/admin/lessons/${lessonId}/quiz-attempts`)
    return response.data
  },

  startQuizAttempt: async (quizId: number): Promise<QuizAttempt> => {
    const response = await http.post(`/quizzes/${quizId}/attempts`)
    return response.data
  },

  submitQuizAttempt: async (
    attemptId: number,
    data: SubmitQuizAttemptRequest
  ): Promise<QuizAttempt> => {
    const response = await http.post(`/quiz-attempts/${attemptId}/submit`, data)
    return response.data
  },
}
