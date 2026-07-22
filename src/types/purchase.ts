import type { components } from '../api/openapi'

export type Purchase = components['schemas']['PurchaseResponse']
export type PurchasePage = components['schemas']['PageResponsePurchaseResponse']
export type CreatePurchaseRequest = components['schemas']['CreatePurchaseRequest']
export type UpdatePurchaseStatusRequest = components['schemas']['UpdatePurchaseStatusRequest']
export type PurchaseEvent = components['schemas']['PurchaseEventResponse']
export type PurchaseStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'EXPIRED' | (string & {})

export interface AdminPurchaseQueryParams {
  studentId?: string
  programId?: string
  status?: string
  page?: number
  size?: number
}
