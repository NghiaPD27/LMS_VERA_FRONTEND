import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ReceiptText } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { PurchasePaymentPanel } from '../../components/purchases/PurchasePaymentPanel'
import { useGetStudentPurchase } from '../../hooks/usePurchases'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'

export function PurchaseDetailPage() {
  const queryClient = useQueryClient()
  const { purchaseId } = useParams<{ purchaseId: string }>()
  const parsedId = Number(purchaseId)
  const id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined
  const { data: purchase, isLoading, isError, error, refetch, isFetching } = useGetStudentPurchase(id)

  useEffect(() => {
    if (purchase?.status !== 'PENDING') return

    const intervalId = window.setInterval(() => {
      void refetch()
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [purchase?.status, refetch])

  useEffect(() => {
    if (purchase?.status !== 'PAID') return

    void queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
  }, [purchase?.status, queryClient])

  if (!id) {
    return <ErrorState message="Purchase not found" />
  }

  if (isLoading) {
    return <LoadingState message="Loading payment details..." />
  }

  if (isError || !purchase) {
    return <ErrorState message={getFriendlyApiErrorMessage(error, 'Failed to load payment details')} onRetry={refetch} />
  }

  return (
    <section className="lms-page-shell">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/student/purchases">
          <ArrowLeft className="h-4 w-4" />
          Back to purchases
        </Link>
      </Button>

      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary sm:flex">
              <ReceiptText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Payment details</h1>
              <p className="lms-section-description">
                Scan the SePay QR code or transfer manually. Vera checks payment confirmation every few seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PurchasePaymentPanel purchase={purchase} isRefreshing={isFetching} onRefresh={() => void refetch()} />

      {purchase.status === 'PAID' && purchase.enrollmentId ? (
        <div className="lms-surface flex flex-col gap-3 border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-emerald-900">Your course is ready</p>
            <p className="mt-1 text-sm text-emerald-800">Your course access is ready. You can start learning now.</p>
          </div>
          <Button asChild>
            <Link to={`/student/lessons/${purchase.programId}`}>
              Start learning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : purchase.status === 'PAID' ? (
        <div className="lms-surface border-emerald-200 bg-emerald-50 p-5">
          <p className="font-extrabold text-emerald-900">Payment confirmed</p>
          <p className="mt-1 text-sm text-emerald-800">Vera is preparing your enrollment. Refresh this page if the course button does not appear yet.</p>
        </div>
      ) : null}
    </section>
  )
}
