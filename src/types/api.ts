import type { components } from '../api/openapi'

export type RefreshRequest = components['schemas']['RefreshRequest']
export type LoginRequest = components['schemas']['LoginRequest']
export type LoginResponse = components['schemas']['LoginResponse']
export type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']
export type RegisterStudentRequest = components['schemas']['RegisterStudentRequest']

export type CreateStudentRequest = components['schemas']['CreateStudentRequest']
export type CreateTeacherRequest = components['schemas']['CreateTeacherRequest']
export type CreateEvaluatorRequest = components['schemas']['CreateEvaluatorRequest']
export type UpdateUserRequest = components['schemas']['UpdateUserRequest']
export type ResetPasswordRequest = components['schemas']['ResetPasswordRequest']

export type StudentProfileResponse = components['schemas']['StudentProfileResponse']
export type TeacherProfileResponse = components['schemas']['TeacherProfileResponse']
export type EvaluatorProfileResponse = components['schemas']['EvaluatorProfileResponse']
export type AccountAccessResponse = components['schemas']['AccountAccessResponse']
export type UserResponse = components['schemas']['UserResponse']
export type AdminUserSummary = components['schemas']['AdminUserSummaryResponse']
export type AdminUserPage = components['schemas']['PageResponseAdminUserSummaryResponse']

export interface AdminUserQueryParams {
  role?: string
  keyword?: string
  status?: string
  page?: number
  size?: number
}
