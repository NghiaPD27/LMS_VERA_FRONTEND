import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import Hls from 'hls.js'
import { AlertTriangle, BookOpen, CalendarClock, CheckCircle2, ImageIcon, LockKeyhole, PlayCircle, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import { StudentQuizPanel } from './StudentQuizPanel'
import type { LearningState, Lesson, VideoProgress, VideoProgressSnapshot } from '../../types/lesson'
import { useGetLessonLearningState, useGetLessonVideoPlayback, useUpdateLessonVideoProgress } from '../../hooks/useLessons'
import { getFriendlyApiErrorMessage, isForbiddenError, isNotFoundError } from '../../utils/errorMessage'
import { formatLessonProgressStatus } from '../../utils/lessonProgress'

interface StudentLessonVideoWorkspaceProps {
  lessons: Lesson[]
}

export function StudentLessonVideoWorkspace({ lessons }: StudentLessonVideoWorkspaceProps) {
  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0)),
    [lessons]
  )
  const firstUnlockedLessonId = sortedLessons.find((lesson) => !isLessonLocked(lesson))?.id
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(firstUnlockedLessonId)

  useEffect(() => {
    const selectedLessonIsPlayable = sortedLessons.some(
      (lesson) => lesson.id === selectedLessonId && !isLessonLocked(lesson)
    )

    if (!selectedLessonIsPlayable) {
      setSelectedLessonId(firstUnlockedLessonId)
    }
  }, [firstUnlockedLessonId, selectedLessonId, sortedLessons])

  const selectedLesson = sortedLessons.find((lesson) => lesson.id === selectedLessonId && !isLessonLocked(lesson))
  const allLessonsLocked = sortedLessons.length > 0 && !firstUnlockedLessonId

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="lms-surface h-fit overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-extrabold text-foreground">Lessons</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a lesson to watch the available video.</p>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto p-2">
          {sortedLessons.map((lesson) => (
            <LessonRailItem
              key={lesson.id}
              lesson={lesson}
              active={!isLessonLocked(lesson) && lesson.id === selectedLesson?.id}
              onSelect={() => {
                if (!isLessonLocked(lesson)) {
                  setSelectedLessonId(lesson.id)
                }
              }}
            />
          ))}
        </div>
      </aside>

      {allLessonsLocked ? <LockedLessonPathNotice /> : <LessonVideoPlayer lesson={selectedLesson} />}
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

  const learningStateQuery = useGetLessonLearningState(lessonId)
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

  if (learningStateQuery.isError && isForbiddenError(learningStateQuery.error)) {
    return (
      <VideoNotice
        icon={<LockKeyhole className="h-7 w-7" />}
        title="Lesson access locked"
        description="You do not have access to this lesson, the course may be expired, locked, or not available yet."
        tone="danger"
        onRetry={() => void learningStateQuery.refetch()}
      />
    )
  }

  if (playbackQuery.isError) {
    if (isForbiddenError(playbackQuery.error)) {
      return (
        <VideoNotice
          icon={<LockKeyhole className="h-7 w-7" />}
          title="Video access locked"
          description="You do not have access to this lesson, the course may be expired, locked, or the video is not ready."
          tone="danger"
          onRetry={() => void playbackQuery.refetch()}
        />
      )
    }

    if (isNotFoundError(playbackQuery.error)) {
      return (
        <VideoNotice
          icon={<AlertTriangle className="h-7 w-7" />}
          title="Video was not found"
          description="Video was not found for this lesson."
          tone="neutral"
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
  const learningState = learningStateQuery.data
  const playbackUrl = playback?.playbackUrl
  const videoReady = playback?.status === 'READY' && typeof playbackUrl === 'string' && playbackUrl.length > 0
  const progress = getCurrentProgress(learningState, lastProgress)
  const watchedPercentage = progress?.watchedPercentage ?? 0
  const isQuizAvailable = isQuizUnlockedByBackend(learningState, progress)

  if (!videoReady || !playbackUrl) {
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

      <LessonVideoElement
        playbackUrl={playbackUrl}
        thumbnailUrl={playback.thumbnailUrl}
        videoRef={videoRef}
        onPlaying={() => setIsPlaying(true)}
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
        onTimeUpdate={(currentTime) => {
          currentSecondRef.current = currentTime
          furthestSecondRef.current = Math.max(furthestSecondRef.current, currentTime)
        }}
      />

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
          {progress?.lessonProgressStatus && (
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {formatLessonProgressStatus(progress.lessonProgressStatus)}
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

      <LearningStatePanel
        learningState={learningState}
        playbackStatus={playback.status}
        progress={progress}
        isLoading={learningStateQuery.isLoading}
        isQuizAvailable={isQuizAvailable}
      />

      <StudentQuizPanel lessonId={lessonId} enabled={isQuizAvailable} />
    </article>
  )
}

function LessonRailItem({
  lesson,
  active,
  onSelect,
}: {
  lesson: Lesson
  active: boolean
  onSelect: () => void
}) {
  const locked = isLessonLocked(lesson)

  return (
    <button
      type="button"
      disabled={locked}
      className={`w-full rounded-lg border p-3 text-left transition-[background-color,border-color,color,transform] ${
        locked
          ? 'cursor-not-allowed border-transparent bg-slate-50 text-muted-foreground opacity-85'
          : active
          ? 'border-[hsl(var(--brand-orange))]/30 bg-[hsl(var(--brand-orange-soft))] text-foreground shadow-sm'
          : 'border-transparent text-muted-foreground hover:border-[hsl(var(--brand-green))]/20 hover:bg-[hsl(var(--brand-green-soft))] hover:text-foreground'
      }`}
      onClick={onSelect}
      data-testid={`select-video-lesson-${lesson.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal">Lesson {lesson.lessonNumber || '-'}</p>
          <p className="mt-1 font-extrabold leading-5">{lesson.name || 'Untitled lesson'}</p>
        </div>
        <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${
          locked
            ? 'bg-white text-slate-500'
            : active
              ? 'bg-white text-primary'
              : 'bg-white text-[hsl(var(--brand-green))]'
        }`}>
          {locked && <LockKeyhole className="h-3 w-3" />}
          {locked ? 'Locked' : formatLessonProgressStatus(lesson.lessonProgressStatus || lesson.status)}
        </span>
      </div>
    </button>
  )
}

function LockedLessonPathNotice() {
  return (
    <VideoNotice
      icon={<LockKeyhole className="h-7 w-7" />}
      title="Lesson path locked"
      description="These lessons are visible in your course path, but none are unlocked for video access yet."
      tone="neutral"
    />
  )
}

function isLessonLocked(lesson?: Lesson) {
  return lesson?.locked === true || lesson?.lessonProgressStatus === 'LOCKED'
}

function LearningStatePanel({
  learningState,
  playbackStatus,
  progress,
  isLoading,
  isQuizAvailable,
}: {
  learningState?: LearningState
  playbackStatus?: string
  progress?: VideoProgress | VideoProgressSnapshot
  isLoading: boolean
  isQuizAvailable: boolean
}) {
  return (
    <section className="border-t border-border bg-[hsl(var(--brand-green-soft))]/55 p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LearningStateCard
          label="Video"
          value={isLoading ? 'Checking...' : formatLearningValue(learningState?.videoStatus || playbackStatus)}
          tone={learningState?.videoStatus === 'READY' || playbackStatus === 'READY' ? 'success' : 'neutral'}
        />
        <LearningStateCard
          label="Progress"
          value={`${progress?.watchedPercentage ?? 0}% watched`}
          tone={progress?.completed ? 'success' : 'neutral'}
        />
        <LearningStateCard
          label="Quiz"
          value={isQuizAvailable ? 'Available' : learningState?.hasQuiz === false ? 'Not added yet' : 'Locked'}
          tone={isQuizAvailable ? 'success' : 'warning'}
        />
        <LearningStateCard
          label="Enrollment"
          value={learningState?.expiredAt ? `Until ${formatCompactDate(learningState.expiredAt)}` : formatLearningValue(learningState?.enrollmentStatus)}
          tone={learningState?.enrollmentStatus === 'ACTIVE' ? 'success' : 'neutral'}
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>
    </section>
  )
}

function LearningStateCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone: 'neutral' | 'success' | 'warning'
  icon?: ReactNode
}) {
  const toneClass = {
    neutral: 'border-border bg-white text-muted-foreground',
    success: 'border-emerald-200 bg-white text-emerald-700',
    warning: 'border-amber-200 bg-white text-amber-700',
  }[tone]

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-normal">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-extrabold text-foreground">{value}</p>
    </div>
  )
}

function getCurrentProgress(learningState?: LearningState, lastProgress?: VideoProgress | null) {
  return lastProgress || learningState?.progress
}

function isQuizUnlockedByBackend(
  learningState?: LearningState,
  progress?: VideoProgress | VideoProgressSnapshot
) {
  const progressStatus = progress?.lessonProgressStatus

  return (
    learningState?.quizAvailable === true ||
    progressStatus === 'QUIZ_AVAILABLE' ||
    progressStatus === 'WAITING_FOR_TEACHER' ||
    progressStatus === 'COMPLETED'
  )
}

function formatLearningValue(value?: string) {
  if (!value) return 'Not started'
  return formatLessonProgressStatus(value)
}

function formatCompactDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function LessonVideoElement({
  playbackUrl,
  thumbnailUrl,
  videoRef,
  onPlaying,
  onPause,
  onEnded,
  onTimeUpdate,
}: {
  playbackUrl: string
  thumbnailUrl?: string | undefined
  videoRef: RefObject<HTMLVideoElement | null>
  onPlaying: () => void
  onPause: () => void
  onEnded: () => void
  onTimeUpdate: (currentTime: number) => void
}) {
  const [videoError, setVideoError] = useState<string | null>(null)
  const [playerState, setPlayerState] = useState<'loading' | 'ready' | 'buffering' | 'playing'>('loading')
  const [hasVideoFrame, setHasVideoFrame] = useState(false)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const loggedFirstFrameRef = useRef(false)
  const hlsRef = useRef<Hls | null>(null)
  const normalizedPlaybackUrl = useMemo(() => normalizePlaybackUrl(playbackUrl), [playbackUrl])
  const normalizedThumbnailUrl = useMemo(
    () => (thumbnailUrl ? normalizePlaybackUrl(thumbnailUrl) : undefined),
    [thumbnailUrl]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setVideoError(null)
    setPlayerState('loading')
    setHasVideoFrame(false)
    setThumbnailFailed(false)
    loggedFirstFrameRef.current = false
    video.removeAttribute('src')
    safeResetVideoElement(video)
    video.preload = 'metadata'
    logVideoDiagnostic('init', {
      rawPlaybackUrl: getSafeUrlForLog(playbackUrl),
      normalizedPlaybackUrl: getSafeUrlForLog(normalizedPlaybackUrl),
      rawThumbnailUrl: thumbnailUrl ? getSafeUrlForLog(thumbnailUrl) : null,
      normalizedThumbnailUrl: normalizedThumbnailUrl ? getSafeUrlForLog(normalizedThumbnailUrl) : null,
      hlsSupported: Hls.isSupported(),
      nativeHlsSupport: video.canPlayType('application/vnd.apple.mpegurl') || 'not-supported',
      video: getVideoDebugState(video),
    })
    if (playbackUrl !== normalizedPlaybackUrl) {
      logVideoDiagnostic('playback url repaired', {
        from: getSafeUrlForLog(playbackUrl),
        to: getSafeUrlForLog(normalizedPlaybackUrl),
      })
    }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      let recoveredNetworkError = false
      let recoveredMediaError = false
      let sourceLoaded = false
      const markReady = () => setPlayerState((current) => (current === 'playing' ? current : 'ready'))
      const loadSourceOnce = () => {
        if (sourceLoaded) return
        sourceLoaded = true
        // Playback URL must come from the backend permission-checked response. Never construct Bunny URLs here.
        logVideoDiagnostic('hls.loadSource', { playbackUrl: getSafeUrlForLog(normalizedPlaybackUrl) })
        hls.loadSource(normalizedPlaybackUrl)
      }
      const readyFallbackId = window.setTimeout(() => {
        logVideoDiagnostic('ready fallback timeout', { video: getVideoDebugState(video) })
        markReady()
      }, 3500)

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        logVideoDiagnostic('hls.MEDIA_ATTACHED', { video: getVideoDebugState(video) })
        loadSourceOnce()
      })
      hls.on(Hls.Events.MANIFEST_LOADED, (_event, data) => {
        logVideoDiagnostic('hls.MANIFEST_LOADED', data)
        markReady()
      })
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        logVideoDiagnostic('hls.MANIFEST_PARSED', data)
        markReady()
      })
      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        logVideoDiagnostic('hls.LEVEL_LOADED', data)
        markReady()
      })
      hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
        logVideoDiagnostic('hls.FRAG_LOADED', {
          fragUrl: getSafeUrlForLog(data.frag?.url),
          sn: data.frag?.sn,
          level: data.frag?.level,
        })
      })
      hls.attachMedia(video)
      window.setTimeout(loadSourceOnce, 0)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        logVideoDiagnostic(data.fatal ? 'hls.ERROR fatal' : 'hls.ERROR non-fatal', data)
        if (!data.fatal) return

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !recoveredNetworkError) {
          recoveredNetworkError = true
          logVideoDiagnostic('hls.recover network', data)
          hls.startLoad()
          return
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredMediaError) {
          recoveredMediaError = true
          logVideoDiagnostic('hls.recover media', data)
          hls.recoverMediaError()
          return
        }

        console.error('[LessonVideoPlayer] HLS playback error', data)
        setVideoError(getHlsErrorMessage(data))
      })

      return () => {
        logVideoDiagnostic('destroy hls player', { video: getVideoDebugState(video) })
        window.clearTimeout(readyFallbackId)
        if (hlsRef.current === hls) {
          hlsRef.current = null
        }
        hls.destroy()
        video.removeAttribute('src')
        safeResetVideoElement(video)
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari can play HLS natively, using the same backend playbackUrl.
      logVideoDiagnostic('native hls src assigned', { playbackUrl: getSafeUrlForLog(normalizedPlaybackUrl) })
      video.src = normalizedPlaybackUrl
      setPlayerState('ready')
      return () => {
        logVideoDiagnostic('cleanup native hls player', { video: getVideoDebugState(video) })
        video.removeAttribute('src')
        safeResetVideoElement(video)
      }
    }

    logVideoDiagnostic('unsupported browser', { video: getVideoDebugState(video) })
    setVideoError('This browser cannot play this video format.')
  }, [normalizedPlaybackUrl, normalizedThumbnailUrl, playbackUrl, thumbnailUrl, videoRef])

  const handlePlayClick = async () => {
    const video = videoRef.current
    if (!video) return

    repairMalformedVideoSource(video, normalizedPlaybackUrl, hlsRef.current)
    logVideoDiagnostic('play click', { video: getVideoDebugState(video) })
    try {
      await video.play()
      logVideoDiagnostic('video.play resolved', { video: getVideoDebugState(video) })
    } catch (error) {
      console.error('[LessonVideoPlayer] Browser blocked or failed video.play()', error, getVideoDebugState(video))
      setVideoError('Could not start video playback. Try clicking the video controls once more.')
    }
  }

  return (
    <div className="bg-slate-950">
      {videoError && (
        <div className="border-b border-red-900/40 bg-red-950 px-5 py-3 text-sm font-bold text-red-100">
          {videoError}
        </div>
      )}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {normalizedThumbnailUrl && !thumbnailFailed ? (
          <img
            src={normalizedThumbnailUrl}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
              hasVideoFrame ? 'opacity-0' : 'opacity-70'
            }`}
            onError={() => {
              logVideoDiagnostic('thumbnail error', { thumbnailUrl: getSafeUrlForLog(normalizedThumbnailUrl) })
              setThumbnailFailed(true)
            }}
          />
        ) : (
          <div
            className={`absolute inset-0 grid place-items-center bg-[hsl(var(--brand-green-soft))] transition-opacity ${
              hasVideoFrame ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="text-center text-slate-800">
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--brand-green))]" />
              <p className="text-sm font-extrabold">Lesson video</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">Thumbnail will appear when available</p>
            </div>
          </div>
        )}

        {playerState !== 'playing' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <button
              type="button"
              className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-[hsl(var(--brand-green))] shadow-xl transition hover:scale-105"
              onClick={() => void handlePlayClick()}
              aria-label="Play lesson video"
            >
              {playerState === 'buffering' ? <RefreshCw className="h-7 w-7 animate-spin" /> : <PlayCircle className="h-8 w-8" />}
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          poster={normalizedThumbnailUrl}
          className={`relative z-10 aspect-video w-full bg-transparent transition-opacity ${
            hasVideoFrame || playerState === 'playing' ? 'opacity-100' : 'opacity-0'
          }`}
          data-testid="lesson-video-player"
          onLoadStart={(event) => logVideoDiagnostic('video.loadstart', { video: getVideoDebugState(event.currentTarget) })}
          onLoadedMetadata={(event) => logVideoDiagnostic('video.loadedmetadata', { video: getVideoDebugState(event.currentTarget) })}
          onLoadedData={(event) => {
            logVideoDiagnostic('video.loadeddata', { video: getVideoDebugState(event.currentTarget) })
            setHasVideoFrame(true)
          }}
          onPlaying={() => {
            logVideoDiagnostic('video.playing', { video: getVideoDebugState(videoRef.current) })
            setPlayerState('playing')
            onPlaying()
          }}
          onWaiting={(event) => {
            logVideoDiagnostic('video.waiting', { video: getVideoDebugState(event.currentTarget) })
            setPlayerState('buffering')
          }}
          onCanPlay={(event) => {
            logVideoDiagnostic('video.canplay', { video: getVideoDebugState(event.currentTarget) })
            setPlayerState((current) => (current === 'playing' ? current : 'ready'))
          }}
          onCanPlayThrough={(event) => logVideoDiagnostic('video.canplaythrough', { video: getVideoDebugState(event.currentTarget) })}
          onStalled={(event) => logVideoDiagnostic('video.stalled', { video: getVideoDebugState(event.currentTarget) })}
          onSuspend={(event) => logVideoDiagnostic('video.suspend', { video: getVideoDebugState(event.currentTarget) })}
          onError={(event) => {
            console.error('[LessonVideoPlayer] HTML video error', getMediaErrorDebug(event.currentTarget.error), getVideoDebugState(event.currentTarget))
            setVideoError(getHtmlVideoErrorMessage(event.currentTarget.error))
          }}
          onPause={(event) => {
            logVideoDiagnostic('video.pause', { video: getVideoDebugState(event.currentTarget) })
            onPause()
          }}
          onEnded={(event) => {
            logVideoDiagnostic('video.ended', { video: getVideoDebugState(event.currentTarget) })
            onEnded()
          }}
          onTimeUpdate={(event) => {
            if (event.currentTarget.currentTime > 0) {
              setHasVideoFrame(true)
              if (!loggedFirstFrameRef.current) {
                loggedFirstFrameRef.current = true
                logVideoDiagnostic('video.first-timeupdate', { video: getVideoDebugState(event.currentTarget) })
              }
            }
            onTimeUpdate(event.currentTarget.currentTime)
          }}
        />
      </div>
      {playerState !== 'playing' && (
        <div className="border-t border-white/10 px-5 py-2 text-xs font-bold text-slate-300">
          {playerState === 'loading' && 'Preparing video stream. You can press play now.'}
          {playerState === 'ready' && 'Video is ready. Press play to start.'}
          {playerState === 'buffering' && 'Buffering video...'}
        </div>
      )}
    </div>
  )
}

