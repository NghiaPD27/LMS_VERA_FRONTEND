import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EvaluatorCheckpointPage } from '../EvaluatorCheckpointPage'

const checkpointHookState = vi.hoisted(() => ({
  submitResult: vi.fn(),
}))

vi.mock('../../../hooks/useCheckpoint', () => ({
  useGetEvaluatorCheckpointSessions: () => ({
    data: [
      {
        id: 9,
        programName: 'Foundation English',
        blockNumber: 1,
        gateLessonNumber: 5,
        nextLessonNumber: 6,
        scheduledAt: '2026-07-24T10:00:00Z',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        participants: [
          {
            id: 77,
            enrollmentId: 10,
            studentId: 3,
            studentName: 'John Smith',
            addedAt: '2026-07-23T08:00:00Z',
          },
        ],
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useGetEvaluatorCheckpointSession: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
  useSubmitCheckpointResult: () => ({
    mutateAsync: checkpointHookState.submitResult,
    isPending: false,
  }),
}))

describe('EvaluatorCheckpointPage', () => {
  beforeEach(() => {
    checkpointHookState.submitResult.mockReset()
    checkpointHookState.submitResult.mockResolvedValue({
      participantId: 77,
      result: 'NOT_PASS',
    })
  })

  it('submits checkpoint result for a participant', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <EvaluatorCheckpointPage />
      </MemoryRouter>
    )

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    await user.selectOptions(screen.getByTestId('checkpoint-result-77'), 'NOT_PASS')
    await user.type(screen.getByTestId('checkpoint-comment-77'), 'Needs one more speaking checkpoint.')
    await user.click(screen.getByTestId('submit-checkpoint-result-77'))

    await waitFor(() =>
      expect(checkpointHookState.submitResult).toHaveBeenCalledWith({
        participantId: 77,
        result: 'NOT_PASS',
        comment: 'Needs one more speaking checkpoint.',
      })
    )
    expect(await screen.findByText('Checkpoint result saved as NOT_PASS.')).toBeInTheDocument()
  })
})
