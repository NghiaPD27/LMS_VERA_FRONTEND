import type { components } from '../api/openapi'

export type Lesson = components['schemas']['LessonResponse']
export type CreateLessonRequest = components['schemas']['CreateLessonRequest']
export type UpdateLessonRequest = components['schemas']['UpdateLessonRequest']
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type UpsertLessonVideoRequest = components['schemas']['UpsertLessonVideoRequest']
export type LessonVideo = components['schemas']['LessonVideoResponse']
export type CreateVideoUploadSessionRequest = components['schemas']['CreateVideoUploadSessionRequest']
export type VideoUploadSession = components['schemas']['VideoUploadSessionResponse']
export type UpdateVideoProgressRequest = components['schemas']['UpdateVideoProgressRequest']
export type VideoProgress = components['schemas']['VideoProgressResponse']
export type VideoPlayback = components['schemas']['VideoPlaybackResponse']
export type LessonVideoStatus = 'PROCESSING' | 'READY' | 'FAILED' | (string & {})
export type LessonProgressStatus = 'LOCKED' | 'VIDEO_AVAILABLE' | 'QUIZ_AVAILABLE' | 'COMPLETED' | (string & {})

