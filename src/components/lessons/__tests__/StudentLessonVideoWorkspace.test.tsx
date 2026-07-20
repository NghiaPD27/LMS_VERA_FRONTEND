import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { AxiosError } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { lessonApi } from '../../../api/lessonApi'
import { StudentLessonVideoWorkspace } from '../StudentLessonVideoWorkspace'
import type { Lesson } from '../../../types/lesson'

const hlsMock = vi.hoisted(() => ({
  loadSource: vi.fn(),
  attachMedia: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  isSupported: vi.fn(() => true),
}))

vi.mock('../../../api/lessonApi', () => ({
  lessonApi: {
    getLessonVideoPlayback: vi.fn(),
    updateLessonVideoProgress: vi.fn(),
  },
}))

vi.mock('hls.js', () => {
  class MockHls {
    static Events = { ERROR: 'hlsError' }
    static isSupported = hlsMock.isSupported
    loadSource = hlsMock.loadSource
    attachMedia = hlsMock.attachMedia
    destroy = hlsMock.destroy
    on = hlsMock.on
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
  },
]

const renderWorkspace = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <StudentLessonVideoWorkspace lessons={lessons} />
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
  afterEach(() => {
    vi.clearAllMocks()
    hlsMock.isSupported.mockReturnValue(true)
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
})
