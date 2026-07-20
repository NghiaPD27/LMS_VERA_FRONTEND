import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, BookOpen, CheckCircle2, LockKeyhole, PlayCircle, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import { StudentQuizPanel } from './StudentQuizPanel'
import type { Lesson, VideoProgress } from '../../types/lesson'
import { useGetLessonVideoPlayback, useUpdateLessonVideoProgress } from '../../hooks/useLessons'
import { getFriendlyApiErrorMessage, isForbiddenError } from '../../utils/errorMessage'
import { formatLessonProgressStatus } from '../../utils/lessonProgress'

interface StudentLessonVideoWorkspaceProps {
  lessons: Lesson[]
}

export function StudentLessonVideoWorkspace({ lessons }: StudentLessonVideoWorkspaceProps) {
  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0)),
    [lessons]
  )
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(sortedLessons[0]?.id)

  useEffect(() => {
    if (!selectedLessonId && sortedLessons[0]?.id) {
      setSelectedLessonId(sortedLessons[0].id)
    }
  }, [selectedLessonId, sortedLessons])

  const selectedLesson = sortedLessons.find((lesson) => lesson.id === selectedLessonId) || sortedLessons[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="lms-surface h-fit overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-extrabold text-foreground">Lessons</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a lesson to watch the available video.</p>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto p-2">
          {sortedLessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`w-full rounded-md p-3 text-left transition-[background-color,border-color,color] ${
                lesson.id === selectedLesson?.id
                  ? 'bg-[hsl(var(--brand-orange-soft))] text-foreground'
                  : 'text-muted-foreground hover:bg-[hsl(var(--brand-green-soft))] hover:text-foreground'
              }`}
              onClick={() => setSelectedLessonId(lesson.id)}
              data-testid={`select-video-lesson-${lesson.id}`}
            >
              <p className="text-xs font-bold uppercase tracking-normal">Lesson {lesson.lessonNumber || '-'}</p>
              <p className="mt-1 font-extrabold">{lesson.name || 'Untitled lesson'}</p>
            </button>
          ))}
        </div>
      </aside>

      <LessonVideoPlayer lesson={selectedLesson} />
    </div>
  )
}

