import type { components } from '../api/openapi'

export type Enrollment = components['schemas']['EnrollmentResponse']
export type EnrollStudentRequest = components['schemas']['EnrollStudentRequest']
export type UpdateEnrollmentRequest = components['schemas']['UpdateEnrollmentRequest']
export type AdminEnrollment = components['schemas']['AdminEnrollmentResponse']
export type AdminEnrollmentPage = components['schemas']['PageResponseAdminEnrollmentResponse']
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED'

export interface AdminEnrollmentQueryParams {
  studentId?: string
  programId?: string
  status?: string
  page?: number
  size?: number
}