function logVideoDiagnostic(eventName: string, payload?: unknown) {
  console.info('[LessonVideoPlayer]', eventName, sanitizeVideoLogValue(payload))
}

function repairMalformedVideoSource(video: HTMLVideoElement, normalizedPlaybackUrl: string, hls: Hls | null) {
  const rawSrc = video.getAttribute('src')
  const currentSrc = video.currentSrc
  const repairedRawSrc = rawSrc ? normalizePlaybackUrl(rawSrc) : rawSrc
  const repairedCurrentSrc = currentSrc ? normalizePlaybackUrl(currentSrc) : currentSrc
  const hasMalformedSource = (rawSrc && repairedRawSrc !== rawSrc) || (currentSrc && repairedCurrentSrc !== currentSrc)

  if (!hasMalformedSource) return

  logVideoDiagnostic('repairing malformed video src before play', {
    rawSrc: getSafeUrlForLog(rawSrc),
    repairedRawSrc: getSafeUrlForLog(repairedRawSrc),
    currentSrc: getSafeUrlForLog(currentSrc),
    repairedCurrentSrc: getSafeUrlForLog(repairedCurrentSrc),
    normalizedPlaybackUrl: getSafeUrlForLog(normalizedPlaybackUrl),
  })

  if (hls) {
    hls.stopLoad()
    hls.detachMedia()
    video.removeAttribute('src')
    safeResetVideoElement(video)
    hls.loadSource(normalizedPlaybackUrl)
    hls.attachMedia(video)
    hls.startLoad(-1)
    return
  }

  video.src = normalizedPlaybackUrl
  safeResetVideoElement(video)
}

