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
  availabilitySlots: [] as Array<{
    availabilityId: number
    teacherId: number
    startAt: string
    endAt: string
    status: string
    meetLink?: string
  }>,
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useCreateTeacherAvailability: () => ({
    mutateAsync: hookState.createAvailability,
    isPending: false,
  }),
  useGetTeacherAvailability: () => ({
    data: {
      content: hookState.availabilitySlots,
      totalElements: hookState.availabilitySlots.length,
      totalPages: hookState.availabilitySlots.length ? 1 : 0,
      page: 0,
      size: 20,
    },
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
  useGetTeacherBookings: (params = {}) => {
    hookState.bookingsStatus = (params as { status?: string }).status
    return {
      data: {
        content: [
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
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 20,
      },
      isLoading: false,
      isFetching: false,
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
    hookState.availabilitySlots = []
  })

  it('validates availability requires date and hour fields', async () => {
    const user = userEvent.setup()

    render(<TeacherAvailabilityPage />)

    await user.type(screen.getByTestId('teacher-availability-start-date'), '2026-07-23')
    await user.selectOptions(screen.getByTestId('teacher-availability-start-hour'), '10')
    await user.click(screen.getByRole('button', { name: /create availability/i }))

    expect(await screen.findByTestId('availability-error')).toHaveTextContent('Start date, start hour, end date, and end hour are required')
    expect(hookState.createAvailability).not.toHaveBeenCalled()
  })

  it('validates Google Meet link before creating availability', async () => {
    const user = userEvent.setup()

    render(<TeacherAvailabilityPage />)

    await user.type(screen.getByTestId('teacher-availability-start-date'), '2026-07-23')
    await user.selectOptions(screen.getByTestId('teacher-availability-start-hour'), '10')
    await user.type(screen.getByTestId('teacher-availability-end-date'), '2026-07-23')
    await user.selectOptions(screen.getByTestId('teacher-availability-end-hour'), '11')
    await user.click(screen.getByRole('button', { name: /create availability/i }))

    expect(await screen.findByTestId('availability-error')).toHaveTextContent('Google Meet link is required')
    expect(hookState.createAvailability).not.toHaveBeenCalled()

    await user.type(screen.getByTestId('teacher-availability-meet-link'), 'https://example.com/not-meet')
    await user.click(screen.getByRole('button', { name: /create availability/i }))

    expect(await screen.findByTestId('availability-error')).toHaveTextContent('must start with https://meet.google.com/')
    expect(hookState.createAvailability).not.toHaveBeenCalled()
  })

  it('submits Google Meet link when creating availability', async () => {
    const user = userEvent.setup()
    hookState.createAvailability.mockResolvedValue({
      id: 2,
      teacherId: 2,
      startAt: '2026-07-23T10:00:00.000Z',
      endAt: '2026-07-23T11:00:00.000Z',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      createdAt: '2026-07-22T10:00:00.000Z',
    })

    render(<TeacherAvailabilityPage />)

    await user.type(screen.getByTestId('teacher-availability-start-date'), '2026-07-23')
    await user.selectOptions(screen.getByTestId('teacher-availability-start-hour'), '10')
    await user.type(screen.getByTestId('teacher-availability-end-date'), '2026-07-23')
    await user.selectOptions(screen.getByTestId('teacher-availability-end-hour'), '11')
    await user.type(screen.getByTestId('teacher-availability-meet-link'), '  https://meet.google.com/abc-defg-hij  ')
    await user.click(screen.getByRole('button', { name: /create availability/i }))

    await waitFor(() =>
      expect(hookState.createAvailability).toHaveBeenCalledWith({
        startAt: expect.any(String),
        endAt: expect.any(String),
        meetLink: 'https://meet.google.com/abc-defg-hij',
      })
    )
    expect(await screen.findByTestId('availability-success')).toHaveTextContent('Google Meet ready')
  })

  it('shows teacher Meet links for availability management', () => {
    hookState.availabilitySlots = [
      {
        availabilityId: 2,
        teacherId: 2,
        startAt: '2026-07-23T10:00:00Z',
        endAt: '2026-07-23T11:00:00Z',
        status: 'OPEN',
        meetLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        availabilityId: 3,
        teacherId: 2,
        startAt: '2026-07-24T10:00:00Z',
        endAt: '2026-07-24T11:00:00Z',
        status: 'OPEN',
      },
    ]

    render(<TeacherAvailabilityPage />)

    expect(screen.getByRole('link', { name: /open meet/i })).toHaveAttribute('href', 'https://meet.google.com/abc-defg-hij')
    expect(screen.getByText('Missing Meet link')).toBeInTheDocument()
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
