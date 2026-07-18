import type { components } from '../api/openapi'

export type Lesson = components['schemas']['LessonResponse']
export type CreateLessonRequest = components['schemas']['CreateLessonRequest']
export type UpdateLessonRequest = components['schemas']['UpdateLessonRequest']
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

