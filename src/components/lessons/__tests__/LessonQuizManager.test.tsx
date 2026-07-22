import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LessonQuizManager } from '../LessonQuizManager'
import type { Lesson } from '../../../types/lesson'
import type { Quiz, UpsertQuizRequest } from '../../../types/quiz'

const hookState = vi.hoisted(() => ({
  quizQuery: {
    data: undefined as Quiz | undefined,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  upsertQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
}))

vi.mock('../../../hooks/useQuiz', () => ({
  useGetLessonQuiz: () => hookState.quizQuery,
  useGetLessonQuizAttempts: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useUpsertLessonQuiz: () => ({
    mutateAsync: hookState.upsertQuiz,
    isPending: false,
  }),
  useDeleteLessonQuiz: () => ({
    mutateAsync: hookState.deleteQuiz,
    isPending: false,
  }),
}))

const lesson: Lesson = {
  id: 101,
  programId: 1,
  name: 'Opening conversations',
  lessonNumber: 1,
  content: 'Practice greetings.',
  status: 'PUBLISHED',
}

const existingQuiz: Quiz = {
  id: 11,
  lessonId: 101,
  title: 'Lesson 1 review',
  questions: [
    {
      id: 201,
      position: 1,
      questionText: 'What should you say first?',
      options: [
        { id: 301, position: 1, optionText: 'Hello', correct: true },
        { id: 302, position: 2, optionText: 'Goodbye', correct: false },
      ],
    },
  ],
}

const renderManager = () =>
  render(<LessonQuizManager lesson={lesson} isOpen onClose={vi.fn()} />)

describe('LessonQuizManager', () => {
  beforeEach(() => {
    hookState.quizQuery.data = existingQuiz
    hookState.quizQuery.isLoading = false
    hookState.quizQuery.isError = false
    hookState.quizQuery.error = null
    hookState.quizQuery.refetch.mockReset()
    hookState.deleteQuiz.mockReset()
    hookState.upsertQuiz.mockImplementation(async ({ data }: { data: UpsertQuizRequest }) => ({
      id: 11,
      lessonId: 101,
      title: data.title,
      questions: data.questions.map((question, questionIndex) => ({
        id: questionIndex + 1,
        position: questionIndex + 1,
        questionText: question.questionText,
        options: question.options.map((option, optionIndex) => ({
          id: optionIndex + 1,
          position: optionIndex + 1,
          optionText: option.optionText,
          correct: option.correct,
        })),
      })),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads an existing quiz into the question list and editor', () => {
    renderManager()

    expect(screen.getByDisplayValue('Lesson 1 review')).toBeInTheDocument()
    expect(screen.getAllByText('What should you say first?').length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Goodbye')).toBeInTheDocument()
    expect(screen.getByText('1/1')).toBeInTheDocument()
  })

  it('adds a question and selects the new editor panel', async () => {
    const user = userEvent.setup()
    renderManager()

    await user.click(screen.getByRole('button', { name: /add question/i }))

    expect(screen.getAllByText('Question 2').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Write the question students will answer')).toHaveValue('')
  })

  it('saves exactly one correct answer for the selected question', async () => {
    const user = userEvent.setup()
    renderManager()

    const radios = screen.getAllByRole('radio')
    await user.click(radios[1])
    await user.click(screen.getByRole('button', { name: /save quiz/i }))

    await waitFor(() => expect(hookState.upsertQuiz).toHaveBeenCalled())
    expect(hookState.upsertQuiz).toHaveBeenCalledWith({
      lessonId: 101,
      data: {
        title: 'Lesson 1 review',
        questions: [
          {
            questionText: 'What should you say first?',
            options: [
              { optionText: 'Hello', correct: false },
              { optionText: 'Goodbye', correct: true },
            ],
          },
        ],
      },
    })
  })

  it('shows validation when the quiz title is empty', async () => {
    const user = userEvent.setup()
    renderManager()

    await user.clear(screen.getByLabelText('Quiz title'))
    await user.click(screen.getByRole('button', { name: /save quiz/i }))

    expect(screen.getByText('Quiz title is required.')).toBeInTheDocument()
    expect(hookState.upsertQuiz).not.toHaveBeenCalled()
  })
})
