import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, QrCode, ReceiptText } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { PurchasePaymentPanel } from '../../components/purchases/PurchasePaymentPanel'
import { PurchaseStatusBadge } from '../../components/purchases/PurchaseStatusBadge'
import { useGetStudentPurchases } from '../../hooks/usePurchases'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export function MyPurchasesPage() {
  const queryClient = useQueryClient()
  const { data: purchases, isLoading, isError, error, refetch } = useGetStudentPurchases()
  const hasPendingPurchase = purchases?.some((purchase) => purchase.status === 'PENDING') ?? false
  const hasPaidPurchase = purchases?.some((purchase) => purchase.status === 'PAID') ?? false

  useEffect(() => {
    if (!hasPendingPurchase) return

    const intervalId = window.setInterval(() => {
      void refetch()
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [hasPendingPurchase, refetch])

  useEffect(() => {
    if (!hasPaidPurchase) return

    void queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
  }, [hasPaidPurchase, queryClient])

  if (isLoading) {
    return <LoadingState message="Loading your purchases..." />
  }

  if (isError) {
    return <ErrorState message={getFriendlyApiErrorMessage(error, 'Failed to load purchases')} onRetry={refetch} />
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary sm:flex">
              <ReceiptText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">My Purchases</h1>
              <p className="lms-section-description">
                Track your course purchase requests and payment confirmation status.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!purchases || purchases.length === 0 ? (
        <EmptyState message="No purchases yet" description="Choose a course that fits your goals to get started." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {purchases.map((purchase) => (
            <article key={purchase.id} className="lms-surface p-5" data-testid={`student-purchase-row-${purchase.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Course</p>
                  <h2 className="mt-1 text-xl font-extrabold text-foreground">{purchase.programName || `#${purchase.programId}`}</h2>
                </div>
                <PurchaseStatusBadge status={purchase.status} />
              </div>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-bold text-foreground">{formatCurrency(purchase.amount, purchase.currency || 'VND')}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="text-right text-foreground">{formatDateTime(purchase.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Confirmed</dt>
                  <dd className="text-right text-foreground">{formatDateTime(purchase.paidAt)}</dd>
                </div>
              </dl>

              {purchase.status === 'PENDING' && (
                <div className="mt-5 space-y-3">
                  <PurchasePaymentPanel purchase={purchase} compact showCourse={false} />
                  <Button asChild className="w-full">
                    <Link to={`/student/purchases/${purchase.id}`}>
                      <QrCode className="h-4 w-4" />
                      View payment
                    </Link>
                  </Button>
                </div>
              )}

              {purchase.status === 'PAID' && purchase.enrollmentId && (
                <Button asChild className="mt-5 w-full">
                  <Link to={`/student/lessons/${purchase.programId}`}>
                    Start learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {purchase.status === 'PAID' && !purchase.enrollmentId && (
                <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                  Payment confirmed. Vera is preparing your course enrollment.
                </p>
              )}

              {purchase.status && !['PENDING', 'PAID'].includes(purchase.status) && (
                <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
                  This purchase is not available for payment. Please check the latest status.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
