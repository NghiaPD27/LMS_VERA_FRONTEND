import type { components } from '../api/openapi'

export type AuditLog = components['schemas']['AuditLogResponse']
export type AuditLogPage = components['schemas']['PageResponseAuditLogResponse']

export interface AuditLogQueryParams {
  action?: string
  actorId?: number
  targetType?: string
  targetId?: number
  from?: string
  to?: string
  page?: number
  size?: number
}

export const AUDIT_ACTIONS = [
  'USER_CREATED',
  'USER_STATUS_UPDATED',
  'PASSWORD_RESET',
  'ENROLLMENT_EXTENDED',
  'LESSON_PUBLISHED',
  'LESSON_ARCHIVED',
  'LESSON_DELETED',
  'TEACHER_REVIEW_SUBMITTED',
  'CHECKPOINT_RESULT_SUBMITTED',
  'FINAL_ASSESSMENT_RESULT_SUBMITTED',
] as const
