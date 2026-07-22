import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseApi } from '../api/purchaseApi'
import type { AdminPurchaseQueryParams, CreatePurchaseRequest, UpdatePurchaseStatusRequest } from '../types/purchase'

export const studentPurchasesQueryKey = ['student-purchases'] as const
export const adminPurchasesQueryKey = ['admin-purchases'] as const

interface PurchaseQueryOptions {
  enabled?: boolean
  refetchInterval?: number | false
}

export const studentPurchaseQueryKey = (id?: number) => ['student-purchase', id] as const
export const adminPurchaseQueryKey = (id?: number) => ['admin-purchase', id] as const
export const purchaseEventsQueryKey = (id?: number) => ['admin-purchase-events', id] as const

export const useGetStudentPurchases = (options: PurchaseQueryOptions = {}) =>
  useQuery({
    queryKey: studentPurchasesQueryKey,
    queryFn: purchaseApi.getStudentPurchases,
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
  })

export const useGetStudentPurchase = (id?: number, options: PurchaseQueryOptions = {}) =>
  useQuery({
    queryKey: studentPurchaseQueryKey(id),
    queryFn: () => purchaseApi.getStudentPurchase(id as number),
    enabled: !!id && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
  })

export const useCreateStudentPurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) => purchaseApi.createStudentPurchase(data),
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: studentPurchasesQueryKey })
      if (purchase.id) {
        queryClient.invalidateQueries({ queryKey: studentPurchaseQueryKey(purchase.id) })
      }
    },
  })
}

export const useGetAdminPurchases = (params: AdminPurchaseQueryParams = {}) =>
  useQuery({
    queryKey: [...adminPurchasesQueryKey, params],
    queryFn: () => purchaseApi.getAdminPurchases(params),
  })

export const useGetAdminPurchase = (id?: number, enabled = true) =>
  useQuery({
    queryKey: adminPurchaseQueryKey(id),
    queryFn: () => purchaseApi.getAdminPurchase(id as number),
    enabled: !!id && enabled,
  })

export const useGetPurchaseEvents = (id?: number, enabled = true) =>
  useQuery({
    queryKey: purchaseEventsQueryKey(id),
    queryFn: () => purchaseApi.getPurchaseEvents(id as number),
    enabled: !!id && enabled,
  })

export const useMarkPurchasePaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => purchaseApi.markPurchasePaid(id),
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: adminPurchasesQueryKey })
      if (purchase.id) {
        queryClient.invalidateQueries({ queryKey: adminPurchaseQueryKey(purchase.id) })
        queryClient.invalidateQueries({ queryKey: purchaseEventsQueryKey(purchase.id) })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      queryClient.invalidateQueries({ queryKey: studentPurchasesQueryKey })
      if (purchase.id) {
        queryClient.invalidateQueries({ queryKey: studentPurchaseQueryKey(purchase.id) })
      }
    },
  })
}

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseStatusRequest }) =>
      purchaseApi.updatePurchaseStatus(id, data),
    onSuccess: (purchase, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPurchasesQueryKey })
      queryClient.invalidateQueries({ queryKey: purchaseEventsQueryKey(variables.id) })
      queryClient.setQueryData(adminPurchaseQueryKey(variables.id), purchase)
      queryClient.invalidateQueries({ queryKey: studentPurchasesQueryKey })
      if (purchase.id) {
        queryClient.invalidateQueries({ queryKey: studentPurchaseQueryKey(purchase.id) })
      }
    },
  })
}
