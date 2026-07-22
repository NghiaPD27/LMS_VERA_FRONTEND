import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckpointPage } from '../CheckpointPage'

const checkpointHookState = vi.hoisted(() => ({
  createSession: vi.fn(),
  addParticipants: vi.fn(),
  updateSession: vi.fn(),
  updateStatus: vi.fn(),
  removeParticipant: vi.fn(),
}))

vi.mock('../../../hooks/usePrograms', () => ({
  useGetPrograms: () => ({
    data: {
      content: [
        {
          id: 1,
          name: 'Foundation English',
        },
      ],
    },
  }),
}))

vi.mock('../../../hooks/useCheckpoint', () => ({
  useGetCheckpointEligibleStudents: () => ({
    data: [
      {
        studentId: 3,
        studentName: 'John Smith',
        enrollmentId: 10,
        programId: 1,
        programName: 'Foundation English',
        blockNumber: 1,
        gateLessonNumber: 5,
        nextLessonNumber: 6,
        gateLessonName: 'Block 1 review',
        eligibleAt: '2026-07-23T08:00:00Z',
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetAdminEvaluators: () => ({
    data: {
      content: [
        {
          id: 4,
          username: 'evaluator',
          email: 'evaluator@vera.com',
          firstName: 'Evan',
          lastName: 'Tran',
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useGetAdminCheckpointSessions: () => ({
    data: {
      content: [],
      totalPages: 0,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateCheckpointSession: () => ({
    mutateAsync: checkpointHookState.createSession,
    isPending: false,
  }),
  useAddCheckpointParticipants: () => ({
    mutateAsync: checkpointHookState.addParticipants,
    isPending: false,
  }),
  useUpdateCheckpointSession: () => ({
    mutateAsync: checkpointHookState.updateSession,
    isPending: false,
  }),
  useUpdateCheckpointSessionStatus: () => ({
    mutateAsync: checkpointHookState.updateStatus,
    isPending: false,
  }),
  useRemoveCheckpointParticipant: () => ({
    mutateAsync: checkpointHookState.removeParticipant,
    isPending: false,
  }),
}))

describe('CheckpointPage', () => {
  beforeEach(() => {
    checkpointHookState.createSession.mockReset()
    checkpointHookState.addParticipants.mockReset()
    checkpointHookState.updateSession.mockReset()
    checkpointHookState.updateStatus.mockReset()
    checkpointHookState.removeParticipant.mockReset()
    checkpointHookState.createSession.mockResolvedValue({
      id: 99,
      evaluatorId: 4,
      participants: [{ id: 1, enrollmentId: 10 }],
    })
  })

  it('creates a checkpoint session with selected eligible students', async () => {
    const user = userEvent.setup()

    render(<CheckpointPage />)

    await user.selectOptions(screen.getByLabelText('Program'), '1')
    await user.selectOptions(screen.getByLabelText('Block'), '1')
    await user.click(screen.getByTestId('select-checkpoint-student-10'))
    await user.click(screen.getByTestId('select-evaluator-4'))
    fireEvent.change(screen.getByTestId('checkpoint-scheduled-at'), { target: { value: '2026-07-24T10:00' } })
    fireEvent.change(screen.getByTestId('checkpoint-meet-link'), { target: { value: 'https://meet.google.com/abc-defg-hij' } })
    await user.click(screen.getByTestId('create-checkpoint-session'))

    await waitFor(() =>
      expect(checkpointHookState.createSession).toHaveBeenCalledWith({
        programId: 1,
        blockNumber: 1,
        evaluatorId: 4,
        scheduledAt: new Date('2026-07-24T10:00').toISOString(),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        participantEnrollmentIds: [10],
      })
    )
    expect(await screen.findByText(/Checkpoint session #99 created/i)).toBeInTheDocument()
  })
})
