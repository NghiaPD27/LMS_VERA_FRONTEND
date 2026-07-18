import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Upload } from 'tus-js-client'
import { AlertTriangle, CheckCircle2, CloudUpload, FileVideo, RefreshCw, Settings2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '../common/Button'
import type { Lesson, LessonVideo, UpsertLessonVideoRequest } from '../../types/lesson'
import {
  useCreateLessonVideoUploadSession,
  useSyncLessonVideo,
  useUpsertLessonVideo
} from '../../hooks/useLessons'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'

interface LessonVideoManagerProps {
  lesson: Lesson | null
  programId: number
  isOpen: boolean
  onClose: () => void
}

type UploadStage = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'

const getStatusStage = (status?: string): UploadStage => {
  const normalized = status?.toUpperCase()
  if (normalized === 'READY') return 'ready'
  if (normalized === 'FAILED') return 'failed'
  if (normalized === 'PROCESSING') return 'processing'
  return 'idle'
}

export function LessonVideoManager({ lesson, programId, isOpen, onClose }: LessonVideoManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentVideo, setCurrentVideo] = useState<LessonVideo | null>(null)
  const [stage, setStage] = useState<UploadStage>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualValues, setManualValues] = useState<UpsertLessonVideoRequest>({
    bunnyVideoId: '',
    libraryId: '',
    durationSeconds: undefined,
    thumbnailUrl: '',
    status: 'READY',
  })

  const uploadRef = useRef<Upload | null>(null)
  const pollTimerRef = useRef<number | null>(null)
  const createSessionMutation = useCreateLessonVideoUploadSession()
  const syncVideoMutation = useSyncLessonVideo(programId)
  const upsertVideoMutation = useUpsertLessonVideo(programId)

  const lessonId = lesson?.id
  const isBusy =
    stage === 'uploading' ||
    stage === 'processing' ||
    createSessionMutation.isPending ||
    syncVideoMutation.isPending ||
    upsertVideoMutation.isPending

  useEffect(() => {
    if (!isOpen) {
      clearPolling()
      uploadRef.current?.abort()
      uploadRef.current = null
      setSelectedFile(null)
      setUploadProgress(0)
      setCurrentVideo(null)
      setStage('idle')
      setErrorMessage(null)
    }

    return () => {
      clearPolling()
      uploadRef.current?.abort()
    }
  }, [isOpen])

  const clearPolling = () => {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setUploadProgress(0)
    setErrorMessage(null)
  }

  const handleUpload = async () => {
    if (!lessonId || !selectedFile) return

    try {
      setErrorMessage(null)
      setUploadProgress(0)

      const session = await createSessionMutation.mutateAsync({
        lessonId,
        data: {
          title: lesson?.name || selectedFile.name,
          fileType: selectedFile.type || 'video/mp4',
        },
      })

      if (!session.tusUploadUrl || !session.authorizationSignature || !session.authorizationExpire || !session.libraryId || !session.videoId) {
        throw new Error('Upload session is missing required upload credentials.')
      }

      setStage('uploading')

      await new Promise<void>((resolve, reject) => {
        const upload = new Upload(selectedFile, {
          endpoint: session.tusUploadUrl,
          headers: {
            AuthorizationSignature: session.authorizationSignature || '',
            AuthorizationExpire: String(session.authorizationExpire || ''),
            LibraryId: session.libraryId || '',
            VideoId: session.videoId || '',
          },
          metadata: {
            filetype: session.fileType || selectedFile.type || 'video/mp4',
            title: session.title || lesson?.name || selectedFile.name,
          },
          onError: reject,
          onProgress: (bytesUploaded, bytesTotal) => {
            const nextProgress = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0
            setUploadProgress(nextProgress)
          },
          onSuccess: () => resolve(),
        })

        uploadRef.current = upload
        upload.start()
      })

      setStage('processing')
      await syncAndPoll(lessonId)
    } catch (error) {
      setStage('failed')
      setErrorMessage(getFriendlyApiErrorMessage(error, 'Video upload failed'))
    }
  }

  const syncAndPoll = async (id: number) => {
    clearPolling()

    try {
      const video = await syncVideoMutation.mutateAsync(id)
      setCurrentVideo(video)
      const nextStage = getStatusStage(video.status)
      setStage(nextStage)

      if (nextStage === 'processing') {
        pollTimerRef.current = window.setTimeout(() => {
          void syncAndPoll(id)
        }, 4000)
      }
    } catch (error) {
      setStage('failed')
      setErrorMessage(getFriendlyApiErrorMessage(error, 'Failed to sync video status'))
    }
  }

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!lessonId) return

    try {
      setErrorMessage(null)
      const video = await upsertVideoMutation.mutateAsync({
        lessonId,
        data: {
          bunnyVideoId: manualValues.bunnyVideoId,
          libraryId: manualValues.libraryId,
          durationSeconds: manualValues.durationSeconds,
          thumbnailUrl: manualValues.thumbnailUrl || undefined,
          status: manualValues.status || undefined,
        },
      })
      setCurrentVideo(video)
      setStage(getStatusStage(video.status))
    } catch (error) {
      setErrorMessage(getFriendlyApiErrorMessage(error, 'Failed to save video metadata'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lesson video</DialogTitle>
          <DialogDescription>
            Upload a lesson video, track processing, and keep the lesson ready for students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground">Lesson</p>
                <h3 className="mt-1 text-xl font-extrabold text-foreground">
                  {lesson?.lessonNumber ? `${lesson.lessonNumber}. ` : ''}
                  {lesson?.name || 'Selected lesson'}
                </h3>
              </div>
              <VideoStateBadge stage={stage} status={currentVideo?.status} />
            </div>

            {currentVideo && (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <VideoMeta label="Bunny Video ID" value={currentVideo.bunnyVideoId} />
                <VideoMeta label="Library ID" value={currentVideo.libraryId} />
                <VideoMeta label="Duration" value={currentVideo.durationSeconds ? `${currentVideo.durationSeconds}s` : '-'} />
                <VideoMeta label="Updated" value={currentVideo.updatedAt || '-'} />
              </dl>
            )}
          </section>

          <section className="rounded-lg border border-[hsl(var(--brand-orange))]/20 bg-[hsl(var(--brand-orange-soft))] p-4">
            <div className="flex items-start gap-3">
              <CloudUpload className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-extrabold text-foreground">Upload video</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Select a video file. Vera creates a secure upload session and tracks when the video is ready.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="lesson-video-file" className="text-sm font-bold text-foreground">
                  Video file
                </label>
                <input
                  id="lesson-video-file"
                  type="file"
                  accept="video/*"
                  className="lms-input mt-1"
                  disabled={isBusy}
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedFile.name} - {selectedFile.type || 'unknown type'}
                  </p>
                )}
              </div>
              <Button type="button" disabled={!selectedFile || !lessonId || isBusy} onClick={handleUpload}>
                <FileVideo className="h-4 w-4" />
                {stage === 'uploading' ? 'Uploading...' : 'Upload video'}
              </Button>
            </div>

            {stage === 'uploading' && (
              <div className="mt-4">
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-sm font-bold text-primary">{uploadProgress}% uploaded</p>
              </div>
            )}
          </section>

          {stage === 'processing' && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
              Vera is processing this video and checking the status every few seconds.
            </div>
          )}

          {stage === 'failed' && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              Video upload or processing failed. You can retry the upload or save metadata manually.
            </div>
          )}

          {errorMessage && <div className="lms-alert-error">{errorMessage}</div>}

          <form className="rounded-lg border border-border bg-white p-4" onSubmit={handleManualSubmit}>
            <div className="mb-4 flex items-start gap-3">
              <Settings2 className="mt-1 h-5 w-5 shrink-0 text-[hsl(var(--brand-green))]" />
              <div>
                <h3 className="font-extrabold text-foreground">Manual video metadata</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Advanced fallback for admins when a video already exists in the video library.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ManualField
                label="Video ID"
                value={manualValues.bunnyVideoId}
                onChange={(value) => setManualValues((current) => ({ ...current, bunnyVideoId: value }))}
                required
              />
              <ManualField
                label="Library ID"
                value={manualValues.libraryId}
                onChange={(value) => setManualValues((current) => ({ ...current, libraryId: value }))}
                required
              />
              <ManualField
                label="Duration seconds"
                type="number"
                value={manualValues.durationSeconds?.toString() || ''}
                onChange={(value) =>
                  setManualValues((current) => ({
                    ...current,
                    durationSeconds: value ? Number(value) : undefined,
                  }))
                }
              />
              <ManualField
                label="Thumbnail URL"
                value={manualValues.thumbnailUrl || ''}
                onChange={(value) => setManualValues((current) => ({ ...current, thumbnailUrl: value }))}
              />
              <div>
                <label className="text-sm font-bold text-foreground">Status</label>
                <select
                  className="lms-input mt-1"
                  value={manualValues.status || 'READY'}
                  onChange={(event) => setManualValues((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="READY">READY</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="outline" className="mt-4" disabled={!lessonId || upsertVideoMutation.isPending}>
              {upsertVideoMutation.isPending ? 'Saving...' : 'Save metadata'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VideoStateBadge({ stage, status }: { stage: UploadStage; status?: string }) {
  const meta: Record<UploadStage, { label: string; className: string; icon: typeof FileVideo }> = {
    idle: { label: 'No video', className: 'border-slate-200 bg-slate-50 text-slate-700', icon: FileVideo },
    uploading: { label: 'Uploading', className: 'border-orange-200 bg-orange-50 text-orange-700', icon: CloudUpload },
    processing: { label: 'Processing', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: RefreshCw },
    ready: { label: 'Ready', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    failed: { label: 'Failed', className: 'border-red-200 bg-red-50 text-red-700', icon: AlertTriangle },
  }
  const current = meta[stage]
  const Icon = current.icon

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${current.className}`}>
      <Icon className="h-4 w-4" />
      {status || current.label}
    </span>
  )
}

function VideoMeta({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-foreground">{value || '-'}</dd>
    </div>
  )
}

function ManualField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <input
        type={type}
        min={type === 'number' ? 1 : undefined}
        required={required}
        className="lms-input mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
