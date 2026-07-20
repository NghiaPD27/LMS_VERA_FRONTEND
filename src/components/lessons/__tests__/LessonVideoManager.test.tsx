import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LessonVideoManager } from '../LessonVideoManager'
import type { Lesson, LessonVideo } from '../../../types/lesson'

const hookState = vi.hoisted(() => ({
  lessonVideoQuery: {
    data: undefined as LessonVideo | undefined,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  createSession: vi.fn(),
  syncVideo: vi.fn(),
  upsertVideo: vi.fn(),
}))

vi.mock('../../../hooks/useLessons', () => ({
  useCreateLessonVideoUploadSession: () => ({
    mutateAsync: hookState.createSession,
    isPending: false,
  }),
  useGetLessonVideo: () => hookState.lessonVideoQuery,
  useSyncLessonVideo: () => ({
    mutateAsync: hookState.syncVideo,
    isPending: false,
  }),
  useUpsertLessonVideo: () => ({
    mutateAsync: hookState.upsertVideo,
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

const currentVideo: LessonVideo = {
  id: 501,
  lessonId: 101,
  bunnyVideoId: 'video-old',
  libraryId: 'library-1',
  durationSeconds: 125,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  status: 'READY',
  createdAt: '2026-07-20T08:00:00Z',
  updatedAt: '2026-07-20T08:05:00Z',
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

const renderManager = () =>
  render(<LessonVideoManager lesson={lesson} programId={1} isOpen onClose={vi.fn()} />)

describe('LessonVideoManager', () => {
  beforeEach(() => {
    hookState.lessonVideoQuery.data = currentVideo
    hookState.lessonVideoQuery.isLoading = false
    hookState.lessonVideoQuery.isError = false
    hookState.lessonVideoQuery.error = null
    hookState.lessonVideoQuery.refetch.mockReset()
    hookState.createSession.mockReset()
    hookState.syncVideo.mockReset()
    hookState.upsertVideo.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders current lesson video metadata from GET video state', async () => {
    renderManager()

    expect(await screen.findByText('Current video')).toBeInTheDocument()
    expect(screen.getByText('video-old')).toBeInTheDocument()
    expect(screen.getByText('library-1')).toBeInTheDocument()
    expect(screen.getByText('2m 5s')).toBeInTheDocument()
    expect(screen.getAllByText('READY').length).toBeGreaterThan(0)
  })

  it('renders no video state when GET video returns 404', async () => {
    hookState.lessonVideoQuery.data = undefined
    hookState.lessonVideoQuery.isError = true
    hookState.lessonVideoQuery.error = createAxiosError(404)

    renderManager()

    expect(await screen.findByText('No video yet')).toBeInTheDocument()
    expect(screen.getByText('This lesson does not have a video attached. Upload a file or save existing video metadata below.')).toBeInTheDocument()
  })

  it('syncs video status manually and updates current video metadata', async () => {
    const user = userEvent.setup()
    hookState.syncVideo.mockResolvedValue({
      ...currentVideo,
      bunnyVideoId: 'video-new',
      status: 'PROCESSING',
    })

    renderManager()

    await user.click(screen.getByRole('button', { name: /sync status/i }))

    await waitFor(() => expect(hookState.syncVideo).toHaveBeenCalledWith(101))
    expect(await screen.findByText('video-new')).toBeInTheDocument()
    expect(screen.getAllByText('PROCESSING').length).toBeGreaterThan(0)
  })
})
