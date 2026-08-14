import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnrollmentPage } from '../EnrollmentPage'

const hookState = vi.hoisted(() => ({
  assignTeacher: vi.fn(),
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
          id: 2,
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
  useGetAdminTeacher: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
  useAssignTeacher: () => ({
    mutateAsync: hookState.assignTeacher,
    isPending: false,
  }),
}))

describe('EnrollmentPage teacher assignment', () => {
  beforeEach(() => {
    hookState.assignTeacher.mockReset()
    hookState.assignTeacher.mockResolvedValue({})
  })

  it('assigns a searched teacher without configuring compensation per enrollment', async () => {
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

    expect(screen.queryByTestId('teacher-compensation-amount-44')).not.toBeInTheDocument()
    expect(screen.queryByTestId('save-teacher-compensation-44')).not.toBeInTheDocument()
    expect(screen.getByText(/Assign one teacher to this enrollment without changing course access or lesson progress/i)).toBeInTheDocument()
  })
})
