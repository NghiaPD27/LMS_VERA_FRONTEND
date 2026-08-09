import type { components } from '../api/openapi'

export type AssignTeacherRequest = components['schemas']['AssignTeacherRequest']
export type AdminTeacher = components['schemas']['AdminTeacherResponse']
export type AdminTeacherPage = components['schemas']['PageResponseAdminTeacherResponse']
export type TeacherAssignment = components['schemas']['TeacherAssignmentResponse']
export type UpsertTeacherCompensationRequest = components['schemas']['UpsertTeacherCompensationRequest']
export type TeacherCompensation = components['schemas']['TeacherCompensationResponse']
type BaseTeacherEarning = Omit<components['schemas']['TeacherEarningResponse'], 'lessonId' | 'lessonName'>
export type BookingType = 'LESSON' | 'PRIVATE'
export type TeacherEarning = BaseTeacherEarning & {
  bookingType?: BookingType
  lessonId?: number | null
  lessonName?: string | null
}
export type TeacherEarningsSummary = components['schemas']['TeacherEarningsSummaryResponse']
export type CreateAvailabilityRequest = components['schemas']['CreateAvailabilityRequest']
export type TeacherAvailability = components['schemas']['TeacherAvailabilityResponse']
type BaseTeacherAvailabilitySlot = Omit<components['schemas']['TeacherAvailabilitySlotResponse'], 'lessonId' | 'lessonName'>
export type TeacherAvailabilitySlot = BaseTeacherAvailabilitySlot & {
  bookingType?: BookingType
  lessonId?: number | null
  lessonName?: string | null
}
export type TeacherAvailabilitySlotPage = Omit<
  components['schemas']['PageResponseTeacherAvailabilitySlotResponse'],
  'content'
> & {
  content?: TeacherAvailabilitySlot[]
}
type BaseTeacherBooking = Omit<components['schemas']['TeacherBookingResponse'], 'enrollmentId' | 'lessonId' | 'lessonName'>
export type TeacherBooking = BaseTeacherBooking & {
  bookingType?: BookingType
  enrollmentId?: number | null
  lessonId?: number | null
  lessonName?: string | null
}
export type TeacherBookingPage = Omit<components['schemas']['PageResponseTeacherBookingResponse'], 'content'> & {
  content?: TeacherBooking[]
}
export type TeacherSlot = components['schemas']['TeacherSlotResponse']
export type TeacherSlotPage = components['schemas']['PageResponseTeacherSlotResponse']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type ReviewBookingRequest = components['schemas']['ReviewBookingRequest']
export type TeacherReview = components['schemas']['TeacherReviewResponse']

export type TeacherReviewResult = 'APPROVED' | 'NOT_APPROVED'

export interface TeacherQueryParams {
  keyword?: string
  page?: number
  size?: number
}

export interface PrivateTeacher {
  teacherId?: number
  teacherName?: string
  bio?: string | null
}

export interface PrivateTeacherPage {
  content?: PrivateTeacher[]
  totalElements?: number
  totalPages?: number
  page?: number
  size?: number
}

export interface TeacherAvailabilityQueryParams {
  from?: string
  to?: string
  status?: string
  page?: number
  size?: number
}

export interface TeacherEarningsQueryParams {
  month?: string
}

export interface StudentBookingQueryParams {
  lessonId?: number
  status?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface TeacherBookingQueryParams {
  status?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface StudentTeacherSlotQueryParams {
  page?: number
  size?: number
}

export interface PrivateTeacherSlotQueryParams {
  teacherId?: number
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface CreatePrivateBookingRequest {
  teacherId: number
  slotStartAt: string
}

export interface PrivateBookingQueryParams {
  teacherId?: number
  status?: string
  from?: string
  to?: string
  page?: number
  size?: number
}
