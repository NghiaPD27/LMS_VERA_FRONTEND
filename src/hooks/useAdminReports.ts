import { useQuery } from '@tanstack/react-query'
import { adminReportApi } from '../api/adminReportApi'
import type { AdminStudentProgressQueryParams } from '../types/adminReport'

export const adminDashboardReportQueryKey = ['admin-dashboard-report'] as const
export const adminStudentProgressQueryKey = (params: AdminStudentProgressQueryParams = {}) => ['admin-student-progress-report', params] as const
export const adminStudentProgressDetailQueryKey = (enrollmentId?: number) => ['admin-student-progress-detail', enrollmentId] as const

export const useGetAdminDashboardReport = () =>
  useQuery({
    queryKey: adminDashboardReportQueryKey,
    queryFn: adminReportApi.getDashboard,
    retry: false,
  })

export const useGetAdminStudentProgress = (params: AdminStudentProgressQueryParams = {}) =>
  useQuery({
    queryKey: adminStudentProgressQueryKey(params),
    queryFn: () => adminReportApi.getStudentProgress(params),
    retry: false,
  })

export const useGetAdminStudentProgressDetail = (enrollmentId?: number, enabled = true) =>
  useQuery({
    queryKey: adminStudentProgressDetailQueryKey(enrollmentId),
    queryFn: () => adminReportApi.getStudentProgressDetail(enrollmentId as number),
    enabled: !!enrollmentId && enabled,
    retry: false,
  })
