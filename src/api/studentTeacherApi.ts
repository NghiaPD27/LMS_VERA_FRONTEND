import { http } from './client'
import type {
  CreateBookingRequest,
  StudentBookingQueryParams,
  StudentTeacherSlotQueryParams,
  TeacherBooking,
  TeacherBookingPage,
  TeacherSlotPage,
} from '../types/teacher'

const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))

export const studentTeacherApi = {
  getTeacherSlots: async (lessonId: number, params: StudentTeacherSlotQueryParams = {}): Promise<TeacherSlotPage> => {
    const response = await http.get('/student/teacher-slots', {
      params: cleanParams({ lessonId, ...params }),
    })
    return response.data
  },

  createBooking: async (data: CreateBookingRequest): Promise<TeacherBooking> => {
    const response = await http.post('/student/bookings', data)
    return response.data
  },

  getBookings: async (params: StudentBookingQueryParams = {}): Promise<TeacherBookingPage> => {
    const cleanedParams = cleanParams(params)
    const response = await http.get('/student/bookings', {
      params: Object.keys(cleanedParams).length ? cleanedParams : undefined,
    })
    return response.data
  },

  cancelBooking: async (id: number): Promise<TeacherBooking> => {
    const response = await http.patch(`/student/bookings/${id}/cancel`)
    return response.data
  },
}
