import type { components } from '../api/openapi'

export type AssignTeacherRequest = components['schemas']['AssignTeacherRequest']
export type AdminTeacher = components['schemas']['AdminTeacherResponse']
export type AdminTeacherPage = components['schemas']['PageResponseAdminTeacherResponse']
export type TeacherAssignment = components['schemas']['TeacherAssignmentResponse']
export type UpsertTeacherCompensationRequest = components['schemas']['UpsertTeacherCompensationRequest']
export type TeacherCompensation = components['schemas']['TeacherCompensationResponse']
export type TeacherEarning = components['schemas']['TeacherEarningResponse']
export type TeacherEarningsSummary = components['schemas']['TeacherEarningsSummaryResponse']
export type CreateAvailabilityRequest = components['schemas']['CreateAvailabilityRequest']
export type TeacherAvailability = components['schemas']['TeacherAvailabilityResponse']
export type TeacherBooking = components['schemas']['TeacherBookingResponse']
export type TeacherSlot = components['schemas']['TeacherSlotResponse']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type ReviewBookingRequest = components['schemas']['ReviewBookingRequest']
export type TeacherReview = components['schemas']['TeacherReviewResponse']

export type TeacherReviewResult = 'APPROVED' | 'NOT_APPROVED'

export interface TeacherQueryParams {
  keyword?: string
  page?: number
  size?: number
}
