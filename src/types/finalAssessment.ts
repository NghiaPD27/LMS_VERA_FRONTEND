import type { components } from '../api/openapi'
import type { EvaluatorQueryParams } from './checkpoint'

export type FinalAssessmentEligibleStudent = components['schemas']['FinalAssessmentEligibleStudentResponse']
export type CreateFinalAssessmentSessionRequest = components['schemas']['CreateFinalAssessmentSessionRequest']
export type AddFinalAssessmentParticipantsRequest = components['schemas']['AddFinalAssessmentParticipantsRequest']
export type FinalAssessmentSession = components['schemas']['FinalAssessmentSessionResponse']
export type FinalAssessmentParticipant = components['schemas']['FinalAssessmentParticipantResponse']
export type SubmitFinalAssessmentResultRequest = components['schemas']['SubmitFinalAssessmentResultRequest']
export type FinalAssessmentResult = components['schemas']['FinalAssessmentResultResponse']
export type UpdateFinalAssessmentSessionRequest = components['schemas']['UpdateFinalAssessmentSessionRequest']
export type UpdateFinalAssessmentSessionStatusRequest = components['schemas']['UpdateFinalAssessmentSessionStatusRequest']
export type FinalAssessmentSessionPage = components['schemas']['PageResponseFinalAssessmentSessionResponse']
export type StudentFinalAssessmentStatus = components['schemas']['StudentFinalAssessmentStatusResponse']
export type CreateFinalAssessmentRetakePaymentRequest = components['schemas']['CreateFinalAssessmentRetakePaymentRequest']
export type FinalAssessmentRetakePayment = components['schemas']['FinalAssessmentRetakePaymentResponse']
export type FinalAssessmentResultValue = 'PASS' | 'NOT_PASS'
export type FinalAssessmentSessionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface FinalAssessmentEligibleQueryParams {
  programId?: number
  weekStart?: string
  weekEnd?: string
}

export interface FinalAssessmentSessionQueryParams extends FinalAssessmentEligibleQueryParams {
  status?: string
  page?: number
  size?: number
}

export interface FinalAssessmentRetakePaymentQueryParams {
  enrollmentId?: number
  status?: string
}

export type { EvaluatorQueryParams }
