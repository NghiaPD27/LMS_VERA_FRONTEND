import { http } from './client'
import type {
  AdminPurchaseQueryParams,
  CreatePurchaseRequest,
  Purchase,
  PurchasePage
} from '../types/purchase'

export const purchaseApi = {
  getStudentPurchases: async (): Promise<Purchase[]> => {
    const response = await http.get('/student/purchases')
    return response.data
  },

  createStudentPurchase: async (data: CreatePurchaseRequest): Promise<Purchase> => {
    const response = await http.post('/student/purchases', data)
    return response.data
  },

  getStudentPurchase: async (id: number): Promise<Purchase> => {
    const response = await http.get(`/student/purchases/${id}`)
    return response.data
  },

  getAdminPurchases: async (params: AdminPurchaseQueryParams = {}): Promise<PurchasePage> => {
    const response = await http.get('/admin/purchases', { params })
    return response.data
  },

  markPurchasePaid: async (id: number): Promise<Purchase> => {
    const response = await http.post(`/admin/purchases/${id}/mark-paid`)
    return response.data
  },
}
