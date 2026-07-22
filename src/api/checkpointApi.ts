import { http } from './client'
import type {
  AddCheckpointParticipantsRequest,
  AdminEvaluatorPage,
  CheckpointEligibleQueryParams,
  CheckpointEligibleStudent,
  CheckpointResult,
  CheckpointSession,
  CheckpointSessionPage,
  CheckpointSessionQueryParams,
  CreateCheckpointSessionRequest,
  EvaluatorQueryParams,
  StudentCheckpointStatus,
  SubmitCheckpointResultRequest,
  UpdateCheckpointSessionRequest,
  UpdateCheckpointSessionStatusRequest,
} from '../types/checkpoint'

export const checkpointApi = {
  getEligibleStudents: async (params: CheckpointEligibleQueryParams = {}): Promise<CheckpointEligibleStudent[]> => {
    const response = await http.get('/admin/checkpoint-eligible-students', { params })
    return response.data
  },

  getEvaluators: async (params: EvaluatorQueryParams = {}): Promise<AdminEvaluatorPage> => {
    const response = await http.get('/admin/evaluators', { params })
    return response.data
  },

  getAdminSessions: async (params: CheckpointSessionQueryParams = {}): Promise<CheckpointSessionPage> => {
    const response = await http.get('/admin/checkpoint-sessions', { params })
    return response.data
  },

  getAdminSession: async (id: number): Promise<CheckpointSession> => {
    const response = await http.get(`/admin/checkpoint-sessions/${id}`)
    return response.data
  },

  createSession: async (data: CreateCheckpointSessionRequest): Promise<CheckpointSession> => {
    const response = await http.post('/admin/checkpoint-sessions', data)
    return response.data
  },

  updateSession: async (id: number, data: UpdateCheckpointSessionRequest): Promise<CheckpointSession> => {
    const response = await http.patch(`/admin/checkpoint-sessions/${id}`, data)
    return response.data
  },

  updateSessionStatus: async (
    id: number,
    data: UpdateCheckpointSessionStatusRequest
  ): Promise<CheckpointSession> => {
    const response = await http.patch(`/admin/checkpoint-sessions/${id}/status`, data)
    return response.data
  },

  addParticipants: async (
    sessionId: number,
    data: AddCheckpointParticipantsRequest
  ): Promise<CheckpointSession> => {
    const response = await http.post(`/admin/checkpoint-sessions/${sessionId}/participants`, data)
    return response.data
  },

  removeParticipant: async (sessionId: number, participantId: number): Promise<CheckpointSession> => {
    const response = await http.delete(`/admin/checkpoint-sessions/${sessionId}/participants/${participantId}`)
    return response.data
  },

  getStudentStatus: async (lessonId: number): Promise<StudentCheckpointStatus> => {
    const response = await http.get('/student/checkpoint-status', { params: { lessonId } })
    return response.data
  },

  getEvaluatorSessions: async (): Promise<CheckpointSession[]> => {
    const response = await http.get('/evaluator/checkpoint-sessions')
    return response.data
  },

  getEvaluatorSession: async (id: number): Promise<CheckpointSession> => {
    const response = await http.get(`/evaluator/checkpoint-sessions/${id}`)
    return response.data
  },

  submitResult: async (data: SubmitCheckpointResultRequest): Promise<CheckpointResult> => {
    const response = await http.post('/evaluator/checkpoint-results', data)
    return response.data
  },
}
