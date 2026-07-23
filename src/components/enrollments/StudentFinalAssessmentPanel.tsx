import { useEffect, useMemo, useState } from 'react'
import { Award, CheckCircle2, ExternalLink, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '../common/Button'
import { PurchasePaymentPanel } from '../purchases/PurchasePaymentPanel'
import {
  useCreateFinalAssessmentRetakePayment,
  useGetFinalAssessmentRetakePayments,
  useGetStudentFinalAssessmentStatus,
} from '../../hooks/useFinalAssessment'
import type { FinalAssessmentRetakePayment } from '../../types/finalAssessment'
import type { Purchase } from '../../types/purchase'
import { getFriendlyApiErrorMessage, isForbiddenError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

interface StudentFinalAssessmentPanelProps {
  enrollmentId?: number
  onForbidden?: () => void
}

export function StudentFinalAssessmentPanel({ enrollmentId, onForbidden }: StudentFinalAssessmentPanelProps) {
  const statusQuery = useGetStudentFinalAssessmentStatus(enrollmentId, !!enrollmentId)
  const paymentsQuery = useGetFinalAssessmentRetakePayments({ enrollmentId }, !!enrollmentId)
  const createPaymentMutation = useCreateFinalAssessmentRetakePayment()
  const [clientError, setClientError] = useState<string | null>(null)
  const status = statusQuery.data
  const latestPayment = useMemo(
    () => status?.latestRetakePayment || getLatestRetakePayment(paymentsQuery.data ?? []),
    [paymentsQuery.data, status?.latestRetakePayment]
  )
  const activePayment = latestPayment && ['PENDING', 'PAID'].includes(latestPayment.status || '') ? latestPayment : undefined
  const shouldRender =
    !!status &&
    (status.eligible ||
      status.sessionId ||
      status.lastResult ||
      status.retakeRequired ||
      status.enrollmentStatus === 'WAITING_FOR_REASSESSMENT' ||
      !!activePayment)
  const forbiddenError = isForbiddenError(statusQuery.error) || isForbiddenError(paymentsQuery.error)

  useEffect(() => {
    if (forbiddenError) {
      onForbidden?.()
    }
  }, [forbiddenError, onForbidden])

  const createRetakePayment = async () => {
    if (!enrollmentId) return

    try {
      setClientError(null)
      await createPaymentMutation.mutateAsync({ enrollmentId })
      await Promise.all([statusQuery.refetch(), paymentsQuery.refetch()])
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Could not create final assessment retake payment'))
    }
  }

  if (!enrollmentId) return null

  if (statusQuery.isLoading) {
    return (
      <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
        Checking final assessment status...
      </div>
    )
  }

  if (forbiddenError) {
    return (
      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        You do not have permission to access this final assessment status. Enrollment data is being refreshed.
      </div>
    )
  }

  if (statusQuery.isError) return null
  if (!shouldRender) return null

  return (
    <div className="mt-5 rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-foreground">Final assessment</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{getFinalStatusCopy(status.enrollmentStatus, status.lastResult, status.retakeRequired)}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={statusQuery.isFetching || paymentsQuery.isFetching}
          onClick={() => {
            void statusQuery.refetch()
            void paymentsQuery.refetch()
          }}
        >
          <RefreshCw className={`h-4 w-4 ${statusQuery.isFetching || paymentsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <FinalMeta label="Eligible" value={status.eligible ? 'Yes' : 'No'} />
        <FinalMeta label="Session" value={status.sessionStatus || (status.sessionId ? `#${status.sessionId}` : 'Not scheduled')} />
        <FinalMeta label="Evaluator" value={status.evaluatorName || (status.evaluatorId ? `Evaluator #${status.evaluatorId}` : '-')} />
        <FinalMeta label="Scheduled" value={status.scheduledAt ? formatDateTime(status.scheduledAt) : '-'} />
        <FinalMeta label="Last result" value={status.lastResult || 'No result yet'} />
        <FinalMeta label="Last evaluated" value={status.lastEvaluatedAt ? formatDateTime(status.lastEvaluatedAt) : '-'} />
      </div>

      {status.meetLink && (
        <a className="mt-4 inline-flex items-center gap-2 font-extrabold text-primary hover:underline" href={status.meetLink} target="_blank" rel="noreferrer">
          Open final assessment Meet
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      {status.lastComment && (
        <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
          {status.lastComment}
        </div>
      )}

      {activePayment ? (
        <div className="mt-4">
          <PurchasePaymentPanel
            purchase={activePayment as unknown as Purchase}
            compact={activePayment.status === 'PAID'}
            showCourse={false}
            isRefreshing={statusQuery.isFetching || paymentsQuery.isFetching}
            onRefresh={() => {
              void statusQuery.refetch()
              void paymentsQuery.refetch()
            }}
          />
          {activePayment.status === 'PAID' && (
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              Payment confirmed. Vera will schedule your final retake session.
            </div>
          )}
        </div>
      ) : status.retakeRequired || status.enrollmentStatus === 'WAITING_FOR_REASSESSMENT' ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold">Retake payment required</p>
              <p className="mt-1">Create a retake payment only after a NOT_PASS final result. Backend will block this action if the retake price is not configured or a payment is already pending.</p>
            </div>
          </div>
          <Button type="button" className="mt-3" disabled={createPaymentMutation.isPending} onClick={() => void createRetakePayment()}>
            {createPaymentMutation.isPending ? 'Creating payment...' : 'Create retake payment'}
          </Button>
        </div>
      ) : null}

      {clientError && <div className="mt-4 lms-alert-error text-sm">{clientError}</div>}
    </div>
  )
}

function FinalMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  )
}

function getFinalStatusCopy(enrollmentStatus?: string, lastResult?: string, retakeRequired?: boolean) {
  if (lastResult === 'PASS') return 'Final assessment passed. Your enrollment is complete.'
  if (lastResult === 'NOT_PASS' || retakeRequired || enrollmentStatus === 'WAITING_FOR_REASSESSMENT') {
    return 'Final assessment was not passed. Complete retake payment before Vera schedules another final session.'
  }
  if (enrollmentStatus === 'COMPLETED') return 'Final assessment complete.'
  return 'Your final assessment status is managed by Vera and your evaluator.'
}

function getLatestRetakePayment(payments: FinalAssessmentRetakePayment[]) {
  return payments
    .slice()
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0]
}
