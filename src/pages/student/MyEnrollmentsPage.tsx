import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useGetMyEnrollments } from '../../hooks/useEnrollments'
import { EnrollmentStatusBadge } from '../../components/enrollments/EnrollmentStatusBadge'
import { StudentFinalAssessmentPanel } from '../../components/enrollments/StudentFinalAssessmentPanel'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import {
  getEnrollmentAccessBadgeClass,
  getEnrollmentAccessLabel,
  hasActiveCourseAccess,
  isEnrollmentExpired
} from '../../utils/enrollmentAccess'
import { formatDateTime } from '../../utils/formatters'
import { ArrowRight, CalendarClock, ClipboardList } from 'lucide-react'

export const MyEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: enrollments, isLoading, isError, error, refetch } = useGetMyEnrollments()

  if (isLoading) {
    return <LoadingState message="Loading your enrollments..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(error, 'Failed to fetch enrollments')}
        onRetry={refetch}
      />
    )
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary sm:flex">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">My Enrollments</h1>
              <p className="lms-section-description">
                Choose a program to open the lessons available to your account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            message="No enrollments found"
            description="You are not enrolled in any programs yet."
          />
          <div className="text-center">
            <Button asChild>
              <Link to="/student/courses">Browse available courses</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3" data-testid="student-enrollments-table">
          {enrollments.map((enrollment) => {
            const canStudy = hasActiveCourseAccess(enrollment)
            const expired = isEnrollmentExpired(enrollment)

            return (
              <article key={enrollment.id} className="lms-surface p-5" data-testid={`student-enrollment-row-${enrollment.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Program</p>
                    <h2 className="mt-1 text-xl font-extrabold text-foreground">{enrollment.programName || `Program #${enrollment.programId}`}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <EnrollmentStatusBadge status={enrollment.status} />
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                      {getEnrollmentAccessLabel(enrollment)}
                    </span>
                  </div>
                </div>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Enrollment</dt>
                    <dd className="font-bold text-foreground">#{enrollment.id}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Enrolled</dt>
                    <dd className="text-right font-semibold text-foreground">{formatDateTime(enrollment.enrolledAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd className="text-right font-semibold text-foreground">{formatDateTime(enrollment.expiredAt)}</dd>
                  </div>
                </dl>

                <EnrollmentProgressSummary
                  progressPercent={enrollment.progressPercent}
                  currentLessonName={enrollment.currentLessonName}
                  currentLessonNumber={enrollment.currentLessonNumber}
                  currentLessonStatus={enrollment.currentLessonStatus}
                  nextAction={enrollment.nextAction}
                />

                <StudentFinalAssessmentPanel enrollmentId={enrollment.id} />

                {canStudy ? (
                  <Button
                    variant="outline"
                    className="mt-5 w-full"
                    data-testid={`view-lessons-${enrollment.programId}`}
                    onClick={() => enrollment.programId && navigate(`/student/lessons/${enrollment.programId}`)}
                  >
                    View Lessons
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className={`mt-5 flex items-start gap-2 rounded-lg border p-3 text-sm leading-6 ${expired ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                    {expired ? 'This course has expired. Contact Vera to extend access.' : 'This enrollment is not active for learning right now.'}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function EnrollmentProgressSummary({
  progressPercent,
  currentLessonName,
  currentLessonNumber,
  currentLessonStatus,
  nextAction,
}: {
  progressPercent?: number
  currentLessonName?: string
  currentLessonNumber?: number
  currentLessonStatus?: string
  nextAction?: string
}) {
  const percent = typeof progressPercent === 'number' ? Math.max(0, Math.min(100, progressPercent)) : undefined

  return (
    <div className="mt-5 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-foreground">Progress</span>
        <span className="font-extrabold text-primary">{percent !== undefined ? `${percent}%` : 'Not started'}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent ?? 0}%` }} />
      </div>
      {(currentLessonName || currentLessonNumber || currentLessonStatus || nextAction) && (
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Current: </span>
            {currentLessonName || (currentLessonNumber ? `Lesson ${currentLessonNumber}` : currentLessonStatus || 'Learning path')}
          </p>
          {nextAction && (
            <p>
              <span className="font-semibold text-foreground">Next: </span>
              {formatNextAction(nextAction)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function formatNextAction(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase())
}

