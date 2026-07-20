import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProgramLessons } from '../../hooks/useLessons'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import { StudentLessonVideoWorkspace } from '../../components/lessons/StudentLessonVideoWorkspace'
import { getFriendlyApiErrorMessage, isForbiddenError } from '../../utils/errorMessage'
import { ArrowLeft, BookOpen, CalendarClock } from 'lucide-react'

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
    if (isForbiddenError(error)) {
      return (
        <section className="lms-page-shell">
          <Button
            variant="ghost"
            onClick={handleBack}
            data-testid="back-to-enrollments-button"
            className="w-fit text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Enrollments
          </Button>
          <div className="lms-surface flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <CalendarClock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Course access expired</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              This course is no longer available for learning. Contact Vera to extend your enrollment, then try again.
            </p>
            <Button className="mt-5" onClick={handleBack}>
              Back to enrollments
            </Button>
          </div>
        </section>
      )
    }

    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(error, 'Failed to fetch lessons')}
        onRetry={refetch}
      />
    )
  }

  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
    : []

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div>
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
                  Your full lesson path for this program.
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
        <StudentLessonVideoWorkspace lessons={sortedLessons} />
      )}
    </section>
  )
}

