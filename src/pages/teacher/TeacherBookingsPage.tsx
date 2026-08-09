import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink, Send } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PaginationControls } from '../../components/common/PaginationControls'
import { useCompleteTeacherPrivateBooking, useGetTeacherBookings, useGetTeacherPrivateBookings, useReviewTeacherBooking } from '../../hooks/useTeacher'
import type { TeacherBooking, TeacherReviewResult } from '../../types/teacher'
import { getFriendlyApiErrorMessage, isValidationError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

export function TeacherBookingsPage() {
  const pageSize = 20
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [bookingType, setBookingType] = useState<'LESSON' | 'PRIVATE'>('LESSON')
  const queryParams = {
    status: statusFilter || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    page,
    size: pageSize,
  }
  const lessonBookingsQuery = useGetTeacherBookings(queryParams)
  const privateBookingsQuery = useGetTeacherPrivateBookings(queryParams)
  const activeQuery = bookingType === 'PRIVATE' ? privateBookingsQuery : lessonBookingsQuery
  const bookings = activeQuery.data?.content ?? []
  const totalPages = activeQuery.data?.totalPages ?? 0

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div>
            <h1 className="lms-section-title">Teacher Bookings</h1>
            <p className="lms-section-description">Review completed sessions and keep lesson progress moving through the backend flow.</p>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <h2 className="font-extrabold text-foreground">Sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeQuery.data?.totalElements ?? 0} sessions found. Booked sessions stay here until they are completed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                bookingType === 'LESSON'
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border bg-slate-900 text-zinc-300 hover:border-primary/40 hover:text-white'
              }`}
              onClick={() => {
                setBookingType('LESSON')
                setPage(0)
              }}
              data-testid="teacher-booking-type-lesson"
            >
              Lesson bookings
            </button>
            <button
              type="button"
              className={`rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                bookingType === 'PRIVATE'
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border bg-slate-900 text-zinc-300 hover:border-primary/40 hover:text-white'
              }`}
              onClick={() => {
                setBookingType('PRIVATE')
                setPage(0)
              }}
              data-testid="teacher-booking-type-private"
            >
              Private bookings
            </button>
          </div>
          <div className="grid gap-3 rounded-md border border-border bg-background/70 p-3 md:grid-cols-3">
            <div>
              <label htmlFor="teacher-booking-from" className="text-sm font-bold text-foreground">From</label>
              <input id="teacher-booking-from" type="datetime-local" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0) }} className="lms-input mt-1" />
            </div>
            <div>
              <label htmlFor="teacher-booking-to" className="text-sm font-bold text-foreground">To</label>
              <input id="teacher-booking-to" type="datetime-local" value={to} onChange={(event) => { setTo(event.target.value); setPage(0) }} className="lms-input mt-1" />
            </div>
            <div>
              <label htmlFor="teacher-booking-status-filter" className="text-sm font-bold text-foreground">Status</label>
              <select
                id="teacher-booking-status-filter"
                value={statusFilter}
                onChange={(event) => { setStatusFilter(event.target.value); setPage(0) }}
                className="lms-input mt-1"
                data-testid="teacher-booking-status-filter"
              >
                <option value="">All statuses</option>
                <option value="BOOKED">BOOKED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {activeQuery.isLoading ? (
          <LoadingState message="Loading bookings..." />
        ) : activeQuery.isError ? (
          <div className="lms-alert-error">
            {getFriendlyApiErrorMessage(activeQuery.error, 'Failed to load bookings')}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" description="No student sessions match this filter yet." />
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              bookingType === 'PRIVATE' ? (
                <TeacherPrivateBookingCard key={booking.id} booking={booking} />
              ) : (
                <TeacherBookingCard key={booking.id} booking={booking} />
              )
            ))}
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalElements={activeQuery.data?.totalElements}
              isFetching={activeQuery.isFetching}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  )
}

function TeacherPrivateBookingCard({ booking }: { booking: TeacherBooking }) {
  const completeMutation = useCompleteTeacherPrivateBooking()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const statusClassName = getBookingStatusClassName(booking.status)
  const endTime = booking.endAt ? new Date(booking.endAt).getTime() : Number.NaN
  const hasEnded = Number.isFinite(endTime) && endTime <= Date.now()
  const canComplete = booking.status === 'BOOKED' && !!booking.id && hasEnded

  const completeBooking = async () => {
    if (!booking.id) return

    try {
      setMessage(null)
      setError(null)
      const response = await completeMutation.mutateAsync(booking.id)
      setMessage(`Private lesson marked ${response.status || 'COMPLETED'}.`)
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err, 'Failed to complete private booking'))
    }
  }

  return (
    <article className="rounded-xl border border-border bg-slate-900/60 p-4 transition-all hover:border-primary/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-primary">Private lesson</p>
            <span className="w-fit rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {booking.bookingType || 'PRIVATE'}
            </span>
            <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusClassName}`}>
              {booking.status || 'UNKNOWN'}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-white">{booking.studentName || `Student #${booking.studentId ?? '-'}`}</h3>
          <dl className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-bold text-foreground">Starts</dt>
              <dd>{formatDateTime(booking.startAt)}</dd>
            </div>
            <div>
              <dt className="font-bold text-foreground">Ends</dt>
              <dd>{formatDateTime(booking.endAt)}</dd>
            </div>
          </dl>
          {!hasEnded && booking.status === 'BOOKED' && (
            <p className="mt-3 text-xs font-semibold text-amber-300">Complete is available after the session end time.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {booking.meetLink && (
            <Button asChild variant="outline" size="sm" className="border-emerald-500/40 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 hover:text-white text-xs">
              <a href={booking.meetLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Meet
              </a>
            </Button>
          )}
          <Button
            type="button"
            disabled={!canComplete || completeMutation.isPending}
            onClick={() => void completeBooking()}
            data-testid={`complete-private-booking-${booking.id}`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {completeMutation.isPending ? 'Completing...' : 'Complete'}
          </Button>
        </div>
      </div>

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
    </article>
  )
}

function TeacherBookingCard({ booking }: { booking: TeacherBooking }) {
  const reviewMutation = useReviewTeacherBooking()
  const [result, setResult] = useState<TeacherReviewResult>('APPROVED')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canReview = booking.status === 'BOOKED' && !!booking.id
  const statusClassName = getBookingStatusClassName(booking.status)

  const submitReview = async () => {
    if (!booking.id) return

    try {
      setMessage(null)
      setError(null)
      const response = await reviewMutation.mutateAsync({
        bookingId: booking.id,
        data: {
          result,
          comment: comment.trim() || undefined,
        },
      })
      setMessage(`Review saved as ${response.result || result}.`)
      setComment('')
    } catch (err) {
      const fallback = isValidationError(err)
        ? 'Could not review this booking. Ask an admin to configure teacher compensation, then try again.'
        : 'Failed to review booking'
      setError(getFriendlyApiErrorMessage(err, fallback))
    }
  }

  return (
    <article className="rounded-xl border border-border bg-slate-900/60 p-4 transition-all hover:border-primary/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-primary">{booking.lessonName || `Lesson #${booking.lessonId ?? '-'}`}</p>
            <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusClassName}`}>
              {booking.status || 'UNKNOWN'}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-white">{booking.studentName || `Student #${booking.studentId ?? '-'}`}</h3>
          <dl className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-bold text-foreground">Starts</dt>
              <dd>{formatDateTime(booking.startAt)}</dd>
            </div>
            <div>
              <dt className="font-bold text-foreground">Ends</dt>
              <dd>{formatDateTime(booking.endAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {canReview ? (
        <div className="mt-4 rounded-md border border-border bg-background/70 p-3">
          <div className="grid gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-start">
            <div>
              <label htmlFor={`teacher-review-result-${booking.id}`} className="text-sm font-bold text-foreground">Review result</label>
              <select
                id={`teacher-review-result-${booking.id}`}
                value={result}
                onChange={(event) => setResult(event.target.value as TeacherReviewResult)}
                className="lms-input"
                data-testid={`teacher-review-result-${booking.id}`}
              >
                <option value="APPROVED">APPROVED</option>
                <option value="NOT_APPROVED">NOT_APPROVED</option>
              </select>
            </div>
            <div>
              <label htmlFor={`teacher-review-comment-${booking.id}`} className="text-sm font-bold text-foreground">Comment</label>
              <textarea
                id={`teacher-review-comment-${booking.id}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="lms-input min-h-24"
                maxLength={1000}
                placeholder="Optional review comment"
                data-testid={`teacher-review-comment-${booking.id}`}
              />
            </div>
            <Button
              type="button"
              className="lg:mt-7"
              disabled={reviewMutation.isPending}
              onClick={() => void submitReview()}
              data-testid={`submit-teacher-review-${booking.id}`}
            >
              <Send className="h-4 w-4" />
              {reviewMutation.isPending ? 'Saving...' : 'Submit review'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Only BOOKED sessions can be reviewed.</p>
      )}

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
    </article>
  )
}

function getBookingStatusClassName(status?: string) {
  if (status === 'BOOKED') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === 'COMPLETED') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'CANCELLED') return 'border-slate-200 bg-slate-50 text-slate-700'
  return 'border-border bg-background text-foreground'
}
