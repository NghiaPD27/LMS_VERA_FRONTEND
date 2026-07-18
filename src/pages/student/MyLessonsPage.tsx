import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProgramLessons } from '../../hooks/useLessons'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { ArrowLeft, BookOpen } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export const MyLessonsPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>()
  const navigate = useNavigate()
  const pId = Number(programId)

  const { data: lessons, isLoading, isError, error, refetch } = useGetProgramLessons(pId)

  const handleBack = () => {
    navigate('/student/enrollments')
  }

  if (isLoading) {
    return <LoadingState message="Loading lessons..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(error, 'Failed to fetch lessons')}
        onRetry={refetch}
      />
    )
  }

  // Sort lessons by lessonNumber
  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
    : []

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
        <div className="relative">
        <Button
          variant="ghost"
          onClick={handleBack}
          data-testid="back-to-enrollments-button"
          className="mb-2 h-auto p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Enrollments
        </Button>
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
        <h1 className="lms-section-title" data-testid="student-lessons-title">
          Lessons
        </h1>
        <p className="lms-section-description">
          Lessons currently available in this program.
        </p>
          </div>
        </div>
        </div>
        </div>
      </div>

      {sortedLessons.length === 0 ? (
        <EmptyState
          message="No lessons available"
          description="There are no lessons available for this program yet."
        />
      ) : (
        <div className="lms-surface overflow-hidden">
          <Table data-testid="student-lessons-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLessons.map((lesson) => (
                <TableRow key={lesson.id} data-testid={`student-lesson-row-${lesson.id}`}>
                  <TableCell className="font-medium">{lesson.lessonNumber}</TableCell>
                  <TableCell>{lesson.name}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{lesson.content || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

