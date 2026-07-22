import { http } from './client'
import type { CreateBookingRequest, StudentBookingQueryParams, TeacherBooking, TeacherSlot } from '../types/teacher'

export const studentTeacherApi = {
  getTeacherSlots: async (lessonId: number): Promise<TeacherSlot[]> => {
    const response = await http.get('/student/teacher-slots', { params: { lessonId } })
    return response.data
  },

  createBooking: async (data: CreateBookingRequest): Promise<TeacherBooking> => {
    const response = await http.post('/student/bookings', data)
    return response.data
  },

  getBookings: async (params: StudentBookingQueryParams = {}): Promise<TeacherBooking[]> => {
    const response = await http.get('/student/bookings', { params })
    return response.data
  },

  cancelBooking: async (id: number): Promise<TeacherBooking> => {
    const response = await http.patch(`/student/bookings/${id}/cancel`)
    return response.data
  },
}
