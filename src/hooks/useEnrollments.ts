import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentApi } from '../api/enrollmentApi'
import type {
  AdminEnrollmentQueryParams,
  EnrollStudentRequest,
  UpdateEnrollmentRequest
} from '../types/enrollment'

export const useGetMyEnrollments = () =>
  useQuery({
    queryKey: ['student-enrollments'],
    queryFn: enrollmentApi.getMyEnrollments
  })

export const useGetAdminEnrollments = (params: AdminEnrollmentQueryParams = {}) =>
  useQuery({
    queryKey: ['admin-enrollments', params],
    queryFn: () => enrollmentApi.getAdminEnrollments(params)
  })

export const useEnrollStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EnrollStudentRequest) => enrollmentApi.enrollStudent(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: ['student-enrollments', data.studentId] })
      }
    }
  })
}

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnrollmentRequest }) =>
      enrollmentApi.updateEnrollment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: ['student-enrollments', data.studentId] })
      }
    }
  })
}
