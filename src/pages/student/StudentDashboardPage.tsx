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
      <div className="lms-page-hero border-border/80">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Student Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">Your learning path, kept simple.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              View your enrollments and continue the lessons available in your learning path.
            </p>
            {!isLoading && !hasActiveEnrollment && (
              <Button asChild className="mt-5 bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)]">
                <Link to="/student/courses">
                  Browse courses
                  <ShoppingBag className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/student/courses" className="lms-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(244,106,37,0.15)] group">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/20 transition-transform group-hover:scale-110">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-white group-hover:text-primary transition-colors">Courses</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Find a course and create a purchase request.</p>
        </Link>
        <Link to="/student/enrollments" className="lms-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(244,106,37,0.15)] group">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/20 transition-transform group-hover:scale-110">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-white group-hover:text-primary transition-colors">My Enrollments</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">See active and completed enrollments.</p>
        </Link>
        <Link to="/student/enrollments" className="lms-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(244,106,37,0.15)] group">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/20 transition-transform group-hover:scale-110">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-white group-hover:text-primary transition-colors">My Lessons</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Choose an enrollment first, then open available lessons.</p>
        </Link>
      </div>

      <div className="lms-surface p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Course Access</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Access is based on each enrollment expiry date, not your account creation date.
            </p>
          </div>
          <Button asChild variant="outline" className="border-border text-xs hover:border-primary/50">
            <Link to="/student/enrollments">View all enrollments</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="vera-skeleton h-36 rounded-xl" />
            ))}
          </div>
        ) : recentEnrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-slate-900/50 p-6 text-center text-xs text-muted-foreground">
            You do not have an enrollment yet. Browse courses to start a purchase request.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {recentEnrollments.map((enrollment) => {
              const canStudy = hasActiveCourseAccess(enrollment)
              const expired = isEnrollmentExpired(enrollment)
              const progressPct = typeof enrollment.progressPercent === 'number' ? Math.max(0, Math.min(100, enrollment.progressPercent)) : 0

              return (
                <article key={enrollment.id} className="rounded-xl border border-border bg-slate-900/70 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Program</p>
                      <h3 className="mt-0.5 text-base font-extrabold text-white">{enrollment.programName || `Program #${enrollment.programId}`}</h3>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                      {getEnrollmentAccessLabel(enrollment)}
                    </span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold text-primary">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <dl className="mt-4 space-y-2 text-xs">
                    {(enrollment.currentLessonName || enrollment.currentLessonNumber) && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Current</dt>
                        <dd className="text-right font-semibold text-white">
                          {enrollment.currentLessonName || `Lesson ${enrollment.currentLessonNumber}`}
                        </dd>
                      </div>
                    )}
                    {enrollment.nextAction && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Next</dt>
                        <dd className="text-right font-semibold text-white">{formatNextAction(enrollment.nextAction)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Enrolled</dt>
                      <dd className="text-right font-semibold text-zinc-300">{formatDateTime(enrollment.enrolledAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="text-right font-semibold text-zinc-300">{formatDateTime(enrollment.expiredAt)}</dd>
                    </div>
                  </dl>

                  {canStudy ? (
                    <Button asChild className="mt-4 w-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(244,106,37,0.25)]">
                      <Link to={`/student/lessons/${enrollment.programId}`}>
                        Start learning
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed ${expired ? 'border-rose-900/50 bg-rose-950/30 text-rose-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>
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
