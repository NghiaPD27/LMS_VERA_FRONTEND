import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseApi } from '../api/purchaseApi'
import type { AdminPurchaseQueryParams, CreatePurchaseRequest } from '../types/purchase'

export const studentPurchasesQueryKey = ['student-purchases'] as const
export const adminPurchasesQueryKey = ['admin-purchases'] as const

interface PurchaseQueryOptions {
  enabled?: boolean
  refetchInterval?: number | false
}

export const studentPurchaseQueryKey = (id?: number) => ['student-purchase', id] as const

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

export const useMarkPurchasePaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => purchaseApi.markPurchasePaid(id),
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: adminPurchasesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      queryClient.invalidateQueries({ queryKey: studentPurchasesQueryKey })
      if (purchase.id) {
        queryClient.invalidateQueries({ queryKey: studentPurchaseQueryKey(purchase.id) })
      }
    },
  })
}