function safeResetVideoElement(video: HTMLVideoElement) {
  if (typeof window !== 'undefined' && /jsdom/i.test(window.navigator.userAgent)) {
    return
  }

  try {
    video.load()
  } catch (error) {
    logVideoDiagnostic('video.load reset failed', error)
  }
}

function normalizePlaybackUrl(url: string) {
  let normalizedUrl = url.trim()
  const bunnyCdnHostSuffix = `${['b', 'cdn'].join('-')}.net`
  const mediaDeliveryHost = `iframe.${['media', 'delivery'].join('')}.net`

  normalizedUrl = normalizedUrl.replace(/https\/\//gi, 'https://').replace(/http\/\//gi, 'http://')

  const extractKnownStreamUrl = (candidateUrl: string) => {
    const knownHostPatterns = [
      new RegExp(`(?:[a-z0-9-]+\\.)?${escapeRegExp(bunnyCdnHostSuffix)}`, 'i'),
      new RegExp(escapeRegExp(mediaDeliveryHost), 'i'),
    ]

    for (const hostPattern of knownHostPatterns) {
      const match = hostPattern.exec(candidateUrl)
      if (!match || match.index === undefined) continue

      const protocolStart = candidateUrl.slice(0, match.index).lastIndexOf('://')
      if (protocolStart >= 0) {
        const protocolNameStart = Math.max(candidateUrl.lastIndexOf('http', protocolStart), 0)
        return candidateUrl.slice(protocolNameStart)
      }

      return `https://${candidateUrl.slice(match.index)}`
    }

    return candidateUrl
  }

  normalizedUrl = extractKnownStreamUrl(normalizedUrl)

  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin !== 'null' ? window.location.origin : undefined

  if (currentOrigin) {
    const duplicateOriginPrefixes = [
      `${currentOrigin}https://`,
      `${currentOrigin}http://`,
      `${currentOrigin}https//`,
      `${currentOrigin}http//`,
      `${currentOrigin}/https://`,
      `${currentOrigin}/http://`,
      `${currentOrigin}/https//`,
      `${currentOrigin}/http//`,
    ]

    const duplicatePrefix = duplicateOriginPrefixes.find((prefix) => normalizedUrl.startsWith(prefix))
    if (duplicatePrefix) {
      normalizedUrl = normalizedUrl.slice(currentOrigin.length)
      if (normalizedUrl.startsWith('/')) {
        normalizedUrl = normalizedUrl.slice(1)
      }
      normalizedUrl = normalizedUrl.replace(/https\/\//gi, 'https://').replace(/http\/\//gi, 'http://')
    }
  }

  const protocolMatches = [...normalizedUrl.matchAll(/https?:\/\//gi)]
  if (protocolMatches.length > 1) {
    normalizedUrl = normalizedUrl.slice(protocolMatches[protocolMatches.length - 1].index)
  }

  const malformedProtocolMatches = [...normalizedUrl.matchAll(/https?\/\//gi)]
  if (!/^https?:\/\//i.test(normalizedUrl) && malformedProtocolMatches.length > 0) {
    normalizedUrl = normalizedUrl.slice(malformedProtocolMatches[malformedProtocolMatches.length - 1].index)
    normalizedUrl = normalizedUrl.replace(/https\/\//gi, 'https://').replace(/http\/\//gi, 'http://')
  }

  return normalizedUrl
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sanitizeVideoLogValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value

  if (typeof value === 'string') {
    return value.startsWith('http') ? getSafeUrlForLog(value) : value
  }

  if (typeof value !== 'object') return value
  if (seen.has(value)) return '[Circular]'
  if (depth > 3) return '[Object]'

  seen.add(value)

  if (Array.isArray(value)) {
    return value.slice(0, 8).map((item) => sanitizeVideoLogValue(item, depth + 1, seen))
  }

  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('url') && typeof item === 'string') {
      result[key] = getSafeUrlForLog(item)
    } else {
      result[key] = sanitizeVideoLogValue(item, depth + 1, seen)
    }
  }

  return result
}

function getSafeUrlForLog(url?: string | null) {
  if (!url) return url

  try {
    const parsedUrl = new URL(url)
    return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search ? '?[redacted]' : ''}`
  } catch {
    return url
  }
}

function getVideoDebugState(video: HTMLVideoElement | null) {
  if (!video) return null

  return {
    readyState: `${video.readyState} (${getVideoReadyStateLabel(video.readyState)})`,
    networkState: `${video.networkState} (${getVideoNetworkStateLabel(video.networkState)})`,
    paused: video.paused,
    ended: video.ended,
    seeking: video.seeking,
    currentTime: Number.isFinite(video.currentTime) ? Number(video.currentTime.toFixed(2)) : null,
    duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
    currentSrc: getSafeUrlForLog(video.currentSrc),
    src: getSafeUrlForLog(video.getAttribute('src')),
    buffered: getTimeRangesForLog(video.buffered),
  }
}

function getTimeRangesForLog(ranges: TimeRanges) {
  const result: Array<{ start: number; end: number }> = []

  for (let index = 0; index < ranges.length; index += 1) {
    result.push({
      start: Number(ranges.start(index).toFixed(2)),
      end: Number(ranges.end(index).toFixed(2)),
    })
  }

  return result
}

function getVideoReadyStateLabel(value: number) {
  if (value === HTMLMediaElement.HAVE_NOTHING) return 'HAVE_NOTHING'
  if (value === HTMLMediaElement.HAVE_METADATA) return 'HAVE_METADATA'
  if (value === HTMLMediaElement.HAVE_CURRENT_DATA) return 'HAVE_CURRENT_DATA'
  if (value === HTMLMediaElement.HAVE_FUTURE_DATA) return 'HAVE_FUTURE_DATA'
  if (value === HTMLMediaElement.HAVE_ENOUGH_DATA) return 'HAVE_ENOUGH_DATA'
  return 'UNKNOWN'
}

function getVideoNetworkStateLabel(value: number) {
  if (value === HTMLMediaElement.NETWORK_EMPTY) return 'NETWORK_EMPTY'
  if (value === HTMLMediaElement.NETWORK_IDLE) return 'NETWORK_IDLE'
  if (value === HTMLMediaElement.NETWORK_LOADING) return 'NETWORK_LOADING'
  if (value === HTMLMediaElement.NETWORK_NO_SOURCE) return 'NETWORK_NO_SOURCE'
  return 'UNKNOWN'
}

function getMediaErrorDebug(error: MediaError | null) {
  if (!error) return null

  return {
    code: error.code,
    label: getMediaErrorLabel(error.code),
    message: error.message,
  }
}

function getMediaErrorLabel(code: number) {
  if (code === MediaError.MEDIA_ERR_ABORTED) return 'MEDIA_ERR_ABORTED'
  if (code === MediaError.MEDIA_ERR_NETWORK) return 'MEDIA_ERR_NETWORK'
  if (code === MediaError.MEDIA_ERR_DECODE) return 'MEDIA_ERR_DECODE'
  if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) return 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  return 'UNKNOWN'
}

function getHtmlVideoErrorMessage(error: MediaError | null) {
  if (!error) return 'Video playback failed.'

  if (error.code === MediaError.MEDIA_ERR_NETWORK) {
    return 'Video stream could not be downloaded.'
  }

  if (error.code === MediaError.MEDIA_ERR_DECODE) {
    return 'This video stream could not be decoded by the browser.'
  }

  if (error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
    return 'This video stream format is not supported by the browser.'
  }

  return 'Video playback failed.'
}

function getHlsErrorMessage(data: { type?: string; details?: string; response?: { code?: number } }) {
  const statusCode = data.response?.code
  const detail = data.details ? ` (${data.details})` : ''

  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
    return statusCode
      ? `Video stream request failed with status ${statusCode}${detail}.`
      : `Video stream could not be loaded${detail}.`
  }

  if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
    return `This video stream could not be decoded${detail}.`
  }

  return `Video playback failed${detail}.`
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
