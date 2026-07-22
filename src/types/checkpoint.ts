import type { components } from '../api/openapi'

export type CheckpointEligibleStudent = components['schemas']['CheckpointEligibleStudentResponse']
export type CreateCheckpointSessionRequest = components['schemas']['CreateCheckpointSessionRequest']
export type AddCheckpointParticipantsRequest = components['schemas']['AddCheckpointParticipantsRequest']
export type CheckpointSession = components['schemas']['CheckpointSessionResponse']
export type CheckpointParticipant = components['schemas']['CheckpointParticipantResponse']
export type SubmitCheckpointResultRequest = components['schemas']['SubmitCheckpointResultRequest']
export type CheckpointResult = components['schemas']['CheckpointResultResponse']
export type UpdateCheckpointSessionRequest = components['schemas']['UpdateCheckpointSessionRequest']
export type UpdateCheckpointSessionStatusRequest = components['schemas']['UpdateCheckpointSessionStatusRequest']
export type CheckpointSessionPage = components['schemas']['PageResponseCheckpointSessionResponse']
export type StudentCheckpointStatus = components['schemas']['StudentCheckpointStatusResponse']
export type AdminEvaluator = components['schemas']['AdminEvaluatorResponse']
export type AdminEvaluatorPage = components['schemas']['PageResponseAdminEvaluatorResponse']
export type CheckpointResultValue = 'PASS' | 'NOT_PASS'
export type CheckpointSessionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface CheckpointEligibleQueryParams {
  programId?: number
  blockNumber?: number
  weekStart?: string
  weekEnd?: string
}

export interface CheckpointSessionQueryParams extends CheckpointEligibleQueryParams {
  status?: string
  page?: number
  size?: number
}

export interface EvaluatorQueryParams {
  keyword?: string
  page?: number
  size?: number
}
