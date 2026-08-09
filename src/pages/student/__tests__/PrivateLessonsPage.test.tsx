import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrivateLessonsPage } from '../PrivateLessonsPage'

const hookState = vi.hoisted(() => ({
  getTeachers: vi.fn(),
  getSlots: vi.fn(),
  getBookings: vi.fn(),
  createBooking: vi.fn(),
  cancelBooking: vi.fn(),
  slotsRefetch: vi.fn(),
  bookingsRefetch: vi.fn(),
  teachers: [
    {
      teacherId: 2,
      teacherName: 'Jane Doe',
      bio: 'English conversation teacher',
    },
  ],
  slots: [
    {
      teacherId: 2,
      teacherName: 'Jane Doe',
      availabilityId: 11,
      startAt: '2026-07-23T10:00:00Z',
      endAt: '2026-07-23T11:00:00Z',
    },
  ],
  bookings: [] as Array<{
    id: number
    bookingType: string
    teacherId: number
    teacherName: string
    meetLink?: string
    startAt: string
    endAt: string
    status: string
    lessonId?: number | null
    enrollmentId?: number | null
  }>,
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useGetPrivateTeachers: (params = {}) => {
    hookState.getTeachers(params)
    return {
      data: {
        content: hookState.teachers,
        totalElements: hookState.teachers.length,
        totalPages: hookState.teachers.length ? 1 : 0,
        page: 0,
        size: 10,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    }
  },
  useGetStudentPrivateTeacherSlots: (params = {}) => {
    hookState.getSlots(params)
    const teacherId = (params as { teacherId?: number }).teacherId
    return {
      data: {
        content: teacherId ? hookState.slots : [],
        totalElements: teacherId ? hookState.slots.length : 0,
        totalPages: teacherId && hookState.slots.length ? 1 : 0,
        page: 0,
        size: 20,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: hookState.slotsRefetch,
    }
  },
  useGetStudentPrivateBookings: (params = {}) => {
    hookState.getBookings(params)
    return {
      data: {
        content: hookState.bookings,
        totalElements: hookState.bookings.length,
        totalPages: hookState.bookings.length ? 1 : 0,
        page: 0,
        size: 20,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: hookState.bookingsRefetch,
    }
  },
  useCreateStudentPrivateBooking: () => ({
    mutateAsync: hookState.createBooking,
    isPending: false,
  }),
  useCancelStudentPrivateBooking: () => ({
    mutateAsync: hookState.cancelBooking,
    isPending: false,
  }),
}))

const createAxiosError = (status: number, message = 'Slot is no longer available') =>
  ({
    isAxiosError: true,
    message: 'Request failed',
    response: {
      data: { message },
      status,
    },
  }) as AxiosError

describe('PrivateLessonsPage', () => {
  beforeEach(() => {
    hookState.getTeachers.mockClear()
    hookState.getSlots.mockClear()
    hookState.getBookings.mockClear()
    hookState.createBooking.mockReset()
    hookState.cancelBooking.mockReset()
    hookState.slotsRefetch.mockReset()
    hookState.bookingsRefetch.mockReset()
    hookState.teachers = [
      {
        teacherId: 2,
        teacherName: 'Jane Doe',
        bio: 'English conversation teacher',
      },
    ]
    hookState.slots = [
      {
        teacherId: 2,
        teacherName: 'Jane Doe',
        availabilityId: 11,
        startAt: '2026-07-23T10:00:00Z',
        endAt: '2026-07-23T11:00:00Z',
      },
    ]
    hookState.bookings = []
    hookState.createBooking.mockResolvedValue({
      id: 77,
      bookingType: 'PRIVATE',
      teacherId: 2,
      teacherName: 'Jane Doe',
      lessonId: null,
      enrollmentId: null,
      meetLink: 'https://meet.google.com/private-room',
      startAt: '2026-07-23T10:00:00Z',
      endAt: '2026-07-23T11:00:00Z',
      status: 'BOOKED',
    })
  })

  it('searches teachers and loads slots after teacher selection', async () => {
    const user = userEvent.setup()

    render(<PrivateLessonsPage />)

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Choose a teacher')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search private teachers/i), 'Jane')
    await waitFor(() => expect(hookState.getTeachers).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: 'Jane' })))

    await user.click(screen.getByText('Jane Doe'))

    await waitFor(() => expect(hookState.getSlots).toHaveBeenLastCalledWith(expect.objectContaining({ teacherId: 2 })))
    expect(await screen.findAllByText(/Jul 23, 2026/i)).not.toHaveLength(0)
  })

  it('books a private slot and only shows the Meet link after booking', async () => {
    const user = userEvent.setup()

    render(<PrivateLessonsPage />)

    await user.click(screen.getByText('Jane Doe'))
    expect(document.body).not.toHaveTextContent('https://meet.google.com/private-room')

    await user.click((await screen.findAllByText(/Jul 23, 2026/i))[0])
    await user.click(screen.getByRole('button', { name: /book private lesson/i }))

    await waitFor(() =>
      expect(hookState.createBooking).toHaveBeenCalledWith({
        teacherId: 2,
        slotStartAt: '2026-07-23T10:00:00Z',
      })
    )
    expect(await screen.findByText('Private lesson booked with Jane Doe.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open meet/i })).toHaveAttribute('href', 'https://meet.google.com/private-room')
  })

  it('cancels a booked private lesson', async () => {
    const user = userEvent.setup()
    hookState.bookings = [
      {
        id: 78,
        bookingType: 'PRIVATE',
        teacherId: 2,
        teacherName: 'Jane Doe',
        meetLink: 'https://meet.google.com/private-room',
        startAt: '2026-07-23T10:00:00Z',
        endAt: '2026-07-23T11:00:00Z',
        status: 'BOOKED',
      },
    ]
    hookState.cancelBooking.mockResolvedValue({ ...hookState.bookings[0], status: 'CANCELLED' })

    render(<PrivateLessonsPage />)

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    await waitFor(() => expect(hookState.cancelBooking).toHaveBeenCalledWith(78))
    expect(await screen.findByText('Private lesson booking cancelled.')).toBeInTheDocument()
  })

  it('refreshes private slots after a booking conflict', async () => {
    const user = userEvent.setup()
    hookState.createBooking.mockRejectedValue(createAxiosError(409))

    render(<PrivateLessonsPage />)

    await user.click(screen.getByText('Jane Doe'))
    await user.click((await screen.findAllByText(/Jul 23, 2026/i))[0])
    await user.click(screen.getByRole('button', { name: /book private lesson/i }))

    expect(await screen.findByText('This private lesson slot is no longer available. The slot list has been refreshed.')).toBeInTheDocument()
    expect(hookState.slotsRefetch).toHaveBeenCalled()
  })
})
