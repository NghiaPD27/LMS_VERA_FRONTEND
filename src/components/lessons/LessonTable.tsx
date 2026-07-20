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

