import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarClock, ClipboardList, ShoppingBag } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { useGetMyEnrollments } from '../../hooks/useEnrollments'
import {
  getEnrollmentAccessBadgeClass,
  getEnrollmentAccessLabel,
  hasActiveCourseAccess,
  isEnrollmentExpired
} from '../../utils/enrollmentAccess'
import { formatDateTime } from '../../utils/formatters'

export function StudentDashboardPage() {
  const { data: enrollments, isLoading } = useGetMyEnrollments()
  const activeAccessEnrollments = (enrollments ?? []).filter(hasActiveCourseAccess)
  const hasActiveEnrollment = activeAccessEnrollments.length > 0
  const recentEnrollments = (enrollments ?? []).slice(0, 3)

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold text-[hsl(var(--brand-green))]">Student Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">Your learning path, kept simple.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              View your enrollments and continue the lessons available in your learning path.
            </p>
            {!isLoading && !hasActiveEnrollment && (
              <Button asChild className="mt-5">
                <Link to="/student/courses">
                  Browse courses
                  <ShoppingBag className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/student/courses" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(244,122,61,0.12)]">
          <ShoppingBag className="mb-4 h-8 w-8 text-primary" />
          <h2 className="font-extrabold text-foreground">Courses</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Find a course and create a purchase request.</p>
        </Link>
        <Link to="/student/enrollments" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(244,122,61,0.12)]">
          <ClipboardList className="mb-4 h-8 w-8 text-primary" />
          <h2 className="font-extrabold text-foreground">My Enrollments</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">See active and completed enrollments.</p>
        </Link>
        <Link to="/student/enrollments" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-[hsl(var(--brand-green))]/40 hover:shadow-[0_18px_45px_rgba(47,143,91,0.12)]">
          <BookOpen className="mb-4 h-8 w-8 text-[hsl(var(--brand-green))]" />
          <h2 className="font-extrabold text-foreground">My Lessons</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose an enrollment first, then open available lessons.</p>
        </Link>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Course access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Access is based on each enrollment expiry date, not your account creation date.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/student/enrollments">View all enrollments</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : recentEnrollments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
            You do not have an enrollment yet. Browse courses to start a purchase request.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {recentEnrollments.map((enrollment) => {
              const canStudy = hasActiveCourseAccess(enrollment)
              const expired = isEnrollmentExpired(enrollment)

              return (
                <article key={enrollment.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Program</p>
                      <h3 className="mt-1 text-lg font-extrabold text-foreground">{enrollment.programName || `Program #${enrollment.programId}`}</h3>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                      {getEnrollmentAccessLabel(enrollment)}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Progress</dt>
                      <dd className="text-right font-semibold text-primary">
                        {typeof enrollment.progressPercent === 'number' ? `${Math.max(0, Math.min(100, enrollment.progressPercent))}%` : 'Not started'}
                      </dd>
                    </div>
                    {(enrollment.currentLessonName || enrollment.currentLessonNumber) && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Current</dt>
                        <dd className="text-right font-semibold text-foreground">
                          {enrollment.currentLessonName || `Lesson ${enrollment.currentLessonNumber}`}
                        </dd>
                      </div>
                    )}
                    {enrollment.nextAction && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Next</dt>
                        <dd className="text-right font-semibold text-foreground">{formatNextAction(enrollment.nextAction)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Enrolled</dt>
                      <dd className="text-right font-semibold text-foreground">{formatDateTime(enrollment.enrolledAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="text-right font-semibold text-foreground">{formatDateTime(enrollment.expiredAt)}</dd>
                    </div>
                  </dl>
                  {canStudy ? (
                    <Button asChild className="mt-4 w-full">
                      <Link to={`/student/lessons/${enrollment.programId}`}>
                        Start learning
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <div className={`mt-4 flex items-start gap-2 rounded-md border p-3 text-sm leading-6 ${expired ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                      {expired ? 'This course has expired. Contact Vera to extend access.' : 'This enrollment is not active for learning right now.'}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function formatNextAction(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase())
}
