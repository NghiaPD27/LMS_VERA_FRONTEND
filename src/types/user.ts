import type { components } from '../api/openapi'
import { normalizeRole, type UserRole } from '../utils/constants'

export type UserResponse = components['schemas']['UserResponse']
export type StudentProfile = components['schemas']['StudentProfileResponse']
export type TeacherProfile = components['schemas']['TeacherProfileResponse']
export type EvaluatorProfile = components['schemas']['EvaluatorProfileResponse']
export type AccountAccess = components['schemas']['AccountAccessResponse']
export type AdminStudent = components['schemas']['AdminStudentResponse']
export type AdminStudentPage = components['schemas']['PageResponseAdminStudentResponse']

export interface AdminStudentQueryParams {
  keyword?: string
  page?: number
  size?: number
}

export interface CurrentUser extends Omit<UserResponse, 'role'> {
  role?: UserRole
}

export function normalizeCurrentUser(user: UserResponse): CurrentUser {
  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

