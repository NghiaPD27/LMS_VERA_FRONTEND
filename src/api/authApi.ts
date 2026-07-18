import { http } from './client'
import type { ChangePasswordRequest, LoginRequest, LoginResponse, RefreshRequest } from '../types/auth'
import { normalizeCurrentUser, type CurrentUser } from '../types/user'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post('/auth/login', data)
    return response.data
  },

  logout: async (data: RefreshRequest): Promise<void> => {
    await http.post('/auth/logout', data)
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    const response = await http.get('/auth/me')
    return normalizeCurrentUser(response.data)
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await http.post('/auth/change-password', data)
  },
}
