import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TeacherEarningsPage } from '../TeacherEarningsPage'
import { getCurrentVietnamMonth } from '../../../utils/month'

const hookState = vi.hoisted(() => ({
  mode: 'success' as 'success' | 'empty' | 'error',
  params: [] as Array<{ month?: string }>,
  refetch: vi.fn(),
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useGetMyTeacherEarnings: (params: { month?: string }) => {
    hookState.params.push(params)

    if (hookState.mode === 'error') {
      return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error('Backend is unavailable'),
        refetch: hookState.refetch,
      }
    }

    const earnings = hookState.mode === 'empty'
      ? []
      : [
          {
            id: 1,
            teacherId: 2,
            bookingId: 88,
            studentId: 3,
            studentName: 'John Smith',
            lessonId: 101,
            lessonName: 'Opening conversations',
            amount: 500000,
            currency: 'VND',
            status: 'EARNED',
            earnedAt: '2026-07-23T10:00:00Z',
          },
        ]

    return {
      data: {
        teacherId: 2,
        totalEarned: earnings.reduce((total, earning) => total + (earning.amount || 0), 0),
        totalSessions: earnings.length,
        currency: 'VND',
        periodMonth: params.month,
        periodStart: params.month ? `${params.month}-01T00:00:00+07:00` : undefined,
        periodEnd: params.month ? '2026-08-01T00:00:00+07:00' : undefined,
        earnings,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: hookState.refetch,
    }
  },
}))

describe('TeacherEarningsPage', () => {
  beforeEach(() => {
    hookState.mode = 'success'
    hookState.params = []
    hookState.refetch.mockReset()
  })

  it('sends the current Vietnam month by default and renders totals with rows', () => {
    render(<TeacherEarningsPage />)

    expect(hookState.params[hookState.params.length - 1]).toEqual({ month: getCurrentVietnamMonth() })
    expect(screen.getByText('Opening conversations')).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Sessions')).toBeInTheDocument()
  })

  it('can switch to all-time and calls the endpoint without month', async () => {
    const user = userEvent.setup()

    render(<TeacherEarningsPage />)
    await user.click(screen.getByTestId('teacher-earnings-all-time-mode'))

    await waitFor(() => expect(hookState.params[hookState.params.length - 1]).toEqual({}))
    expect(screen.getByText('Viewing all earned sessions.')).toBeInTheDocument()
  })

  it('renders empty earnings cleanly', () => {
    hookState.mode = 'empty'

    render(<TeacherEarningsPage />)

    expect(screen.getByText('No earnings found')).toBeInTheDocument()
  })

  it('renders a retry state for API errors', async () => {
    const user = userEvent.setup()
    hookState.mode = 'error'

    render(<TeacherEarningsPage />)

    expect(screen.getByTestId('teacher-earnings-error')).toHaveTextContent('Backend is unavailable')
    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(hookState.refetch).toHaveBeenCalled()
  })
})
