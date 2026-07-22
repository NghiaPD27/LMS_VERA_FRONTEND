import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkpointApi } from '../api/checkpointApi'
import type {
  AddCheckpointParticipantsRequest,
  CheckpointEligibleQueryParams,
  CheckpointSessionQueryParams,
  CreateCheckpointSessionRequest,
  EvaluatorQueryParams,
  SubmitCheckpointResultRequest,
  UpdateCheckpointSessionRequest,
  UpdateCheckpointSessionStatusRequest,
} from '../types/checkpoint'

export const checkpointEligibleQueryKey = (params: CheckpointEligibleQueryParams = {}) => ['checkpoint-eligible', params] as const
export const adminEvaluatorsQueryKey = (params: EvaluatorQueryParams = {}) => ['admin-evaluators', params] as const
export const adminCheckpointSessionsQueryKey = (params: CheckpointSessionQueryParams = {}) => ['admin-checkpoint-sessions', params] as const
export const adminCheckpointSessionQueryKey = (id?: number) => ['admin-checkpoint-session', id] as const
export const studentCheckpointStatusQueryKey = (lessonId?: number) => ['student-checkpoint-status', lessonId] as const
export const evaluatorCheckpointSessionsQueryKey = ['evaluator-checkpoint-sessions'] as const
export const evaluatorCheckpointSessionQueryKey = (id?: number) => ['evaluator-checkpoint-session', id] as const

export const useGetCheckpointEligibleStudents = (params: CheckpointEligibleQueryParams = {}) =>
  useQuery({
    queryKey: checkpointEligibleQueryKey(params),
    queryFn: () => checkpointApi.getEligibleStudents(params),
    retry: false,
  })

export const useGetAdminEvaluators = (params: EvaluatorQueryParams = {}) =>
  useQuery({
    queryKey: adminEvaluatorsQueryKey(params),
    queryFn: () => checkpointApi.getEvaluators(params),
    retry: false,
  })

export const useGetAdminCheckpointSessions = (params: CheckpointSessionQueryParams = {}) =>
  useQuery({
    queryKey: adminCheckpointSessionsQueryKey(params),
    queryFn: () => checkpointApi.getAdminSessions(params),
    retry: false,
  })

export const useGetAdminCheckpointSession = (id?: number, enabled = true) =>
  useQuery({
    queryKey: adminCheckpointSessionQueryKey(id),
    queryFn: () => checkpointApi.getAdminSession(id as number),
    enabled: !!id && enabled,
    retry: false,
  })

export const useCreateCheckpointSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCheckpointSessionRequest) => checkpointApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoint-eligible'] })
      queryClient.invalidateQueries({ queryKey: ['admin-checkpoint-sessions'] })
    },
  })
}

export const useUpdateCheckpointSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateCheckpointSessionRequest }) =>
      checkpointApi.updateSession(sessionId, data),
    onSuccess: (session) => {
      queryClient.setQueryData(adminCheckpointSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-checkpoint-sessions'] })
    },
  })
}

export const useUpdateCheckpointSessionStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateCheckpointSessionStatusRequest }) =>
      checkpointApi.updateSessionStatus(sessionId, data),
    onSuccess: (session) => {
      queryClient.setQueryData(adminCheckpointSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-checkpoint-sessions'] })
    },
  })
}

export const useAddCheckpointParticipants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AddCheckpointParticipantsRequest }) =>
      checkpointApi.addParticipants(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoint-eligible'] })
      queryClient.invalidateQueries({ queryKey: ['admin-checkpoint-sessions'] })
      queryClient.invalidateQueries({ queryKey: evaluatorCheckpointSessionsQueryKey })
    },
  })
}

export const useRemoveCheckpointParticipant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, participantId }: { sessionId: number; participantId: number }) =>
      checkpointApi.removeParticipant(sessionId, participantId),
    onSuccess: (session) => {
      queryClient.setQueryData(adminCheckpointSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-checkpoint-sessions'] })
      queryClient.invalidateQueries({ queryKey: evaluatorCheckpointSessionsQueryKey })
    },
  })
}

export const useGetStudentCheckpointStatus = (lessonId?: number, enabled = true) =>
  useQuery({
    queryKey: studentCheckpointStatusQueryKey(lessonId),
    queryFn: () => checkpointApi.getStudentStatus(lessonId as number),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useGetEvaluatorCheckpointSessions = () =>
  useQuery({
    queryKey: evaluatorCheckpointSessionsQueryKey,
    queryFn: checkpointApi.getEvaluatorSessions,
    retry: false,
  })

export const useGetEvaluatorCheckpointSession = (id?: number, enabled = true) =>
  useQuery({
    queryKey: evaluatorCheckpointSessionQueryKey(id),
    queryFn: () => checkpointApi.getEvaluatorSession(id as number),
    enabled: !!id && enabled,
    retry: false,
  })

export const useSubmitCheckpointResult = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitCheckpointResultRequest) => checkpointApi.submitResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluatorCheckpointSessionsQueryKey })
    },
  })
}
