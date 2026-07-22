import { http } from './client'
import type { CreateBookingRequest, TeacherBooking, TeacherSlot } from '../types/teacher'

export const studentTeacherApi = {
  getTeacherSlots: async (lessonId: number): Promise<TeacherSlot[]> => {
    const response = await http.get('/student/teacher-slots', { params: { lessonId } })
    return response.data
  },

  createBooking: async (data: CreateBookingRequest): Promise<TeacherBooking> => {
    const response = await http.post('/student/bookings', data)
    return response.data
  },
}

