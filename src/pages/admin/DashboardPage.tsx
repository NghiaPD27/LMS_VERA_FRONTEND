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
      <div className="lms-page-hero border-border/80">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">Manage Sen Languages with clarity.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Programs, lessons, enrollments, and user access are grouped into focused work areas for daily operations.
            </p>
          </div>
        </div>
      </div>

      <div className="lms-surface p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Operational Snapshot</h2>
            <p className="text-xs text-muted-foreground">Loaded from the admin dashboard report endpoint.</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 hover:border-primary/50"
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
          >
            {dashboardQuery.isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {dashboardQuery.isLoading ? (
          <LoadingState message="Loading dashboard report..." />
        ) : dashboardQuery.isError ? (
          <div className="lms-alert-error">{getFriendlyApiErrorMessage(dashboardQuery.error, 'Failed to load dashboard report')}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Students" value={report?.totalStudents} helper={`${formatCount(report?.activeAccounts)} active accounts`} />
            <MetricCard label="Teachers" value={report?.totalTeachers} helper={`${formatCount(report?.totalEvaluators)} evaluators`} />
            <MetricCard label="Active Enrollments" value={report?.activeEnrollments} helper={`${formatCount(report?.completedEnrollments)} completed`} />
            <MetricCard label="Expired Active" value={report?.expiredActiveEnrollments} helper="Needs admin follow-up" urgent={!!report?.expiredActiveEnrollments} />
            <MetricCard label="Pending Purchases" value={report?.pendingPurchases} helper={`${formatCount(report?.paidPurchases)} paid purchases`} />
            <MetricCard label="Booked Teacher Slots" value={report?.bookedTeacherBookings} helper="Teacher sessions awaiting review" />
            <MetricCard label="Pending Checkpoints" value={report?.pendingCheckpointSessions} helper="Evaluator checkpoint rooms" />
            <MetricCard label="Pending Finals" value={report?.pendingFinalAssessmentSessions} helper={`${formatCount(report?.waitingReassessmentEnrollments)} waiting reassessment`} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} to={card.href} className="lms-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(244,106,37,0.15)] group">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/20 transition-transform duration-200 group-hover:scale-110">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-white group-hover:text-primary transition-colors">{card.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function MetricCard({ label, value, helper, urgent = false }: { label: string; value?: number; helper: string; urgent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${urgent ? 'border-amber-500/40 bg-amber-950/20' : 'border-border/80 bg-slate-900/60 hover:border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-white tracking-tight">{formatCount(value)}</p>
        </div>
        {urgent && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />}
      </div>
      <p className="mt-2 text-[11px] font-medium text-muted-foreground">{helper}</p>
    </div>
  )
}

function formatCount(value?: number) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}
