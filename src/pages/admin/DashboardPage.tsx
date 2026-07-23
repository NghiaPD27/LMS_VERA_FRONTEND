import { Link } from 'react-router-dom'
import { AlertTriangle, Award, BookOpen, CalendarCheck, ClipboardCheck, ClipboardList, ReceiptText, ShieldCheck, Users } from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetAdminDashboardReport } from '../../hooks/useAdminReports'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'

const cards = [
  { title: 'Programs', description: 'Create and manage A1/A2 learning programs.', href: '/admin/programs', icon: BookOpen },
  { title: 'Purchases', description: 'Review purchase requests and mark paid orders.', href: '/admin/purchases', icon: ReceiptText },
  { title: 'Enrollments', description: 'Enroll students and update enrollment status.', href: '/admin/enrollments', icon: ClipboardList },
  { title: 'Student Progress', description: 'Track progress, current lessons, next actions, and expiry risk.', href: '/admin/student-progress', icon: CalendarCheck },
  { title: 'Checkpoints', description: 'Group checkpoint-ready students and schedule evaluator rooms.', href: '/admin/checkpoints', icon: ClipboardCheck },
  { title: 'Final Assessments', description: 'Schedule final assessment rooms and retake participants.', href: '/admin/final-assessments', icon: Award },
  { title: 'Audit Logs', description: 'Review security-sensitive operations and assessment result submissions.', href: '/admin/audit-logs', icon: ShieldCheck },
  { title: 'Users', description: 'Create users and manage account access.', href: '/admin/users', icon: Users },
]

export function DashboardPage() {
  const dashboardQuery = useGetAdminDashboardReport()
  const report = dashboardQuery.data

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold text-primary">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">Manage Vera with clarity.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Programs, lessons, enrollments, and user access are grouped into focused work areas for daily operations.
            </p>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-foreground">Operational snapshot</h2>
            <p className="text-sm text-muted-foreground">Loaded from the admin dashboard report endpoint.</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
          >
            Refresh
          </button>
        </div>
        {dashboardQuery.isLoading ? (
          <LoadingState message="Loading dashboard report..." />
        ) : dashboardQuery.isError ? (
          <div className="lms-alert-error">{getFriendlyApiErrorMessage(dashboardQuery.error, 'Failed to load dashboard report')}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Students" value={report?.totalStudents} helper={`${formatCount(report?.activeAccounts)} active accounts`} />
            <MetricCard label="Teachers" value={report?.totalTeachers} helper={`${formatCount(report?.totalEvaluators)} evaluators`} />
            <MetricCard label="Active enrollments" value={report?.activeEnrollments} helper={`${formatCount(report?.completedEnrollments)} completed`} />
            <MetricCard label="Expired active" value={report?.expiredActiveEnrollments} helper="Needs admin follow-up" urgent={!!report?.expiredActiveEnrollments} />
            <MetricCard label="Pending purchases" value={report?.pendingPurchases} helper={`${formatCount(report?.paidPurchases)} paid purchases`} />
            <MetricCard label="Booked teacher slots" value={report?.bookedTeacherBookings} helper="Teacher sessions awaiting review" />
            <MetricCard label="Pending checkpoints" value={report?.pendingCheckpointSessions} helper="Evaluator checkpoint rooms" />
            <MetricCard label="Pending finals" value={report?.pendingFinalAssessmentSessions} helper={`${formatCount(report?.waitingReassessmentEnrollments)} waiting reassessment`} />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} to={card.href} className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(244,122,61,0.12)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))]">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function MetricCard({ label, value, helper, urgent = false }: { label: string; value?: number; helper: string; urgent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${urgent ? 'border-amber-200 bg-amber-50' : 'border-border bg-background'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{formatCount(value)}</p>
        </div>
        {urgent && <AlertTriangle className="h-5 w-5 text-amber-700" />}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{helper}</p>
    </div>
  )
}

function formatCount(value?: number) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}
