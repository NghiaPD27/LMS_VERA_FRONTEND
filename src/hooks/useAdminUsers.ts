import { useQuery } from '@tanstack/react-query'
import { adminUsersApi } from '../api/adminUsersApi'
import type { AdminStudentQueryParams } from '../types/user'

export const useGetStudents = (params: AdminStudentQueryParams = {}) =>
  useQuery({
    queryKey: ['admin-students', params],
    queryFn: () => adminUsersApi.getStudents(params),
  })

export const useGetStudent = (id?: number) =>
  useQuery({
    queryKey: ['admin-student', id],
    queryFn: () => adminUsersApi.getStudent(id as number),
    enabled: !!id,
  })

export const useGetStudentEnrollments = (id?: number) =>
  useQuery({
    queryKey: ['student-enrollments', id],
    queryFn: () => adminUsersApi.getStudentEnrollments(id as number),
    enabled: !!id,
  })
