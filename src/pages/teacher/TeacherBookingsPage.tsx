import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetTeacherBookings, useReviewTeacherBooking } from '../../hooks/useTeacher'
import type { TeacherBooking, TeacherReviewResult } from '../../types/teacher'
import { getFriendlyApiErrorMessage, isValidationError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

export function TeacherBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const bookingsQuery = useGetTeacherBookings(statusFilter || undefined)
  const bookings = bookingsQuery.data ?? []

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Filter by status and submit a review after each lesson session.</p>
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="lms-input w-full sm:w-48"
            data-testid="teacher-booking-status-filter"
          >
            <option value="">All statuses</option>
            <option value="BOOKED">BOOKED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {bookingsQuery.isLoading ? (
          <LoadingState message="Loading bookings..." />
        ) : bookingsQuery.isError ? (
          <div className="lms-alert-error">
            {getFriendlyApiErrorMessage(bookingsQuery.error, 'Failed to load bookings')}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" description="No student sessions match this filter yet." />
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <TeacherBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TeacherBookingCard({ booking }: { booking: TeacherBooking }) {
  const reviewMutation = useReviewTeacherBooking()
  const [result, setResult] = useState<TeacherReviewResult>('APPROVED')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canReview = booking.status === 'BOOKED' && !!booking.id

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
    <article className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">{booking.lessonName || `Lesson #${booking.lessonId ?? '-'}`}</p>
          <h3 className="mt-1 text-lg font-extrabold text-foreground">{booking.studentName || `Student #${booking.studentId ?? '-'}`}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(booking.startAt)} - {formatDateTime(booking.endAt)}
          </p>
        </div>
        <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-foreground">
          {booking.status || 'UNKNOWN'}
        </span>
      </div>

      {canReview ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-start">
          <select
            value={result}
            onChange={(event) => setResult(event.target.value as TeacherReviewResult)}
            className="lms-input"
            data-testid={`teacher-review-result-${booking.id}`}
          >
            <option value="APPROVED">APPROVED</option>
            <option value="NOT_APPROVED">NOT_APPROVED</option>
          </select>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="lms-input min-h-24"
            maxLength={1000}
            placeholder="Optional review comment"
            data-testid={`teacher-review-comment-${booking.id}`}
          />
          <Button
            type="button"
            disabled={reviewMutation.isPending}
            onClick={() => void submitReview()}
            data-testid={`submit-teacher-review-${booking.id}`}
          >
            <Send className="h-4 w-4" />
            {reviewMutation.isPending ? 'Saving...' : 'Submit review'}
          </Button>
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

