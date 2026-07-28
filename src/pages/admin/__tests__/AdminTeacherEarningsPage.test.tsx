import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminTeacherEarningsPage } from '../AdminTeacherEarningsPage'
import { getCurrentVietnamMonth } from '../../../utils/month'

const hookState = vi.hoisted(() => ({
  teacherParams: [] as Array<{ teacherId?: number; params: { month?: string }; enabled?: boolean }>,
  teachersParams: [] as Array<{ keyword?: string; page?: number; size?: number }>,
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useGetAdminTeachers: (params: { keyword?: string; page?: number; size?: number }) => {
    hookState.teachersParams.push(params)
    return {
      data: {
        content: [
          {
            id: 2,
            username: 'teacher',
            email: 'teacher@vera.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          {
            id: 7,
            username: 'mentor',
            email: 'mentor@vera.com',
            firstName: 'Minh',
            lastName: 'Tran',
          },
        ],
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  },
  useGetTeacherEarnings: (teacherId?: number, params: { month?: string } = {}, enabled = true) => {
    hookState.teacherParams.push({ teacherId, params, enabled })
    const totalEarned = params.month === '2026-08' ? 900000 : 400000
    return {
      data: {
        teacherId,
        totalEarned,
        totalSessions: params.month === '2026-08' ? 3 : 1,
        currency: 'VND',
        periodMonth: params.month,
        periodStart: params.month ? `${params.month}-01T00:00:00+07:00` : undefined,
        periodEnd: params.month === '2026-08' ? '2026-09-01T00:00:00+07:00' : '2026-08-01T00:00:00+07:00',
        earnings: [
          {
            id: teacherId,
            teacherId,
            bookingId: 80 + (teacherId ?? 0),
            studentName: 'John Smith',
            lessonName: 'Opening conversations',
            amount: totalEarned,
            currency: 'VND',
            status: 'EARNED',
            earnedAt: '2026-07-23T10:00:00Z',
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  },
}))

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminTeacherEarningsPage />
    </QueryClientProvider>
  )
}

describe('AdminTeacherEarningsPage', () => {
  beforeEach(() => {
    hookState.teacherParams = []
    hookState.teachersParams = []
  })

  it('sends the current month for each visible teacher by default', () => {
    renderPage()

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Minh Tran')).toBeInTheDocument()
    expect(hookState.teacherParams).toEqual(
      expect.arrayContaining([
        { teacherId: 2, params: { month: getCurrentVietnamMonth() }, enabled: true },
        { teacherId: 7, params: { month: getCurrentVietnamMonth() }, enabled: true },
      ])
    )
  })

  it('updates teacher earnings params and totals when the month changes', async () => {
    renderPage()

    fireEvent.change(screen.getByTestId('admin-teacher-earnings-month-input'), {
      target: { value: '2026-08' },
    })

    await waitFor(() =>
      expect(hookState.teacherParams).toEqual(
        expect.arrayContaining([
          { teacherId: 2, params: { month: '2026-08' }, enabled: true },
          { teacherId: 7, params: { month: '2026-08' }, enabled: true },
        ])
      )
    )
    expect(screen.getAllByText(/900,000/).length).toBeGreaterThan(0)
  })
})
