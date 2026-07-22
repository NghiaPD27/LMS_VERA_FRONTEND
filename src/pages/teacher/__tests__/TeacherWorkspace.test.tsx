import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TeacherAvailabilityPage } from '../TeacherAvailabilityPage'
import { TeacherBookingsPage } from '../TeacherBookingsPage'

const hookState = vi.hoisted(() => ({
  createAvailability: vi.fn(),
  deleteAvailability: vi.fn(),
  reviewBooking: vi.fn(),
  bookingsStatus: undefined as string | undefined,
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useCreateTeacherAvailability: () => ({
    mutateAsync: hookState.createAvailability,
    isPending: false,
  }),
  useGetTeacherAvailability: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDeleteTeacherAvailability: () => ({
    mutateAsync: hookState.deleteAvailability,
    isPending: false,
  }),
  useGetTeacherBookings: (status?: string) => {
    hookState.bookingsStatus = status
    return {
      data: [
        {
          id: 88,
          studentName: 'John Smith',
          teacherId: 2,
          lessonId: 101,
          lessonName: 'Opening conversations',
          startAt: '2026-07-23T10:00:00Z',
          endAt: '2026-07-23T11:00:00Z',
          status: 'BOOKED',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    }
  },
  useReviewTeacherBooking: () => ({
    mutateAsync: hookState.reviewBooking,
    isPending: false,
  }),
}))

const createAxiosError = (status: number, message: string) =>
  ({
    isAxiosError: true,
    message: 'Request failed',
    response: {
      data: { message },
      status,
    },
  }) as AxiosError

describe('Teacher workspace', () => {
  beforeEach(() => {
    hookState.createAvailability.mockReset()
    hookState.deleteAvailability.mockReset()
    hookState.reviewBooking.mockReset()
    hookState.bookingsStatus = undefined
  })

  it('validates availability must start and end on whole hours', async () => {
    const user = userEvent.setup()

    render(<TeacherAvailabilityPage />)

    await user.type(screen.getByTestId('teacher-availability-start'), '2026-07-23T10:30')
    await user.type(screen.getByTestId('teacher-availability-end'), '2026-07-23T11:30')
    await user.click(screen.getByRole('button', { name: /create availability/i }))

    expect(await screen.findByTestId('availability-error')).toHaveTextContent('Start and end time must be on the hour.')
    expect(hookState.createAvailability).not.toHaveBeenCalled()
  })

  it('submits teacher review and explains missing compensation validation errors', async () => {
    const user = userEvent.setup()
    hookState.reviewBooking.mockRejectedValue(createAxiosError(400, 'Teacher compensation must be configured before review'))

    render(<TeacherBookingsPage />)

    expect(screen.getByText('Opening conversations')).toBeInTheDocument()
    await user.selectOptions(screen.getByTestId('teacher-review-result-88'), 'NOT_APPROVED')
    await user.type(screen.getByTestId('teacher-review-comment-88'), 'Needs another speaking practice session.')
    await user.click(screen.getByTestId('submit-teacher-review-88'))

    await waitFor(() =>
      expect(hookState.reviewBooking).toHaveBeenCalledWith({
        bookingId: 88,
        data: {
          result: 'NOT_APPROVED',
          comment: 'Needs another speaking practice session.',
        },
      })
    )
    expect(await screen.findByText('Teacher compensation must be configured before review')).toBeInTheDocument()
  })
})
