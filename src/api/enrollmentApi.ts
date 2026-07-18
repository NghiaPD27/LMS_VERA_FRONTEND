import { http } from './client'
import type {
  AdminEnrollmentPage,
  AdminEnrollmentQueryParams,
  Enrollment,
  EnrollStudentRequest,
  UpdateEnrollmentRequest
} from '../types/enrollment'

export const enrollmentApi = {
  enrollStudent: async (data: EnrollStudentRequest): Promise<Enrollment> => {
    const response = await http.post('/enrollments', data)
    return response.data
  },

  updateEnrollment: async (id: number, data: UpdateEnrollmentRequest): Promise<Enrollment> => {
    const response = await http.patch(`/enrollments/${id}`, data)
    return response.data
  },

  getAdminEnrollments: async (
    params: AdminEnrollmentQueryParams = {}
  ): Promise<AdminEnrollmentPage> => {
    const response = await http.get('/admin/enrollments', { params })
    return response.data
  },

  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await http.get('/student/enrollments')
    return response.data
  }
}
