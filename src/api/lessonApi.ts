import { http } from './client'
import type {
  CreateLessonRequest,
  CreateVideoUploadSessionRequest,
  Lesson,
  LessonVideo,
  UpsertLessonVideoRequest,
  UpdateLessonRequest,
  UpdateVideoProgressRequest,
  VideoPlayback,
  VideoProgress,
  VideoUploadSession
} from '../types/lesson'

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
  },

  createLessonVideoUploadSession: async (
    lessonId: number,
    data: CreateVideoUploadSessionRequest
  ): Promise<VideoUploadSession> => {
    const response = await http.post(`/lessons/${lessonId}/video-upload-session`, data)
    return response.data
  },

  syncLessonVideo: async (lessonId: number): Promise<LessonVideo> => {
    const response = await http.post(`/lessons/${lessonId}/video/sync`)
    return response.data
  },

  upsertLessonVideo: async (
    lessonId: number,
    data: UpsertLessonVideoRequest
  ): Promise<LessonVideo> => {
    const response = await http.post(`/lessons/${lessonId}/video`, data)
    return response.data
  },

  getLessonVideoPlayback: async (lessonId: number): Promise<VideoPlayback> => {
    const response = await http.get(`/lessons/${lessonId}/video-playback`)
    return response.data
  },

  updateLessonVideoProgress: async (
    lessonId: number,
    data: UpdateVideoProgressRequest
  ): Promise<VideoProgress> => {
    const response = await http.post(`/lessons/${lessonId}/video-progress`, data)
    return response.data
  },
}