function LessonVideoPlayer({ lesson }: { lesson?: Lesson }) {
  const lessonId = lesson?.id
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const currentSecondRef = useRef(0)
  const furthestSecondRef = useRef(0)
  const suppressProgressUntilRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastProgress, setLastProgress] = useState<VideoProgress | null>(null)
  const [progressError, setProgressError] = useState<string | null>(null)

  const playbackQuery = useGetLessonVideoPlayback(lessonId)
  const progressMutation = useUpdateLessonVideoProgress()

  useEffect(() => {
    currentSecondRef.current = 0
    furthestSecondRef.current = 0
    setIsPlaying(false)
    setLastProgress(null)
    setProgressError(null)
  }, [lessonId])

  const reportProgress = useCallback(async () => {
    if (!lessonId || !playbackQuery.data?.playbackUrl || Date.now() < suppressProgressUntilRef.current || progressMutation.isPending) {
      return
    }

    const currentSecond = Math.max(0, Math.floor(currentSecondRef.current))
    const furthestWatchedSecond = Math.max(currentSecond, Math.floor(furthestSecondRef.current))

    try {
      setProgressError(null)
      const response = await progressMutation.mutateAsync({
        lessonId,
        data: {
          currentSecond,
          furthestWatchedSecond,
        },
      })
      setLastProgress(response)
    } catch (error) {
      suppressProgressUntilRef.current = Date.now() + 15000
      setProgressError(getFriendlyApiErrorMessage(error, 'Could not save video progress'))
    }
  }, [lessonId, playbackQuery.data?.playbackUrl, progressMutation])

  useEffect(() => {
    if (!isPlaying) return

    const intervalId = window.setInterval(() => {
      void reportProgress()
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [isPlaying, reportProgress])

  useEffect(() => {
    const flushProgress = () => {
      void reportProgress()
    }

    window.addEventListener('beforeunload', flushProgress)
    document.addEventListener('visibilitychange', flushProgress)

    return () => {
      flushProgress()
      window.removeEventListener('beforeunload', flushProgress)
      document.removeEventListener('visibilitychange', flushProgress)
    }
  }, [reportProgress])

  if (!lesson) {
    return (
      <div className="lms-surface flex min-h-80 items-center justify-center p-6 text-center">
        <div>
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--brand-green))]" />
          <p className="font-extrabold text-foreground">Select a lesson</p>
          <p className="mt-1 text-sm text-muted-foreground">Choose a lesson to load its video.</p>
        </div>
      </div>
    )
  }

  if (playbackQuery.isLoading) {
    return <LoadingState message="Loading video playback..." />
  }

  if (playbackQuery.isError) {
    if (isForbiddenError(playbackQuery.error)) {
      return (
        <VideoNotice
          icon={<LockKeyhole className="h-7 w-7" />}
          title="Video access locked"
          description="This lesson is locked, expired, or not available for your current enrollment."
          tone="danger"
          onRetry={() => void playbackQuery.refetch()}
        />
      )
    }

    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(playbackQuery.error, 'Video is not available yet')}
        onRetry={playbackQuery.refetch}
      />
    )
  }

  const playback = playbackQuery.data
  const videoReady = playback?.status === 'READY' && !!playback.playbackUrl
  const watchedPercentage = lastProgress?.watchedPercentage ?? 0
  const isQuizAvailable = lastProgress?.completed === true && lastProgress.lessonProgressStatus === 'QUIZ_AVAILABLE'

  if (!videoReady) {
    return (
      <VideoNotice
        icon={playback?.status === 'PROCESSING' ? <RefreshCw className="h-7 w-7 animate-spin" /> : <AlertTriangle className="h-7 w-7" />}
        title={playback?.status === 'PROCESSING' ? 'Video is processing' : 'Video is not available yet'}
        description="Vera will show the player here once this lesson video is ready."
        tone={playback?.status === 'PROCESSING' ? 'warning' : 'neutral'}
        onRetry={() => void playbackQuery.refetch()}
      />
    )
  }

  return (
    <article className="lms-surface overflow-hidden">
      <div className="border-b border-border bg-white p-5">
        <p className="text-sm font-bold text-[hsl(var(--brand-green))]">Lesson {lesson.lessonNumber || '-'}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-foreground">{lesson.name}</h2>
        {lesson.content && <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.content}</p>}
      </div>

      <div className="bg-slate-950">
        <video
          ref={videoRef}
          src={playback.playbackUrl}
          controls
          poster={playback.thumbnailUrl}
          className="aspect-video w-full bg-black"
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false)
            void reportProgress()
          }}
          onEnded={() => {
            setIsPlaying(false)
            const video = videoRef.current
            if (video) {
              currentSecondRef.current = video.currentTime
              furthestSecondRef.current = Math.max(furthestSecondRef.current, video.currentTime)
            }
            void reportProgress()
          }}
          onTimeUpdate={(event) => {
            const currentTime = event.currentTarget.currentTime
            currentSecondRef.current = currentTime
            furthestSecondRef.current = Math.max(furthestSecondRef.current, currentTime)
          }}
        />
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-foreground">Watched progress</span>
            <span className="font-extrabold text-primary">{watchedPercentage}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(watchedPercentage, 100)}%` }} />
          </div>
          {progressError && <p className="mt-2 text-sm text-red-700">{progressError}</p>}
          {lastProgress?.lessonProgressStatus && (
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {formatLessonProgressStatus(lastProgress.lessonProgressStatus)}
            </p>
          )}
        </div>
        <Button type="button" disabled={!isQuizAvailable} variant={isQuizAvailable ? 'default' : 'outline'}>
          {isQuizAvailable ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Quiz available
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Quiz locked
            </>
          )}
        </Button>
      </div>

      <StudentQuizPanel lessonId={lessonId} enabled={isQuizAvailable} />
    </article>
  )
}

function VideoNotice({
  icon,
  title,
  description,
  tone,
  onRetry,
}: {
  icon: ReactNode
  title: string
  description: string
  tone: 'neutral' | 'warning' | 'danger'
  onRetry?: () => void
}) {
  const toneClass = {
    neutral: 'bg-slate-50 text-slate-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  }[tone]

  return (
    <div className="lms-surface flex min-h-80 items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${toneClass}`}>
          {icon}
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {onRetry && (
          <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
