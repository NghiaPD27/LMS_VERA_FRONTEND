import React from 'react'
import type { Lesson } from '../../types/lesson'
import { LessonStatusBadge } from './LessonStatusBadge'
import { Button } from '../common/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface LessonTableProps {
  lessons: Lesson[]
  onEdit: (lesson: Lesson) => void
  onVideo: (lesson: Lesson) => void
  onQuiz: (lesson: Lesson) => void
  onPublish: (id: number) => void
  onDelete: (id: number) => void
}

export const LessonTable: React.FC<LessonTableProps> = ({
  lessons,
  onEdit,
  onVideo,
  onQuiz,
  onPublish,
  onDelete
}) => {
  return (
    <div className="lms-surface overflow-hidden">
      <Table data-testid="lessons-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Readiness</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => {
            const isDraft = lesson.status?.toUpperCase() === 'DRAFT'
            return (
              <TableRow key={lesson.id} data-testid={`lesson-row-${lesson.id}`}>
                <TableCell className="font-medium text-primary">{lesson.lessonNumber}</TableCell>
                <TableCell className="font-semibold text-foreground">{lesson.name}</TableCell>
                <TableCell className="max-w-[240px] truncate text-muted-foreground">
                  {lesson.content || '-'}
                </TableCell>
                <TableCell>
                  <LessonStatusBadge status={lesson.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <ReadinessBadge
                      label={lesson.hasVideo ? getVideoLabel(lesson.videoStatus) : 'Missing video'}
                      tone={lesson.hasVideo ? getVideoTone(lesson.videoStatus) : 'warning'}
                    />
                    <ReadinessBadge
                      label={lesson.hasQuiz ? `Quiz ${lesson.questionCount ?? 0} questions` : 'Missing quiz'}
                      tone={lesson.hasQuiz ? 'success' : 'warning'}
                    />
                    {typeof lesson.videoDurationSeconds === 'number' && lesson.videoDurationSeconds > 0 && (
                      <ReadinessBadge label={`${Math.round(lesson.videoDurationSeconds / 60)} min`} tone="neutral" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid={`edit-lesson-${lesson.id}`}
                    onClick={() => onEdit(lesson)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`video-lesson-${lesson.id}`}
                    onClick={() => onVideo(lesson)}
                  >
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`quiz-lesson-${lesson.id}`}
                    onClick={() => onQuiz(lesson)}
                  >
                    Quiz
                  </Button>
                  {isDraft && (
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`publish-lesson-${lesson.id}`}
                      onClick={() => lesson.id && onPublish(lesson.id)}
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid={`delete-lesson-${lesson.id}`}
                    onClick={() => lesson.id && onDelete(lesson.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function ReadinessBadge({ label, tone }: { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const className = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-800',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone]

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${className}`}>{label}</span>
}

function getVideoLabel(status?: string) {
  if (!status) return 'Video attached'
  return `Video ${status.toLowerCase()}`
}

function getVideoTone(status?: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'READY') return 'success'
  if (status === 'FAILED') return 'danger'
  if (status === 'PROCESSING') return 'warning'
  return 'neutral'
}

