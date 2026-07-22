import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '../api/adminUsersApi'
import type { AdminUserQueryParams, ResetPasswordRequest } from '../types/api'
import type { AdminStudentQueryParams } from '../types/user'

export const adminUsersQueryKey = (params: AdminUserQueryParams = {}) => ['admin-users', params] as const
export const adminUserQueryKey = (id?: number) => ['admin-user', id] as const

export const useGetAdminUsers = (params: AdminUserQueryParams = {}) =>
  useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => adminUsersApi.getUsers(params),
  })

export const useGetAdminUser = (id?: number, enabled = true) =>
  useQuery({
    queryKey: adminUserQueryKey(id),
    queryFn: () => adminUsersApi.getUser(id as number),
    enabled: !!id && enabled,
  })

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

export const useResetUserPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: ResetPasswordRequest }) =>
      adminUsersApi.resetPassword(userId, data),
    onSuccess: (user, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: adminUserQueryKey(variables.userId) })
      if (user.id) {
        queryClient.setQueryData(adminUserQueryKey(user.id), user)
      }
    },
  })
}
