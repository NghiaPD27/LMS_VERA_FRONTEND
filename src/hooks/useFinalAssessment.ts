import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { finalAssessmentApi } from '../api/finalAssessmentApi'
import type {
  AddFinalAssessmentParticipantsRequest,
  CreateFinalAssessmentRetakePaymentRequest,
  CreateFinalAssessmentSessionRequest,
  FinalAssessmentEligibleQueryParams,
  FinalAssessmentRetakePaymentQueryParams,
  FinalAssessmentSessionQueryParams,
  SubmitFinalAssessmentResultRequest,
  UpdateFinalAssessmentSessionRequest,
  UpdateFinalAssessmentSessionStatusRequest,
} from '../types/finalAssessment'

export const finalEligibleQueryKey = (params: FinalAssessmentEligibleQueryParams = {}) => ['final-assessment-eligible', params] as const
export const adminFinalSessionsQueryKey = (params: FinalAssessmentSessionQueryParams = {}) => ['admin-final-assessment-sessions', params] as const
export const adminFinalSessionQueryKey = (id?: number) => ['admin-final-assessment-session', id] as const
export const studentFinalStatusQueryKey = (enrollmentId?: number) => ['student-final-assessment-status', enrollmentId] as const
export const finalRetakePaymentsQueryKey = (params: FinalAssessmentRetakePaymentQueryParams = {}) => ['student-final-retake-payments', params] as const
export const evaluatorFinalSessionsQueryKey = ['evaluator-final-assessment-sessions'] as const
export const evaluatorFinalSessionQueryKey = (id?: number) => ['evaluator-final-assessment-session', id] as const

export const useGetFinalAssessmentEligibleStudents = (params: FinalAssessmentEligibleQueryParams = {}) =>
  useQuery({
    queryKey: finalEligibleQueryKey(params),
    queryFn: () => finalAssessmentApi.getEligibleStudents(params),
    retry: false,
  })

export const useGetAdminFinalAssessmentSessions = (params: FinalAssessmentSessionQueryParams = {}) =>
  useQuery({
    queryKey: adminFinalSessionsQueryKey(params),
    queryFn: () => finalAssessmentApi.getAdminSessions(params),
    retry: false,
  })

export const useGetAdminFinalAssessmentSession = (id?: number, enabled = true) =>
  useQuery({
    queryKey: adminFinalSessionQueryKey(id),
    queryFn: () => finalAssessmentApi.getAdminSession(id as number),
    enabled: !!id && enabled,
    retry: false,
  })

export const useCreateFinalAssessmentSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinalAssessmentSessionRequest) => finalAssessmentApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-assessment-eligible'] })
      queryClient.invalidateQueries({ queryKey: ['admin-final-assessment-sessions'] })
    },
  })
}

export const useUpdateFinalAssessmentSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateFinalAssessmentSessionRequest }) =>
      finalAssessmentApi.updateSession(sessionId, data),
    onSuccess: (session) => {
      queryClient.setQueryData(adminFinalSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-final-assessment-sessions'] })
    },
  })
}

export const useUpdateFinalAssessmentSessionStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateFinalAssessmentSessionStatusRequest }) =>
      finalAssessmentApi.updateSessionStatus(sessionId, data),
    onSuccess: (session) => {
      queryClient.setQueryData(adminFinalSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-final-assessment-sessions'] })
    },
  })
}

export const useAddFinalAssessmentParticipants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: AddFinalAssessmentParticipantsRequest }) =>
      finalAssessmentApi.addParticipants(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-assessment-eligible'] })
      queryClient.invalidateQueries({ queryKey: ['admin-final-assessment-sessions'] })
      queryClient.invalidateQueries({ queryKey: evaluatorFinalSessionsQueryKey })
    },
  })
}

export const useRemoveFinalAssessmentParticipant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, participantId }: { sessionId: number; participantId: number }) =>
      finalAssessmentApi.removeParticipant(sessionId, participantId),
    onSuccess: (session) => {
      queryClient.setQueryData(adminFinalSessionQueryKey(session.id), session)
      queryClient.invalidateQueries({ queryKey: ['admin-final-assessment-sessions'] })
      queryClient.invalidateQueries({ queryKey: evaluatorFinalSessionsQueryKey })
    },
  })
}

export const useGetStudentFinalAssessmentStatus = (enrollmentId?: number, enabled = true) =>
  useQuery({
    queryKey: studentFinalStatusQueryKey(enrollmentId),
    queryFn: () => finalAssessmentApi.getStudentStatus(enrollmentId as number),
    enabled: !!enrollmentId && enabled,
    retry: false,
  })

export const useGetFinalAssessmentRetakePayments = (params: FinalAssessmentRetakePaymentQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: finalRetakePaymentsQueryKey(params),
    queryFn: () => finalAssessmentApi.getRetakePayments(params),
    enabled,
    retry: false,
  })

export const useCreateFinalAssessmentRetakePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinalAssessmentRetakePaymentRequest) => finalAssessmentApi.createRetakePayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['student-final-retake-payments'] })
      if (payment.enrollmentId) {
        queryClient.invalidateQueries({ queryKey: studentFinalStatusQueryKey(payment.enrollmentId) })
      }
    },
  })
}

export const useGetEvaluatorFinalAssessmentSessions = () =>
  useQuery({
    queryKey: evaluatorFinalSessionsQueryKey,
    queryFn: finalAssessmentApi.getEvaluatorSessions,
    retry: false,
  })

export const useGetEvaluatorFinalAssessmentSession = (id?: number, enabled = true) =>
  useQuery({
    queryKey: evaluatorFinalSessionQueryKey(id),
    queryFn: () => finalAssessmentApi.getEvaluatorSession(id as number),
    enabled: !!id && enabled,
    retry: false,
  })

export const useSubmitFinalAssessmentResult = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitFinalAssessmentResultRequest) => finalAssessmentApi.submitResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluatorFinalSessionsQueryKey })
    },
  })
}
