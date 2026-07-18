import { http } from './client';
import type {
  AccountAccessResponse,
  CreateEvaluatorRequest,
  CreateStudentRequest,
  CreateTeacherRequest,
  EvaluatorProfileResponse,
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

  extendAccount: async (userId: string, months: number): Promise<AccountAccessResponse> => {
    const response = await http.patch(`/admin/users/${userId}/extend`, { months });
    return response.data;
  },
};


