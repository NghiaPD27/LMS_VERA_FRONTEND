import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, LockKeyhole, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { LoadingState } from '../common/LoadingState'
import { useCancelStudentBooking, useCreateStudentBooking, useGetStudentBookings, useGetStudentTeacherSlots } from '../../hooks/useTeacher'
import type { TeacherBooking, TeacherSlot } from '../../types/teacher'
import { getFriendlyApiErrorMessage, isConflictError, isForbiddenError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

interface TeacherBookingPanelProps {
  lessonId?: number
  enabled: boolean
}

export function TeacherBookingPanel({ lessonId, enabled }: TeacherBookingPanelProps) {
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState<string>('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [clientMessage, setClientMessage] = useState<string | null>(null)
  const [booking, setBooking] = useState<TeacherBooking | null>(null)
  const bookingsQuery = useGetStudentBookings(
    { lessonId, status: 'BOOKED' },
    enabled && !!lessonId
  )
  const existingBooking = booking || bookingsQuery.data?.find((item) => item.status === 'BOOKED') || null
  const slotsQuery = useGetStudentTeacherSlots(lessonId, enabled && !existingBooking)
  const createBookingMutation = useCreateStudentBooking()
  const cancelBookingMutation = useCancelStudentBooking()

  useEffect(() => {
    setSelectedSlotStartAt('')
    setClientError(null)
    setClientMessage(null)
    setBooking(null)
  }, [lessonId, enabled])

  const slots = useMemo(
    () =>
      (slotsQuery.data || [])
        .filter((slot) => slot.startAt)
        .slice()
        .sort((a, b) => new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime()),
    [slotsQuery.data]
  )
  const selectedSlot = slots.find((slot) => slot.startAt === selectedSlotStartAt)
  const activeBooking = existingBooking

  const bookSelectedSlot = async () => {
    if (!lessonId || !selectedSlot?.startAt) return

    try {
      setClientError(null)
      setClientMessage(null)
      const response = await createBookingMutation.mutateAsync({
        lessonId,
        slotStartAt: selectedSlot.startAt,
      })
      setBooking(response)
      setSelectedSlotStartAt('')
      await bookingsQuery.refetch()
    } catch (error) {
      if (isConflictError(error)) {
        setClientError(getFriendlyApiErrorMessage(error, 'This slot is no longer available. Choose another slot.'))
        void slotsQuery.refetch()
        return
      }

      setClientError(getFriendlyApiErrorMessage(error, 'Failed to book teacher session'))
    }
  }

  const cancelActiveBooking = async () => {
    if (!activeBooking?.id) return

    try {
      setClientError(null)
      setClientMessage(null)
      await cancelBookingMutation.mutateAsync(activeBooking.id)
      setBooking(null)
      setClientMessage('Your teacher session has been cancelled. Choose another slot when you are ready.')
      await Promise.all([bookingsQuery.refetch(), slotsQuery.refetch()])
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to cancel teacher session'))
    }
  }

  if (!enabled) return null

  return (
    <section className="border-t border-border bg-[hsl(var(--brand-orange-soft))]/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">Teacher session</p>
          <h3 className="mt-1 text-xl font-extrabold text-foreground">Book your review session</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {activeBooking ? 'Your booked session is shown below.' : 'Choose one available 1-hour slot from your assigned teacher.'}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void slotsQuery.refetch()} disabled={slotsQuery.isFetching}>
          <RefreshCw className={`h-4 w-4 ${slotsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh slots
        </Button>
      </div>

      {clientError && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {clientError}
        </div>
      )}

      {clientMessage && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {clientMessage}
        </div>
      )}

      {bookingsQuery.isLoading ? (
        <div className="mt-5">
          <LoadingState message="Checking existing teacher booking..." />
        </div>
      ) : bookingsQuery.isError ? (
        <TeacherBookingNotice
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Could not check existing bookings"
          description={getFriendlyApiErrorMessage(bookingsQuery.error, 'Refresh this panel before booking another session.')}
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : activeBooking ? (
        <BookedSession
          booking={activeBooking}
          isCancelling={cancelBookingMutation.isPending}
          onCancel={() => void cancelActiveBooking()}
        />
      ) : null}

      {!activeBooking && slotsQuery.isLoading ? (
        <div className="mt-5">
          <LoadingState message="Loading teacher slots..." />
        </div>
      ) : !activeBooking && slotsQuery.isError ? (
        <TeacherBookingNotice
          icon={<LockKeyhole className="h-5 w-5" />}
          title={isForbiddenError(slotsQuery.error) ? 'Teacher booking is locked' : 'Could not load teacher slots'}
          description={
            isForbiddenError(slotsQuery.error)
              ? 'This lesson is not ready for teacher booking, your enrollment may be expired, or a teacher has not been assigned yet.'
              : getFriendlyApiErrorMessage(slotsQuery.error, 'Failed to load teacher slots')
          }
          onRetry={() => void slotsQuery.refetch()}
        />
      ) : !activeBooking && slots.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            message="No teacher slots available"
            description="Your assigned teacher has not opened any bookable slots yet. Please check again later."
          />
        </div>
      ) : !activeBooking ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot) => (
              <TeacherSlotButton
                key={`${slot.availabilityId || slot.startAt}-${slot.startAt}`}
                slot={slot}
                selected={slot.startAt === selectedSlotStartAt}
                onSelect={() => setSelectedSlotStartAt(slot.startAt || '')}
              />
            ))}
          </div>

          <div className="h-fit rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Selected session</p>
            <p className="mt-1 font-extrabold text-foreground">
              {selectedSlot ? formatDateTime(selectedSlot.startAt) : 'No slot selected'}
            </p>
            {selectedSlot?.teacherName && (
              <p className="mt-1 text-sm text-muted-foreground">Teacher: {selectedSlot.teacherName}</p>
            )}
            {selectedSlot?.endAt && (
              <p className="mt-1 text-sm text-muted-foreground">Ends: {formatDateTime(selectedSlot.endAt)}</p>
            )}
            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!selectedSlot || createBookingMutation.isPending}
              onClick={() => void bookSelectedSlot()}
            >
              <CalendarClock className="h-4 w-4" />
              {createBookingMutation.isPending ? 'Booking...' : 'Book session'}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function TeacherSlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: TeacherSlot
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`rounded-lg border p-4 text-left transition ${
        selected
          ? 'border-primary bg-white text-foreground shadow-sm'
          : 'border-border bg-white/80 text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
      onClick={onSelect}
    >
      <p className="text-sm font-extrabold text-foreground">{formatDateTime(slot.startAt)}</p>
      <p className="mt-1 text-xs font-semibold">{slot.teacherName || `Teacher #${slot.teacherId ?? '-'}`}</p>
      <p className="mt-2 text-xs">1-hour review session</p>
    </button>
  )
}

function BookedSession({
  booking,
  isCancelling,
  onCancel,
}: {
  booking: TeacherBooking
  isCancelling: boolean
  onCancel: () => void
}) {
  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-extrabold text-emerald-950">Session booked</p>
            <p>
              {formatDateTime(booking.startAt)} with {booking.teacherName || `Teacher #${booking.teacherId ?? '-'}`}.
              {booking.status ? ` Status: ${booking.status}.` : ''}
            </p>
            {booking.lessonName && <p className="text-emerald-800">{booking.lessonName}</p>}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="border-emerald-300 bg-white" disabled={isCancelling} onClick={onCancel}>
          <XCircle className="h-4 w-4" />
          {isCancelling ? 'Cancelling...' : 'Cancel booking'}
        </Button>
      </div>
    </div>
  )
}

function TeacherBookingNotice({
  icon,
  title,
  description,
  onRetry,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="mt-5 rounded-lg border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        <div>
          <h3 className="font-extrabold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  )
}
