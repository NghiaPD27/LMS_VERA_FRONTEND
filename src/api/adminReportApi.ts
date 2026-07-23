import { http } from './client'
import type {
  AdminDashboardReport,
  AdminStudentProgressDetail,
  AdminStudentProgressPage,
  AdminStudentProgressQueryParams,
} from '../types/adminReport'

export const adminReportApi = {
  getDashboard: async (): Promise<AdminDashboardReport> => {
    const response = await http.get('/admin/reports/dashboard')
    return response.data
  },

  getStudentProgress: async (params: AdminStudentProgressQueryParams = {}): Promise<AdminStudentProgressPage> => {
    const response = await http.get('/admin/reports/student-progress', { params })
    return response.data
  },

  getStudentProgressDetail: async (enrollmentId: number): Promise<AdminStudentProgressDetail> => {
    const response = await http.get(`/admin/reports/student-progress/${enrollmentId}`)
    return response.data
  },
}
