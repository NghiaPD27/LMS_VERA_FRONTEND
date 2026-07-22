import { Users } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetTeacherStudents } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

export function TeacherStudentsPage() {
  const studentsQuery = useGetTeacherStudents()

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Assigned Students</h1>
              <p className="lms-section-description">Students and programs assigned to your teacher account.</p>
            </div>
          </div>
        </div>
      </div>

      {studentsQuery.isLoading ? (
        <LoadingState message="Loading assigned students..." />
      ) : studentsQuery.isError ? (
        <div className="lms-alert-error">
          {getFriendlyApiErrorMessage(studentsQuery.error, 'Failed to load assigned students')}
        </div>
      ) : (studentsQuery.data ?? []).length === 0 ? (
        <EmptyState message="No assigned students" description="An admin has not assigned students to you yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {studentsQuery.data?.map((assignment) => (
            <article key={assignment.id || `${assignment.enrollmentId}-${assignment.studentId}`} className="lms-surface p-5">
              <p className="text-sm font-bold text-[hsl(var(--brand-green))]">{assignment.programName || `Program #${assignment.programId ?? '-'}`}</p>
              <h2 className="mt-1 text-xl font-extrabold text-foreground">{assignment.studentName || `Student #${assignment.studentId ?? '-'}`}</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Enrollment</dt>
                  <dd className="font-bold text-foreground">#{assignment.enrollmentId ?? '-'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Assigned</dt>
                  <dd className="text-right font-bold text-foreground">{formatDateTime(assignment.assignedAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

