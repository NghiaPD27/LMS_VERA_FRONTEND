import { useMemo, useState } from 'react'
import { FileSearch, Filter, RefreshCw, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetAuditLog, useGetAuditLogs } from '../../hooks/useAuditLogs'
import { AUDIT_ACTIONS, type AuditLog } from '../../types/auditLog'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function AuditLogsPage() {
  const [action, setAction] = useState('')
  const [actorId, setActorId] = useState('')
  const [targetType, setTargetType] = useState('')
  const [targetId, setTargetId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<number | undefined>()

  const queryParams = useMemo(
    () => ({
      action: action || undefined,
      actorId: toNumber(actorId),
      targetType: targetType || undefined,
      targetId: toNumber(targetId),
      from: from ? toIsoDateTime(from) : undefined,
      to: to ? toIsoDateTime(to) : undefined,
      page,
      size: 12,
    }),
    [action, actorId, from, page, targetId, targetType, to]
  )

  const logsQuery = useGetAuditLogs(queryParams)
  const detailQuery = useGetAuditLog(selectedId, !!selectedId)
  const rows = logsQuery.data?.content ?? []
  const totalPages = logsQuery.data?.totalPages ?? 0
  const hasFilters = action || actorId || targetType || targetId || from || to

  const resetFilters = () => {
    setAction('')
    setActorId('')
    setTargetType('')
    setTargetId('')
    setFrom('')
    setTo('')
    setPage(0)
  }

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Audit logs</h1>
              <p className="lms-section-description">Review security-sensitive admin, teacher, checkpoint and final assessment actions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="font-extrabold text-foreground">Filters</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          <select value={action} onChange={(event) => changeFilter(setAction)(event.target.value)} className="lms-input" data-testid="audit-action-filter">
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={actorId} onChange={(event) => changeFilter(setActorId)(event.target.value)} type="number" className="lms-input pl-9" placeholder="Actor ID" />
          </div>
          <input value={targetType} onChange={(event) => changeFilter(setTargetType)(event.target.value)} className="lms-input" placeholder="Target type" />
          <input value={targetId} onChange={(event) => changeFilter(setTargetId)(event.target.value)} type="number" className="lms-input" placeholder="Target ID" />
          <label className="space-y-1 text-sm font-bold text-foreground">
            <span>From</span>
            <input value={from} onChange={(event) => changeFilter(setFrom)(event.target.value)} type="datetime-local" className="lms-input" />
          </label>
          <label className="space-y-1 text-sm font-bold text-foreground">
            <span>To exclusive</span>
            <input value={to} onChange={(event) => changeFilter(setTo)(event.target.value)} type="datetime-local" className="lms-input" />
          </label>
        </div>
        {hasFilters && <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={resetFilters}>Clear filters</Button>}
      </div>

      <div className="lms-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Activity trail</h2>
            <p className="text-sm text-muted-foreground">{logsQuery.data?.totalElements ?? 0} events found.</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={logsQuery.isFetching} onClick={() => void logsQuery.refetch()}>
            <RefreshCw className={`h-4 w-4 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {logsQuery.isLoading ? (
          <LoadingState message="Loading audit logs..." />
        ) : logsQuery.isError ? (
          <div className="m-5 lms-alert-error">{getFriendlyApiErrorMessage(logsQuery.error, 'Failed to load audit logs')}</div>
        ) : rows.length === 0 ? (
          <EmptyState message="No audit logs" description="Try another action, target, or date range." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((log) => (
                  <AuditRow key={log.id} log={log} onOpen={() => setSelectedId(log.id)} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" disabled={page === 0 || logsQuery.isFetching} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button type="button" variant="outline" disabled={page + 1 >= totalPages || logsQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </div>
      </div>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit event detail</DialogTitle>
            <DialogDescription>Fetched from the dedicated audit detail endpoint.</DialogDescription>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <LoadingState message="Loading audit event..." />
          ) : detailQuery.isError ? (
            <div className="lms-alert-error">{getFriendlyApiErrorMessage(detailQuery.error, 'Failed to load audit event')}</div>
          ) : detailQuery.data ? (
            <AuditDetail log={detailQuery.data} />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function AuditRow({ log, onOpen }: { log: AuditLog; onOpen: () => void }) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{log.createdAt ? formatDateTime(log.createdAt) : '-'}</TableCell>
      <TableCell><ActionBadge value={log.action} /></TableCell>
      <TableCell>
        <p className="font-bold text-foreground">{log.actorUsername || '-'}</p>
        <p className="text-xs text-muted-foreground">{log.actorId ? `#${log.actorId}` : '-'}</p>
      </TableCell>
      <TableCell>
        <p className="font-medium text-foreground">{log.targetType || '-'}</p>
        <p className="text-xs text-muted-foreground">{log.targetId ? `#${log.targetId}` : '-'}</p>
      </TableCell>
      <TableCell className="max-w-sm truncate text-sm text-muted-foreground">{log.details || '-'}</TableCell>
      <TableCell className="text-right">
        <Button type="button" variant="outline" size="sm" disabled={!log.id} onClick={onOpen}>View</Button>
      </TableCell>
    </TableRow>
  )
}

function AuditDetail({ log }: { log: AuditLog }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailTile label="Action" value={formatLabel(log.action || '-')} />
        <DetailTile label="Created at" value={log.createdAt ? formatDateTime(log.createdAt) : '-'} />
        <DetailTile label="Actor" value={`${log.actorUsername || '-'}${log.actorId ? ` (#${log.actorId})` : ''}`} />
        <DetailTile label="Target" value={`${log.targetType || '-'}${log.targetId ? ` #${log.targetId}` : ''}`} />
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Details</p>
        <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{log.details || '-'}</pre>
      </div>
    </div>
  )
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  )
}

function ActionBadge({ value }: { value?: string }) {
  return <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground">{formatLabel(value || '-')}</span>
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function toNumber(value: string) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toIsoDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}
