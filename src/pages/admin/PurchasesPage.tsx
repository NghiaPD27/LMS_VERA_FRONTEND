import { useState } from 'react'
import { ClipboardList, ReceiptText, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { PurchaseStatusBadge } from '../../components/purchases/PurchaseStatusBadge'
import { useGetAdminPurchase, useGetAdminPurchases, useGetPurchaseEvents, useMarkPurchasePaid, useUpdatePurchaseStatus } from '../../hooks/usePurchases'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export function PurchasesPage() {
  const [studentId, setStudentId] = useState('')
  const [programId, setProgramId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | undefined>()
  const [nextStatus, setNextStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [rowError, setRowError] = useState<string | null>(null)
  const [rowMessage, setRowMessage] = useState<string | null>(null)

  const purchasesQuery = useGetAdminPurchases({
    studentId: studentId || undefined,
    programId: programId || undefined,
    status: status || undefined,
    page,
    size: 10,
  })
  const selectedPurchaseQuery = useGetAdminPurchase(selectedPurchaseId, !!selectedPurchaseId)
  const purchaseEventsQuery = useGetPurchaseEvents(selectedPurchaseId, !!selectedPurchaseId)
  const markPaidMutation = useMarkPurchasePaid()
  const updateStatusMutation = useUpdatePurchaseStatus()
  const purchases = purchasesQuery.data?.content ?? []
  const totalPages = purchasesQuery.data?.totalPages ?? 0
  const selectedPurchase = selectedPurchaseQuery.data || purchases.find((purchase) => purchase.id === selectedPurchaseId)

  const handleMarkPaid = async (id?: number) => {
    if (!id) return
    try {
      setRowError(null)
      setRowMessage(null)
      await markPaidMutation.mutateAsync(id)
      setSelectedPurchaseId(id)
      setRowMessage(`Purchase #${id} marked paid.`)
    } catch (error) {
      await purchasesQuery.refetch()
      setRowError(getFriendlyApiErrorMessage(error, 'The purchase status may have changed. The list has been refreshed.'))
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedPurchaseId || !nextStatus) {
      setRowError('Choose a purchase and target status.')
      return
    }

    try {
      setRowError(null)
      setRowMessage(null)
      await updateStatusMutation.mutateAsync({
        id: selectedPurchaseId,
        data: {
          status: nextStatus,
          note: statusNote.trim() || undefined,
        },
      })
      setStatusNote('')
      setRowMessage(`Purchase #${selectedPurchaseId} status updated to ${nextStatus}.`)
    } catch (error) {
      await purchasesQuery.refetch()
      setRowError(getFriendlyApiErrorMessage(error, 'Failed to update purchase status'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <ReceiptText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Purchases</h1>
              <p className="lms-section-description">
                Review course purchase requests and manually confirm payments during the MVP phase.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-surface grid gap-3 p-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
        <div>
          <label htmlFor="purchase-student-id" className="text-sm font-semibold text-foreground">Student Code</label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="purchase-student-id"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value)
                setPage(0)
              }}
              className="lms-input pl-9"
              placeholder="Student code"
            />
          </div>
        </div>
        <div>
          <label htmlFor="purchase-program-id" className="text-sm font-semibold text-foreground">Program Code</label>
          <input
            id="purchase-program-id"
            value={programId}
            onChange={(event) => {
              setProgramId(event.target.value)
              setPage(0)
            }}
            className="lms-input mt-1"
            placeholder="Program code"
          />
        </div>
        <div>
          <label htmlFor="purchase-status" className="text-sm font-semibold text-foreground">Status</label>
          <select
            id="purchase-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(0)
            }}
            className="lms-input mt-1"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="FAILED">FAILED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStudentId('')
            setProgramId('')
            setStatus('')
            setPage(0)
          }}
        >
          Clear Filters
        </Button>
      </div>

      {rowError && <div className="lms-alert-error">{rowError}</div>}
      {rowMessage && <div className="lms-alert-success">{rowMessage}</div>}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="lms-surface overflow-hidden">
        {purchasesQuery.isLoading ? (
          <LoadingState message="Loading purchases..." />
        ) : purchasesQuery.isError ? (
          <div className="m-5 lms-alert-error">
            {getFriendlyApiErrorMessage(purchasesQuery.error, 'Failed to load purchases')}
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState message="No purchases found" description="Adjust filters or wait for learners to create new purchase requests." />
        ) : (
          <Table data-testid="admin-purchases-table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id} data-testid={`admin-purchase-row-${purchase.id}`}>
                  <TableCell>
                    <p className="font-semibold text-foreground">{purchase.studentName || `Student #${purchase.studentId}`}</p>
                    <p className="text-sm text-muted-foreground">{purchase.studentEmail || '-'}</p>
                  </TableCell>
                  <TableCell>{purchase.programName || `Program #${purchase.programId}`}</TableCell>
                  <TableCell>{formatCurrency(purchase.amount, purchase.currency || 'VND')}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-foreground">{purchase.paymentProvider || 'SEPAY'}</p>
                    <p className="text-sm text-muted-foreground">{purchase.paymentCode || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <PurchaseStatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(purchase.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPurchaseId(purchase.id)
                          setNextStatus('')
                          setStatusNote('')
                        }}
                      >
                        Detail
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={purchase.status === 'PENDING' ? 'default' : 'outline'}
                        disabled={purchase.status !== 'PENDING' || markPaidMutation.isPending}
                        onClick={() => handleMarkPaid(purchase.id)}
                        data-testid={`mark-purchase-paid-${purchase.id}`}
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <aside className="lms-surface h-fit p-5">
        <div className="mb-4 flex items-start gap-3">
          <ClipboardList className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-extrabold text-foreground">Purchase detail</h2>
            <p className="mt-1 text-sm text-muted-foreground">Inspect status history and handle non-paid outcomes.</p>
          </div>
        </div>

        {!selectedPurchaseId ? (
          <p className="text-sm text-muted-foreground">Choose a purchase from the table.</p>
        ) : selectedPurchaseQuery.isLoading ? (
          <LoadingState message="Loading purchase detail..." />
        ) : selectedPurchaseQuery.isError ? (
          <div className="lms-alert-error">{getFriendlyApiErrorMessage(selectedPurchaseQuery.error, 'Failed to load purchase detail')}</div>
        ) : selectedPurchase ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <PurchaseDetailRow label="Purchase" value={`#${selectedPurchase.id ?? selectedPurchaseId}`} />
              <PurchaseDetailRow label="Student" value={selectedPurchase.studentName || `Student #${selectedPurchase.studentId ?? '-'}`} />
              <PurchaseDetailRow label="Program" value={selectedPurchase.programName || `Program #${selectedPurchase.programId ?? '-'}`} />
              <PurchaseDetailRow label="Amount" value={formatCurrency(selectedPurchase.amount, selectedPurchase.currency || 'VND')} />
              <PurchaseDetailRow label="Status" value={selectedPurchase.status || '-'} />
              <PurchaseDetailRow label="Payment code" value={selectedPurchase.paymentCode || '-'} />
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <label htmlFor="purchase-next-status" className="text-sm font-bold text-foreground">Update status</label>
              <select
                id="purchase-next-status"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                className="lms-input mt-1"
                disabled={selectedPurchase.status === 'PAID'}
              >
                <option value="">Choose status</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="FAILED">FAILED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                className="lms-input mt-3 min-h-20"
                maxLength={500}
                placeholder="Optional note"
                disabled={selectedPurchase.status === 'PAID'}
              />
              {selectedPurchase.status === 'PAID' && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">Paid purchases cannot be moved to another status.</p>
              )}
              <Button
                type="button"
                className="mt-3 w-full"
                disabled={!nextStatus || selectedPurchase.status === 'PAID' || updateStatusMutation.isPending}
                onClick={() => void handleUpdateStatus()}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update purchase'}
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-extrabold text-foreground">Events</p>
              {purchaseEventsQuery.isLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
              ) : purchaseEventsQuery.isError ? (
                <p className="mt-2 text-sm text-red-700">{getFriendlyApiErrorMessage(purchaseEventsQuery.error, 'Failed to load events')}</p>
              ) : (purchaseEventsQuery.data ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No status events yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {purchaseEventsQuery.data?.map((event) => (
                    <div key={event.id || `${event.oldStatus}-${event.newStatus}-${event.createdAt}`} className="rounded-md border border-border bg-white p-3 text-sm">
                      <p className="font-bold text-foreground">{event.oldStatus || 'NEW'} to {event.newStatus || '-'}</p>
                      <p className="text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                      {event.note && <p className="mt-1 text-muted-foreground">{event.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </aside>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
          Previous
        </Button>
        <span>
          Page {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <Button type="button" variant="outline" size="sm" disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>
    </section>
  )
}

function PurchaseDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-foreground">{value}</span>
    </div>
  )
}
