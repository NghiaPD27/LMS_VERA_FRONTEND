import { useState } from 'react'
import { CalendarPlus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useCreateTeacherAvailability, useDeleteTeacherAvailability, useGetTeacherAvailability } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'
import type { TeacherAvailability, TeacherAvailabilitySlot } from '../../types/teacher'

export function TeacherAvailabilityPage() {
  const createAvailabilityMutation = useCreateTeacherAvailability()
  const deleteAvailabilityMutation = useDeleteTeacherAvailability()
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [createdAvailability, setCreatedAvailability] = useState<TeacherAvailability | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const availabilityQuery = useGetTeacherAvailability({
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    status: status || undefined,
  })
  const slots = availabilityQuery.data ?? []

  const submitAvailability = async () => {
    const validationError = validateWholeHourRange(startAt, endAt)
    if (validationError) {
      setClientError(validationError)
      return
    }

    try {
      setClientError(null)
      const response = await createAvailabilityMutation.mutateAsync({
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      })
      setCreatedAvailability(response)
      setStartAt('')
      setEndAt('')
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to create availability'))
    }
  }

  const deleteSlot = async (slot: TeacherAvailabilitySlot) => {
    if (!slot.availabilityId) return

    try {
      setClientError(null)
      await deleteAvailabilityMutation.mutateAsync(slot.availabilityId)
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to remove availability'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div>
            <h1 className="lms-section-title">Availability</h1>
            <p className="lms-section-description">Open bookable whole-hour teaching slots for assigned students.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="lms-surface p-5">
        <h2 className="mb-4 font-extrabold text-foreground">Create availability</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="teacher-availability-start" className="text-sm font-bold text-foreground">Start time</label>
            <input
              id="teacher-availability-start"
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className="lms-input mt-1"
              data-testid="teacher-availability-start"
            />
          </div>
          <div>
            <label htmlFor="teacher-availability-end" className="text-sm font-bold text-foreground">End time</label>
            <input
              id="teacher-availability-end"
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              className="lms-input mt-1"
              data-testid="teacher-availability-end"
            />
          </div>
        </div>

        {clientError && <div className="mt-4 lms-alert-error" data-testid="availability-error">{clientError}</div>}
        {createdAvailability && (
          <div className="mt-4 lms-alert-success" data-testid="availability-success">
            Availability created from {formatDateTime(createdAvailability.startAt)} to {formatDateTime(createdAvailability.endAt)}.
          </div>
        )}

        <Button
          type="button"
          className="mt-5"
          disabled={createAvailabilityMutation.isPending}
          onClick={() => void submitAvailability()}
        >
          <CalendarPlus className="h-4 w-4" />
          {createAvailabilityMutation.isPending ? 'Creating...' : 'Create availability'}
        </Button>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Open calendar slots</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review created slots and remove open ones before students book them.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void availabilityQuery.refetch()} disabled={availabilityQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${availabilityQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="availability-filter-from" className="text-sm font-bold text-foreground">From</label>
            <input id="availability-filter-from" type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} className="lms-input mt-1" />
          </div>
          <div>
            <label htmlFor="availability-filter-to" className="text-sm font-bold text-foreground">To</label>
            <input id="availability-filter-to" type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} className="lms-input mt-1" />
          </div>
          <div>
            <label htmlFor="availability-filter-status" className="text-sm font-bold text-foreground">Status</label>
            <select id="availability-filter-status" value={status} onChange={(event) => setStatus(event.target.value)} className="lms-input mt-1">
              <option value="">All</option>
              <option value="OPEN">OPEN</option>
              <option value="BOOKED">BOOKED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {availabilityQuery.isLoading ? (
          <LoadingState message="Loading availability..." />
        ) : availabilityQuery.isError ? (
          <div className="lms-alert-error">
            {getFriendlyApiErrorMessage(availabilityQuery.error, 'Failed to load availability')}
          </div>
        ) : slots.length === 0 ? (
          <EmptyState message="No availability found" description="Create a time range or adjust the filters." />
        ) : (
          <div className="grid gap-3">
            {slots.map((slot) => (
              <AvailabilitySlotCard
                key={`${slot.availabilityId}-${slot.startAt}`}
                slot={slot}
                isDeleting={deleteAvailabilityMutation.isPending}
                onDelete={() => void deleteSlot(slot)}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </section>
  )
}

function AvailabilitySlotCard({
  slot,
  isDeleting,
  onDelete,
}: {
  slot: TeacherAvailabilitySlot
  isDeleting: boolean
  onDelete: () => void
}) {
  const canDelete = slot.status === 'OPEN'

  return (
    <article className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-extrabold text-foreground">{formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {slot.status === 'BOOKED'
              ? `${slot.studentName || `Student #${slot.studentId ?? '-'}`} booked ${slot.lessonName || `Lesson #${slot.lessonId ?? '-'}`}`
              : slot.status === 'CANCELLED'
                ? 'This slot is cancelled.'
                : 'Available for student booking.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${
            slot.status === 'BOOKED'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : slot.status === 'CANCELLED'
                ? 'border-slate-200 bg-slate-50 text-slate-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            {slot.status || 'OPEN'}
          </span>
          <Button type="button" variant="outline" size="sm" disabled={!canDelete || isDeleting} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  )
}

function validateWholeHourRange(startValue: string, endValue: string) {
  if (!startValue || !endValue) return 'Start and end time are required.'

  const startDate = new Date(startValue)
  const endDate = new Date(endValue)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Choose valid start and end times.'
  }

  if (startDate.getMinutes() !== 0 || endDate.getMinutes() !== 0) {
    return 'Start and end time must be on the hour.'
  }

  const durationMs = endDate.getTime() - startDate.getTime()
  if (durationMs < 60 * 60 * 1000) {
    return 'Availability must be at least 1 hour.'
  }

  if (durationMs % (60 * 60 * 1000) !== 0) {
    return 'Availability duration must be a whole number of hours.'
  }

  return null
}
