import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnrollmentPage } from '../EnrollmentPage'

const hookState = vi.hoisted(() => ({
  assignTeacher: vi.fn(),
  saveCompensation: vi.fn(),
}))

vi.mock('../../../hooks/useAdminUsers', () => ({
  useGetStudents: () => ({
    data: { content: [] },
    isLoading: false,
    isError: false,
  }),
  useGetStudent: () => ({
    data: undefined,
  }),
  useGetStudentEnrollments: () => ({
    data: [],
    isLoading: false,
  }),
}))

vi.mock('../../../hooks/usePrograms', () => ({
  useGetPrograms: () => ({
    data: { content: [] },
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../../../hooks/useEnrollments', () => ({
  useGetAdminEnrollments: () => ({
    data: {
      content: [
        {
          id: 44,
          studentId: 3,
          studentName: 'John Smith',
          studentEmail: 'student@vera.com',
          programId: 1,
          programName: 'Foundation English',
          status: 'ACTIVE',
        },
      ],
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
  }),
  useEnrollStudent: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateEnrollment: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useExtendEnrollment: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useGetAdminTeachers: () => ({
    data: {
      content: [
        {
          userId: 2,
          username: 'teacher',
          email: 'teacher@vera.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useAssignTeacher: () => ({
    mutateAsync: hookState.assignTeacher,
    isPending: false,
  }),
  useUpsertTeacherCompensation: () => ({
    mutateAsync: hookState.saveCompensation,
    isPending: false,
  }),
  useGetTeacherEarnings: () => ({
    data: {
      teacherId: 2,
      totalEarned: 0,
      currency: 'VND',
      earnings: [],
    },
    isLoading: false,
    isError: false,
  }),
}))

describe('EnrollmentPage teacher assignment', () => {
  beforeEach(() => {
    hookState.assignTeacher.mockReset()
    hookState.saveCompensation.mockReset()
    hookState.assignTeacher.mockResolvedValue({})
    hookState.saveCompensation.mockResolvedValue({})
  })

  it('assigns a searched teacher and saves VND compensation', async () => {
    const user = userEvent.setup()

    render(<EnrollmentPage />)

    await user.click(screen.getByTestId('manage-teacher-44'))
    expect(screen.getByText('Not assigned yet')).toBeInTheDocument()

    await user.click(screen.getByTestId('select-teacher-2'))
    await user.click(screen.getByTestId('assign-teacher-44'))

    await waitFor(() =>
      expect(hookState.assignTeacher).toHaveBeenCalledWith({
        enrollmentId: 44,
        teacherId: 2,
      })
    )

    await user.type(screen.getByTestId('teacher-compensation-amount-44'), '250000')
    await user.click(screen.getByTestId('save-teacher-compensation-44'))

    await waitFor(() =>
      expect(hookState.saveCompensation).toHaveBeenCalledWith({
        teacherId: 2,
        data: {
          amountPerSession: 250000,
          currency: 'VND',
        },
      })
    )
  })
})

