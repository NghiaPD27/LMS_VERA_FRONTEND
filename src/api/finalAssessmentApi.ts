import { http } from './client'
import type {
  AddFinalAssessmentParticipantsRequest,
  CreateFinalAssessmentRetakePaymentRequest,
  CreateFinalAssessmentSessionRequest,
  FinalAssessmentEligibleQueryParams,
  FinalAssessmentEligibleStudent,
  FinalAssessmentRetakePayment,
  FinalAssessmentRetakePaymentQueryParams,
  FinalAssessmentResult,
  FinalAssessmentSession,
  FinalAssessmentSessionPage,
  FinalAssessmentSessionQueryParams,
  StudentFinalAssessmentStatus,
  SubmitFinalAssessmentResultRequest,
  UpdateFinalAssessmentSessionRequest,
  UpdateFinalAssessmentSessionStatusRequest,
} from '../types/finalAssessment'

export const finalAssessmentApi = {
  getEligibleStudents: async (params: FinalAssessmentEligibleQueryParams = {}): Promise<FinalAssessmentEligibleStudent[]> => {
    const response = await http.get('/admin/final-assessment-eligible-students', { params })
    return response.data
  },

  getAdminSessions: async (params: FinalAssessmentSessionQueryParams = {}): Promise<FinalAssessmentSessionPage> => {
    const response = await http.get('/admin/final-assessment-sessions', { params })
    return response.data
  },

  getAdminSession: async (id: number): Promise<FinalAssessmentSession> => {
    const response = await http.get(`/admin/final-assessment-sessions/${id}`)
    return response.data
  },

  createSession: async (data: CreateFinalAssessmentSessionRequest): Promise<FinalAssessmentSession> => {
    const response = await http.post('/admin/final-assessment-sessions', data)
    return response.data
  },

  updateSession: async (id: number, data: UpdateFinalAssessmentSessionRequest): Promise<FinalAssessmentSession> => {
    const response = await http.patch(`/admin/final-assessment-sessions/${id}`, data)
    return response.data
  },

  updateSessionStatus: async (
    id: number,
    data: UpdateFinalAssessmentSessionStatusRequest
  ): Promise<FinalAssessmentSession> => {
    const response = await http.patch(`/admin/final-assessment-sessions/${id}/status`, data)
    return response.data
  },

  addParticipants: async (
    sessionId: number,
    data: AddFinalAssessmentParticipantsRequest
  ): Promise<FinalAssessmentSession> => {
    const response = await http.post(`/admin/final-assessment-sessions/${sessionId}/participants`, data)
    return response.data
  },

  removeParticipant: async (sessionId: number, participantId: number): Promise<FinalAssessmentSession> => {
    const response = await http.delete(`/admin/final-assessment-sessions/${sessionId}/participants/${participantId}`)
    return response.data
  },

  getStudentStatus: async (enrollmentId: number): Promise<StudentFinalAssessmentStatus> => {
    const response = await http.get('/student/final-assessment-status', { params: { enrollmentId } })
    return response.data
  },

  getRetakePayments: async (params: FinalAssessmentRetakePaymentQueryParams = {}): Promise<FinalAssessmentRetakePayment[]> => {
    const response = await http.get('/student/final-assessment-retake-payments', { params })
    return response.data
  },

  createRetakePayment: async (data: CreateFinalAssessmentRetakePaymentRequest): Promise<FinalAssessmentRetakePayment> => {
    const response = await http.post('/student/final-assessment-retake-payments', data)
    return response.data
  },

  getEvaluatorSessions: async (): Promise<FinalAssessmentSession[]> => {
    const response = await http.get('/evaluator/final-assessment-sessions')
    return response.data
  },

  getEvaluatorSession: async (id: number): Promise<FinalAssessmentSession> => {
    const response = await http.get(`/evaluator/final-assessment-sessions/${id}`)
    return response.data
  },

  submitResult: async (data: SubmitFinalAssessmentResultRequest): Promise<FinalAssessmentResult> => {
    const response = await http.post('/evaluator/final-assessment-results', data)
    return response.data
  },
}
