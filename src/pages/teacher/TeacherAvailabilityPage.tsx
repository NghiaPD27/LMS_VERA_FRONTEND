import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { useCreateTeacherAvailability } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'
import type { TeacherAvailability } from '../../types/teacher'

export function TeacherAvailabilityPage() {
  const createAvailabilityMutation = useCreateTeacherAvailability()
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [createdAvailability, setCreatedAvailability] = useState<TeacherAvailability | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

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

      <div className="lms-surface max-w-3xl p-5">
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
    </section>
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

