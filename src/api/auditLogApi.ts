import { http } from './client'
import type { AuditLog, AuditLogPage, AuditLogQueryParams } from '../types/auditLog'

export const auditLogApi = {
  getAuditLogs: async (params: AuditLogQueryParams = {}): Promise<AuditLogPage> => {
    const response = await http.get('/admin/audit-logs', { params })
    return response.data
  },

  getAuditLog: async (id: number): Promise<AuditLog> => {
    const response = await http.get(`/admin/audit-logs/${id}`)
    return response.data
  },
}
