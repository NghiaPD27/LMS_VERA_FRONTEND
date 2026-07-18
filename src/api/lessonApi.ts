import { http } from './client'
import type { Lesson, CreateLessonRequest, UpdateLessonRequest } from '../types/lesson'

export const lessonApi = {
  getProgramLessons: async (programId: number): Promise<Lesson[]> => {
    const response = await http.get(`/programs/${programId}/lessons`)
    return response.data
  },

  createLesson: async (programId: number, data: CreateLessonRequest): Promise<Lesson> => {
    const response = await http.post(`/programs/${programId}/lessons`, data)
    return response.data
  },

  getLesson: async (id: number): Promise<Lesson> => {
    const response = await http.get(`/lessons/${id}`)
    return response.data
  },

  updateLesson: async (id: number, data: UpdateLessonRequest): Promise<Lesson> => {
    const response = await http.patch(`/lessons/${id}`, data)
    return response.data
  },

  publishLesson: async (id: number): Promise<Lesson> => {
    const response = await http.post(`/lessons/${id}/publish`)
    return response.data
  },

  deleteLesson: async (id: number): Promise<void> => {
    await http.delete(`/lessons/${id}`)
  }
}
