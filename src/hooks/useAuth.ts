import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../utils/tokenStorage'
import type { ChangePasswordRequest, LoginRequest, RegisterStudentRequest } from '../types/auth'

export const authQueryKey = ['currentUser'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    enabled: !!getAccessToken(),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      if (data.accessToken) {
        setAccessToken(data.accessToken)
      }
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken)
      }
      queryClient.removeQueries({ queryKey: authQueryKey })
    },
  })
}

export function useRegisterStudent() {
  return useMutation({
    mutationFn: (data: RegisterStudentRequest) => authApi.registerStudent(data),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout({ refreshToken: getRefreshToken() || '' })
      } finally {
        clearTokens()
        queryClient.clear()
      }
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKey })
    },
  })
}
