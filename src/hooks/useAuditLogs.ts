import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '../api/auditLogApi'
import type { AuditLogQueryParams } from '../types/auditLog'

export const auditLogsQueryKey = (params: AuditLogQueryParams = {}) => ['admin-audit-logs', params] as const
export const auditLogQueryKey = (id?: number) => ['admin-audit-log', id] as const

export const useGetAuditLogs = (params: AuditLogQueryParams = {}) =>
  useQuery({
    queryKey: auditLogsQueryKey(params),
    queryFn: () => auditLogApi.getAuditLogs(params),
    retry: false,
  })

export const useGetAuditLog = (id?: number, enabled = true) =>
  useQuery({
    queryKey: auditLogQueryKey(id),
    queryFn: () => auditLogApi.getAuditLog(id as number),
    enabled: !!id && enabled,
    retry: false,
  })
