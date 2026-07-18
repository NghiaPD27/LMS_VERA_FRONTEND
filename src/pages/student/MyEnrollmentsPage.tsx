import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetMyEnrollments } from '../../hooks/useEnrollments'
import { EnrollmentStatusBadge } from '../../components/enrollments/EnrollmentStatusBadge'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { ArrowRight, ClipboardList } from 'lucide-react'

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
        <EmptyState
          message="No enrollments found"
          description="You are not enrolled in any programs yet."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="student-enrollments-table">
          {enrollments.map((enrollment) => (
            <article key={enrollment.id} className="lms-surface p-5" data-testid={`student-enrollment-row-${enrollment.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Program</p>
                  <h2 className="mt-1 text-xl font-extrabold text-foreground">#{enrollment.programId}</h2>
                </div>
                <EnrollmentStatusBadge status={enrollment.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Enrollment #{enrollment.id}</p>
              <Button
                variant="outline"
                className="mt-5 w-full"
                data-testid={`view-lessons-${enrollment.programId}`}
                onClick={() => enrollment.programId && navigate(`/student/lessons/${enrollment.programId}`)}
              >
                View Lessons
                <ArrowRight className="h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

