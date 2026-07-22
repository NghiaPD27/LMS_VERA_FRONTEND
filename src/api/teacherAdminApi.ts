import { http } from './client'
import type {
  AdminTeacher,
  AdminTeacherPage,
  TeacherAssignment,
  TeacherCompensation,
  TeacherEarningsSummary,
  TeacherQueryParams,
  UpsertTeacherCompensationRequest,
} from '../types/teacher'

export const teacherAdminApi = {
  getTeachers: async (params: TeacherQueryParams = {}): Promise<AdminTeacherPage> => {
    const response = await http.get('/admin/teachers', { params })
    return response.data
  },

  getTeacher: async (id: number): Promise<AdminTeacher> => {
    const response = await http.get(`/admin/teachers/${id}`)
    return response.data
  },

  assignTeacher: async (enrollmentId: number, teacherId: number): Promise<TeacherAssignment> => {
    const response = await http.put(`/admin/enrollments/${enrollmentId}/teacher-assignment`, { teacherId })
    return response.data
  },

  upsertCompensation: async (
    teacherId: number,
    data: UpsertTeacherCompensationRequest
  ): Promise<TeacherCompensation> => {
    const response = await http.put(`/admin/teachers/${teacherId}/compensation`, data)
    return response.data
  },

  getTeacherEarnings: async (teacherId: number): Promise<TeacherEarningsSummary> => {
    const response = await http.get(`/admin/teachers/${teacherId}/earnings`)
    return response.data
  },
}
