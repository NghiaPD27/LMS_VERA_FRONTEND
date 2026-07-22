import { http } from './client'
import type {
  CreateAvailabilityRequest,
  ReviewBookingRequest,
  TeacherAssignment,
  TeacherAvailability,
  TeacherAvailabilityQueryParams,
  TeacherAvailabilitySlot,
  TeacherBooking,
  TeacherReview,
} from '../types/teacher'

export const teacherApi = {
  createAvailability: async (data: CreateAvailabilityRequest): Promise<TeacherAvailability> => {
    const response = await http.post('/teacher/availability', data)
    return response.data
  },

  getAvailability: async (params: TeacherAvailabilityQueryParams = {}): Promise<TeacherAvailabilitySlot[]> => {
    const response = await http.get('/teacher/availability', { params })
    return response.data
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await http.delete(`/teacher/availability/${id}`)
  },

  getStudents: async (): Promise<TeacherAssignment[]> => {
    const response = await http.get('/teacher/students')
    return response.data
  },

  getBookings: async (status?: string): Promise<TeacherBooking[]> => {
    const response = await http.get('/teacher/bookings', { params: status ? { status } : undefined })
    return response.data
  },

  reviewBooking: async (bookingId: number, data: ReviewBookingRequest): Promise<TeacherReview> => {
    const response = await http.post(`/teacher/bookings/${bookingId}/review`, data)
    return response.data
  },
}
