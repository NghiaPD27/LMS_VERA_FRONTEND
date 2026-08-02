import { useState } from 'react'
import { CalendarPlus, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PaginationControls } from '../../components/common/PaginationControls'
import { useCreateTeacherAvailability, useDeleteTeacherAvailability, useGetTeacherAvailability } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'
import type { TeacherAvailability, TeacherAvailabilitySlot } from '../../types/teacher'

export function TeacherAvailabilityPage() {
  const createAvailabilityMutation = useCreateTeacherAvailability()
  const deleteAvailabilityMutation = useDeleteTeacherAvailability()
  const pageSize = 20
  const [startDate, setStartDate] = useState('')
  const [startHour, setStartHour] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endHour, setEndHour] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [createdAvailability, setCreatedAvailability] = useState<TeacherAvailability | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const availabilityQuery = useGetTeacherAvailability({
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    status: status || undefined,
    page,
    size: pageSize,
  })
  const slots = availabilityQuery.data?.content ?? []
  const totalPages = availabilityQuery.data?.totalPages ?? 0

  const submitAvailability = async () => {
    const startDateTime = buildHourlyDateTime(startDate, startHour)
    const endDateTime = buildHourlyDateTime(endDate, endHour)
    const validationError = validateWholeHourRange(startDateTime, endDateTime) || validateMeetLink(meetLink)
    if (validationError) {
      setClientError(validationError)
      return
    }

    try {
      setClientError(null)
      const response = await createAvailabilityMutation.mutateAsync({
        startAt: new Date(startDateTime).toISOString(),
        endAt: new Date(endDateTime).toISOString(),
        meetLink: meetLink.trim(),
      })
      setCreatedAvailability(response)
      setStartDate('')
      setStartHour('')
      setEndDate('')
      setEndHour('')
      setMeetLink('')
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

      <div className="grid gap-5 xl:grid-cols-[460px_1fr]">
      <div className="lms-surface h-fit overflow-hidden">
        <div className="border-b border-border bg-[hsl(var(--brand-green-soft))]/45 p-5">
          <h2 className="font-extrabold text-foreground">Create availability</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Pick whole hours only. Minutes are fixed to 00.</p>
        </div>
        <div className="grid gap-5 p-5">
          <fieldset className="rounded-md border border-border bg-background/70 p-4">
            <legend className="px-1 text-sm font-extrabold text-[hsl(var(--brand-green))]">Starts</legend>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div>
                <label htmlFor="teacher-availability-start-date" className="text-sm font-bold text-foreground">Date</label>
                <input
                  id="teacher-availability-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="lms-input mt-1"
                  data-testid="teacher-availability-start-date"
                />
              </div>
              <div>
                <label htmlFor="teacher-availability-start-hour" className="text-sm font-bold text-foreground">Hour</label>
                <HourSelect
                  id="teacher-availability-start-hour"
                  value={startHour}
                  onChange={setStartHour}
                  testId="teacher-availability-start-hour"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-border bg-background/70 p-4">
            <legend className="px-1 text-sm font-extrabold text-primary">Ends</legend>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div>
                <label htmlFor="teacher-availability-end-date" className="text-sm font-bold text-foreground">Date</label>
                <input
                  id="teacher-availability-end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="lms-input mt-1"
                  data-testid="teacher-availability-end-date"
                />
              </div>
              <div>
                <label htmlFor="teacher-availability-end-hour" className="text-sm font-bold text-foreground">Hour</label>
                <HourSelect
                  id="teacher-availability-end-hour"
                  value={endHour}
                  onChange={setEndHour}
                  testId="teacher-availability-end-hour"
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor="teacher-availability-meet-link" className="text-sm font-bold text-foreground">Google Meet link</label>
            <input
              id="teacher-availability-meet-link"
              type="url"
              value={meetLink}
              onChange={(event) => setMeetLink(event.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="lms-input mt-1"
              data-testid="teacher-availability-meet-link"
            />
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Students see this link only after booking.</p>
          </div>

          {clientError && <div className="lms-alert-error" data-testid="availability-error">{clientError}</div>}
          {createdAvailability && (
            <div className="lms-alert-success" data-testid="availability-success">
              Availability created from {formatDateTime(createdAvailability.startAt)} to {formatDateTime(createdAvailability.endAt)} with Google Meet ready.
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={createAvailabilityMutation.isPending}
            onClick={() => void submitAvailability()}
          >
            <CalendarPlus className="h-4 w-4" />
            {createAvailabilityMutation.isPending ? 'Creating...' : 'Create availability'}
          </Button>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Open calendar slots</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {availabilityQuery.data?.totalElements ?? 0} slots found. Past slots appear only when a date range is selected.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void availabilityQuery.refetch()} disabled={availabilityQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${availabilityQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="availability-filter-from" className="text-sm font-bold text-foreground">From</label>
            <input id="availability-filter-from" type="datetime-local" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0) }} className="lms-input mt-1" />
          </div>
          <div>
            <label htmlFor="availability-filter-to" className="text-sm font-bold text-foreground">To</label>
            <input id="availability-filter-to" type="datetime-local" value={to} onChange={(event) => { setTo(event.target.value); setPage(0) }} className="lms-input mt-1" />
          </div>
          <div>
            <label htmlFor="availability-filter-status" className="text-sm font-bold text-foreground">Status</label>
            <select id="availability-filter-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0) }} className="lms-input mt-1">
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
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalElements={availabilityQuery.data?.totalElements}
              isFetching={availabilityQuery.isFetching}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      </div>
    </section>
  )
}

function HourSelect({
  id,
  value,
  onChange,
  testId,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  testId: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="lms-input mt-1"
      data-testid={testId}
    >
      <option value="">Choose hour</option>
      {HOUR_OPTIONS.map((hour) => (
        <option key={hour} value={hour}>
          {hour.padStart(2, '0')}h
        </option>
      ))}
    </select>
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
  const statusClassName = getAvailabilityStatusClassName(slot.status)

  return (
    <article className="rounded-md border border-border bg-white px-4 py-3 transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-[0_10px_26px_rgba(47,143,91,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-foreground">{formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}</p>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusClassName}`}>
              {slot.status || 'OPEN'}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {slot.status === 'BOOKED'
              ? `${slot.studentName || `Student #${slot.studentId ?? '-'}`} booked ${slot.lessonName || `Lesson #${slot.lessonId ?? '-'}`}`
              : slot.status === 'CANCELLED'
                ? 'This slot is cancelled.'
                : 'Available for student booking.'}
          </p>
          {slot.meetLink ? (
            <Button asChild variant="link" size="sm" className="mt-1 h-auto justify-start px-0 py-0 text-[hsl(var(--brand-green))]">
              <a href={slot.meetLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open Meet
              </a>
            </Button>
          ) : (
            <p className="mt-2 text-xs font-bold text-amber-700">Missing Meet link</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!canDelete || isDeleting} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  )
}

function getAvailabilityStatusClassName(status?: string) {
  if (status === 'BOOKED') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === 'CANCELLED') return 'border-slate-200 bg-slate-50 text-slate-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

function validateWholeHourRange(startValue: string, endValue: string) {
  if (!startValue || !endValue) return 'Start date, start hour, end date, and end hour are required.'

  const startDate = new Date(startValue)
  const endDate = new Date(endValue)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Choose valid start and end times.'
  }

  if (startDate.getMinutes() !== 0 || endDate.getMinutes() !== 0) {
    return 'Start and end time must be exact hour marks. Set minutes to 00, for example 01:00 - 02:00.'
  }

  const durationMs = endDate.getTime() - startDate.getTime()
  if (durationMs < 60 * 60 * 1000) {
    return 'Availability must be at least 1 hour.'
  }

  if (durationMs % (60 * 60 * 1000) !== 0) {
    return 'Availability duration must be a whole number of hours, for example 01:00 - 03:00.'
  }

  return null
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index))

function buildHourlyDateTime(dateValue: string, hourValue: string) {
  if (!dateValue || hourValue === '') return ''
  return `${dateValue}T${hourValue.padStart(2, '0')}:00`
}

function validateMeetLink(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Google Meet link is required.'
  if (trimmed.length > 500) return 'Google Meet link must be 500 characters or fewer.'
  if (!trimmed.startsWith('https://meet.google.com/')) {
    return 'Google Meet link must start with https://meet.google.com/.'
  }

  try {
    const parsedUrl = new URL(trimmed)
    if (parsedUrl.origin !== 'https://meet.google.com' || parsedUrl.pathname.length <= 1) {
      return 'Google Meet link must be a valid https://meet.google.com URL.'
    }
  } catch {
    return 'Google Meet link must be a valid https://meet.google.com URL.'
  }

  return null
}
