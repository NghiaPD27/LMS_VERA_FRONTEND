import { http } from './client'
import type {
  CreateAvailabilityRequest,
  ReviewBookingRequest,
  TeacherAssignment,
  TeacherAvailability,
  TeacherAvailabilityQueryParams,
  TeacherAvailabilitySlotPage,
  TeacherBookingPage,
  TeacherBookingQueryParams,
  TeacherEarningsQueryParams,
  TeacherEarningsSummary,
  TeacherReview,
} from '../types/teacher'

const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))

export const teacherApi = {
  createAvailability: async (data: CreateAvailabilityRequest): Promise<TeacherAvailability> => {
    const response = await http.post('/teacher/availability', data)
    return response.data
  },

  getAvailability: async (params: TeacherAvailabilityQueryParams = {}): Promise<TeacherAvailabilitySlotPage> => {
    const cleanedParams = cleanParams(params)
    const response = await http.get('/teacher/availability', {
      params: Object.keys(cleanedParams).length ? cleanedParams : undefined,
    })
    return response.data
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await http.delete(`/teacher/availability/${id}`)
  },

  getStudents: async (): Promise<TeacherAssignment[]> => {
    const response = await http.get('/teacher/students')
    return response.data
  },

  getMyEarnings: async (params: TeacherEarningsQueryParams = {}): Promise<TeacherEarningsSummary> => {
    const response = await http.get('/teacher/earnings', { params })
    return response.data
  },

  getBookings: async (params: TeacherBookingQueryParams = {}): Promise<TeacherBookingPage> => {
    const cleanedParams = cleanParams(params)
    const response = await http.get('/teacher/bookings', {
      params: Object.keys(cleanedParams).length ? cleanedParams : undefined,
    })
    return response.data
  },

  reviewBooking: async (bookingId: number, data: ReviewBookingRequest): Promise<TeacherReview> => {
    const response = await http.post(`/teacher/bookings/${bookingId}/review`, data)
    return response.data
  },
}
