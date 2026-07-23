import type { components } from '../api/openapi'

export type AdminDashboardReport = components['schemas']['AdminDashboardResponse']
export type AdminStudentProgress = components['schemas']['AdminStudentProgressResponse']
export type AdminStudentProgressPage = components['schemas']['PageResponseAdminStudentProgressResponse']
export type AdminStudentLessonProgress = components['schemas']['AdminStudentLessonProgressResponse']
export type AdminStudentProgressDetail = components['schemas']['AdminStudentProgressDetailResponse']

export interface AdminStudentProgressQueryParams {
  programId?: number
  enrollmentStatus?: string
  accountStatus?: string
  teacherId?: number
  expiryFrom?: string
  expiryTo?: string
  keyword?: string
  page?: number
  size?: number
}
