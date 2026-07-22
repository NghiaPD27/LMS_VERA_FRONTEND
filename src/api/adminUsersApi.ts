import { http } from './client';
import type {
  AdminUserPage,
  AdminUserQueryParams,
  CreateEvaluatorRequest,
  CreateStudentRequest,
  CreateTeacherRequest,
  EvaluatorProfileResponse,
  ResetPasswordRequest,
  StudentProfileResponse,
  TeacherProfileResponse,
  UpdateUserRequest,
  UserResponse,
} from '../types/api';
import type {
  AdminStudent,
  AdminStudentPage,
  AdminStudentQueryParams,
} from '../types/user';
import type { AdminEnrollment } from '../types/enrollment';

export type CreateUserRole = 'student' | 'teacher' | 'evaluator';
export type CreateUserRequest = CreateStudentRequest | CreateTeacherRequest | CreateEvaluatorRequest;
export type CreateUserResponse = StudentProfileResponse | TeacherProfileResponse | EvaluatorProfileResponse;

export const adminUsersApi = {
  getUsers: async (params: AdminUserQueryParams = {}): Promise<AdminUserPage> => {
    const response = await http.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: number): Promise<UserResponse> => {
    const response = await http.get(`/admin/users/${id}`);
    return response.data;
  },

  getStudents: async (params: AdminStudentQueryParams = {}): Promise<AdminStudentPage> => {
    const response = await http.get('/admin/students', { params });
    return response.data;
  },

  getStudent: async (id: number): Promise<AdminStudent> => {
    const response = await http.get(`/admin/students/${id}`);
    return response.data;
  },

  getStudentEnrollments: async (id: number): Promise<AdminEnrollment[]> => {
    const response = await http.get(`/admin/students/${id}/enrollments`);
    return response.data;
  },

  createUser: async (role: CreateUserRole, data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await http.post(`/admin/${role}s`, data);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await http.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  resetPassword: async (userId: number, data: ResetPasswordRequest): Promise<UserResponse> => {
    const response = await http.post(`/admin/users/${userId}/reset-password`, data);
    return response.data;
  },

};


