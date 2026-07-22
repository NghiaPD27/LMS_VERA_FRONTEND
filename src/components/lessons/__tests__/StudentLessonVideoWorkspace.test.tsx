import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { lessonApi } from '../../../api/lessonApi'
import { StudentLessonVideoWorkspace } from '../StudentLessonVideoWorkspace'
import type { Lesson } from '../../../types/lesson'

const hlsMock = vi.hoisted(() => ({
  loadSource: vi.fn(),
  attachMedia: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  isSupported: vi.fn(() => true),
  mediaAttachedHandler: undefined as (() => void) | undefined,
}))

const teacherHookState = vi.hoisted(() => ({
  getSlots: vi.fn(),
  createBooking: vi.fn(),
}))

const quizHookState = vi.hoisted(() => ({
  getLessonQuiz: vi.fn(),
}))

vi.mock('../../../api/lessonApi', () => ({
  lessonApi: {
    getLessonLearningState: vi.fn(),
    getLessonVideoPlayback: vi.fn(),
    getLessonVideoProgress: vi.fn(),
    updateLessonVideoProgress: vi.fn(),
  },
}))

vi.mock('../../../hooks/useQuiz', () => ({
  useGetLessonQuiz: (lessonId?: number, enabled = true) => {
    quizHookState.getLessonQuiz(lessonId, enabled)
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  },
  useStartQuizAttempt: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSubmitQuizAttempt: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('../../../hooks/useTeacher', () => ({
  useGetStudentTeacherSlots: (lessonId?: number, enabled = true) => {
    teacherHookState.getSlots(lessonId, enabled)
    return {
      data: enabled
        ? [
            {
              teacherId: 2,
              teacherName: 'Jane Doe',
              availabilityId: 11,
              startAt: '2026-07-23T10:00:00Z',
              endAt: '2026-07-23T11:00:00Z',
            },
          ]
        : [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  },
  useCreateStudentBooking: () => ({
    mutateAsync: teacherHookState.createBooking,
    isPending: false,
  }),
}))

vi.mock('../../../hooks/useCheckpoint', () => ({
  useGetStudentCheckpointStatus: (lessonId?: number, enabled = true) => ({
    data: enabled
      ? {
          lessonId,
          lessonProgressStatus: 'WAITING_FOR_CHECKPOINT',
          sessionStatus: 'PENDING',
          blockNumber: 1,
          scheduledAt: '2026-07-24T10:00:00Z',
          evaluatorName: 'Evan Tran',
          lastResult: undefined,
        }
      : undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

vi.mock('hls.js', () => {
  class MockHls {
    static Events = {
      ERROR: 'hlsError',
      MEDIA_ATTACHED: 'hlsMediaAttached',
      MANIFEST_LOADED: 'hlsManifestLoaded',
      MANIFEST_PARSED: 'hlsManifestParsed',
      LEVEL_LOADED: 'hlsLevelLoaded',
    }
    static ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' }
    static isSupported = hlsMock.isSupported
    loadSource = hlsMock.loadSource
    attachMedia = (video: HTMLVideoElement) => {
      hlsMock.attachMedia(video)
      hlsMock.mediaAttachedHandler?.()
    }
    destroy = hlsMock.destroy
    on = (event: string, handler: () => void) => {
      hlsMock.on(event, handler)
      if (event === MockHls.Events.MEDIA_ATTACHED) {
        hlsMock.mediaAttachedHandler = handler
      }
    }
  }

  return { default: MockHls }
})

const mockLessonApi = vi.mocked(lessonApi)

const lessons: Lesson[] = [
  {
    id: 101,
    programId: 1,
    name: 'Opening conversations',
    lessonNumber: 1,
    content: 'Practice greetings.',
    status: 'PUBLISHED',
    lessonProgressStatus: 'VIDEO_IN_PROGRESS',
    locked: false,
  },
]

const renderWorkspace = (workspaceLessons = lessons) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <StudentLessonVideoWorkspace lessons={workspaceLessons} />
    </QueryClientProvider>
  )
}

const createAxiosError = (status: number) =>
  ({
    isAxiosError: true,
    message: 'Request failed',
    response: {
      data: { message: 'Not found' },
      status,
    },
  }) as AxiosError

describe('StudentLessonVideoWorkspace', () => {
  beforeEach(() => {
    teacherHookState.getSlots.mockClear()
    teacherHookState.createBooking.mockReset()
    quizHookState.getLessonQuiz.mockClear()
    teacherHookState.createBooking.mockResolvedValue({
      id: 77,
      lessonId: 101,
      teacherId: 2,
      teacherName: 'Jane Doe',
      startAt: '2026-07-23T10:00:00Z',
      endAt: '2026-07-23T11:00:00Z',
      status: 'BOOKED',
    })
    mockLessonApi.updateLessonVideoProgress.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      currentSecond: 0,
      furthestWatchedSecond: 0,
      watchedPercentage: 0,
      completed: false,
      lessonProgressStatus: 'VIDEO_IN_PROGRESS',
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 0,
        furthestWatchedSecond: 0,
        watchedPercentage: 0,
        completed: false,
        lessonProgressStatus: 'VIDEO_IN_PROGRESS',
      },
      quizAvailable: false,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    hlsMock.isSupported.mockReturnValue(true)
    hlsMock.mediaAttachedHandler = undefined
  })

  it('loads only the backend playbackUrl through HLS.js', async () => {
    const playbackUrl = 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc'
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl,
      status: 'READY',
      durationSeconds: 300,
      thumbnailUrl: 'https://signed-playback.example.com/thumb.jpg',
    })

    const { container } = renderWorkspace()

    await waitFor(() => expect(mockLessonApi.getLessonVideoPlayback).toHaveBeenCalledWith(101))
    await waitFor(() => expect(mockLessonApi.getLessonLearningState).toHaveBeenCalledWith(101))
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument())
    await waitFor(() => expect(hlsMock.loadSource).toHaveBeenCalledWith(playbackUrl))

    const video = container.querySelector('video')
    const iframeHostPattern = `iframe.${['media', 'delivery'].join('')}.net/play`
    const cdnHostPattern = `${['b', 'cdn'].join('-')}.net`

    expect(hlsMock.attachMedia).toHaveBeenCalledWith(video)
    expect(container.innerHTML).not.toContain(iframeHostPattern)
    expect(container.innerHTML).not.toContain(cdnHostPattern)
  })

  it('shows a clear not found message when lesson video playback returns 404', async () => {
    mockLessonApi.getLessonVideoPlayback.mockRejectedValue(createAxiosError(404))

    renderWorkspace()

    expect(await screen.findByText('Video was not found')).toBeInTheDocument()
    expect(screen.getByText('Video was not found for this lesson.')).toBeInTheDocument()
  })

  it('keeps the quiz available after reload from backend learning state', async () => {
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 270,
        furthestWatchedSecond: 270,
        watchedPercentage: 90,
        completed: true,
        lessonProgressStatus: 'QUIZ_AVAILABLE',
      },
      quizAvailable: true,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })

    renderWorkspace()

    expect(await screen.findByText('Quiz available')).toBeInTheDocument()
    expect(screen.getByText('90% watched')).toBeInTheDocument()
  })

  it('renders teacher booking when backend moves lesson to waiting for teacher', async () => {
    const user = userEvent.setup()
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 300,
        furthestWatchedSecond: 300,
        watchedPercentage: 100,
        completed: true,
        lessonProgressStatus: 'WAITING_FOR_TEACHER',
      },
      quizAvailable: true,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })

    renderWorkspace()

    expect(await screen.findByText('Book your review session')).toBeInTheDocument()
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    await waitFor(() => expect(teacherHookState.getSlots).toHaveBeenCalledWith(101, true))

    await user.click(screen.getByText(/Jul 23, 2026/i))
    await user.click(screen.getByRole('button', { name: /book session/i }))

    await waitFor(() =>
      expect(teacherHookState.createBooking).toHaveBeenCalledWith({
        lessonId: 101,
        slotStartAt: '2026-07-23T10:00:00Z',
      })
    )
    expect(await screen.findByText('Session booked')).toBeInTheDocument()
  })

  it('renders checkpoint waiting state without mounting quiz or booking panels', async () => {
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 300,
        furthestWatchedSecond: 300,
        watchedPercentage: 100,
        completed: false,
        lessonProgressStatus: 'WAITING_FOR_CHECKPOINT',
      },
      quizAvailable: false,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })

    renderWorkspace()

    expect(await screen.findByText('Waiting for checkpoint')).toBeInTheDocument()
    expect(screen.getByText('Waiting for evaluator')).toBeInTheDocument()
    expect(screen.queryByText('Book your review session')).not.toBeInTheDocument()
    expect(screen.queryByText('Quiz locked')).not.toBeInTheDocument()
    await waitFor(() => expect(quizHookState.getLessonQuiz).not.toHaveBeenCalled())
  })

  it('renders locked lessons in the path without selecting them', async () => {
    const user = userEvent.setup()
    const lockedLesson: Lesson = {
      id: 102,
      programId: 1,
      name: 'Ordering coffee',
      lessonNumber: 2,
      content: 'Practice ordering.',
      status: 'PUBLISHED',
      lessonProgressStatus: 'LOCKED',
      locked: true,
    }
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })

    renderWorkspace([...lessons, lockedLesson])

    expect(await screen.findByText('Opening conversations')).toBeInTheDocument()
    expect(screen.getByText('Ordering coffee')).toBeInTheDocument()
    expect(screen.getByTestId('select-video-lesson-102')).toBeDisabled()

    await user.click(screen.getByTestId('select-video-lesson-102'))

    expect(mockLessonApi.getLessonVideoPlayback).toHaveBeenCalledWith(101)
    expect(mockLessonApi.getLessonVideoPlayback).not.toHaveBeenCalledWith(102)
    expect(mockLessonApi.getLessonLearningState).not.toHaveBeenCalledWith(102)
  })

  it('does not call lesson video APIs when every lesson is locked', async () => {
    renderWorkspace([
      {
        id: 102,
        programId: 1,
        name: 'Ordering coffee',
        lessonNumber: 2,
        content: 'Practice ordering.',
        status: 'PUBLISHED',
        lessonProgressStatus: 'LOCKED',
        locked: true,
      },
    ])

    expect(await screen.findByText('Lesson path locked')).toBeInTheDocument()
    expect(mockLessonApi.getLessonVideoPlayback).not.toHaveBeenCalled()
    expect(mockLessonApi.getLessonLearningState).not.toHaveBeenCalled()
  })

  it('blocks forward seeking beyond the furthest watched second', async () => {
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 15,
        furthestWatchedSecond: 30,
        watchedPercentage: 10,
        completed: false,
        lessonProgressStatus: 'VIDEO_IN_PROGRESS',
      },
      quizAvailable: false,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })

    const { container } = renderWorkspace()

    const video = await waitFor(() => {
      const element = container.querySelector('video')
      expect(element).toBeInTheDocument()
      return element as HTMLVideoElement
    })

    video.currentTime = 60
    fireEvent.seeking(video)

    expect(video.currentTime).toBe(30)
    expect(screen.getByText('You need to watch up to this point before seeking further ahead.')).toBeInTheDocument()

    fireEvent.pause(video)

    await waitFor(() =>
      expect(mockLessonApi.updateLessonVideoProgress).toHaveBeenCalledWith(101, {
        currentSecond: 30,
        furthestWatchedSecond: 30,
      })
    )
    expect(mockLessonApi.updateLessonVideoProgress).not.toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        currentSecond: 60,
      })
    )
  })

  it('allows free seeking after the lesson video is completed', async () => {
    mockLessonApi.getLessonVideoPlayback.mockResolvedValue({
      lessonId: 101,
      lessonVideoId: 501,
      playbackUrl: 'https://signed-playback.example.com/lesson-101/master.m3u8?token=abc',
      status: 'READY',
      durationSeconds: 300,
    })
    mockLessonApi.getLessonLearningState.mockResolvedValue({
      lessonId: 101,
      lessonStatus: 'PUBLISHED',
      videoStatus: 'READY',
      progress: {
        currentSecond: 270,
        furthestWatchedSecond: 270,
        watchedPercentage: 100,
        completed: true,
        lessonProgressStatus: 'COMPLETED',
      },
      quizAvailable: true,
      hasQuiz: true,
      enrollmentStatus: 'ACTIVE',
    })

    const { container } = renderWorkspace()

    const video = await waitFor(() => {
      const element = container.querySelector('video')
      expect(element).toBeInTheDocument()
      return element as HTMLVideoElement
    })

    video.currentTime = 295
    fireEvent.seeking(video)

    expect(video.currentTime).toBe(295)
    expect(screen.queryByText('You need to watch up to this point before seeking further ahead.')).not.toBeInTheDocument()
  })
})
