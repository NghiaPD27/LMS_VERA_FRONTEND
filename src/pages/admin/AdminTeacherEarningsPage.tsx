import { Fragment, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, RefreshCw, Search, WalletCards } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetAdminTeachers, useGetTeacherEarnings } from '../../hooks/useTeacher'
import type { AdminTeacher, TeacherEarning, TeacherEarningsSummary } from '../../types/teacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { formatMonthLabel, getCurrentVietnamMonth } from '../../utils/month'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const getTeacherName = (teacher: AdminTeacher) => {
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').trim()
  return fullName || teacher.username || `Teacher #${teacher.id ?? '-'}`
}

const getPeriodLabel = (summary?: TeacherEarningsSummary, fallbackMonth?: string) => {
  if (summary?.periodStart && summary.periodEnd) {
    return `${formatDateTime(summary.periodStart)} - ${formatDateTime(summary.periodEnd)}`
  }
  return formatMonthLabel(summary?.periodMonth || fallbackMonth)
}

export function AdminTeacherEarningsPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [month, setMonth] = useState(getCurrentVietnamMonth)
  const queryClient = useQueryClient()
  const teachersQuery = useGetAdminTeachers({
    keyword: keyword || undefined,
    page,
    size: 10,
  })
  const teachers = teachersQuery.data?.content ?? []
  const totalPages = teachersQuery.data?.totalPages ?? 0

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary sm:flex">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Teacher Earnings</h1>
              <p className="lms-section-description">
                Review monthly earned amounts for teacher transfer preparation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Monthly Transfer Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Viewing {formatMonthLabel(month)}. This summary shows earned amounts only.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="text-sm font-bold text-foreground">
              Month
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value || getCurrentVietnamMonth())}
                className="lms-input mt-1 h-10 w-full md:w-44"
                data-testid="admin-teacher-earnings-month-input"
              />
            </label>
            <label className="text-sm font-bold text-foreground">
              Search Teachers
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value)
                    setPage(0)
                  }}
                  className="lms-input h-10 w-full pl-9 md:w-72"
                  placeholder="Name or email"
                  data-testid="admin-teacher-earnings-search"
                />
              </div>
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void teachersQuery.refetch()
                void queryClient.invalidateQueries({ queryKey: ['teacher-earnings'] })
              }}
              disabled={teachersQuery.isFetching}
              data-testid="admin-teacher-earnings-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${teachersQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {teachersQuery.isLoading ? (
          <LoadingState message="Loading teachers..." />
        ) : teachersQuery.isError ? (
          <div className="lms-alert-error">
            {getFriendlyApiErrorMessage(teachersQuery.error, 'Failed to load teachers')}
          </div>
        ) : teachers.length === 0 ? (
          <EmptyState message="No teachers found" description="Try a different keyword before preparing transfers." />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <Table data-testid="admin-teacher-earnings-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <AdminTeacherEarningsRow key={teacher.id} teacher={teacher} month={month} />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
              >
                Previous
              </Button>
              <span>
                Page {page + 1} / {Math.max(totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={totalPages === 0 || page >= totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function AdminTeacherEarningsRow({ teacher, month }: { teacher: AdminTeacher; month: string }) {
  const [expanded, setExpanded] = useState(false)
  const earningsQuery = useGetTeacherEarnings(teacher.id, { month }, !!teacher.id && !!month)
  const summary = earningsQuery.data
  const earnings = summary?.earnings ?? []
  const currency = summary?.currency || 'VND'

  return (
    <Fragment>
      <TableRow data-testid={`admin-teacher-earnings-row-${teacher.id}`}>
        <TableCell>
          <p className="font-extrabold text-foreground">{getTeacherName(teacher)}</p>
          <p className="text-sm text-muted-foreground">{teacher.email || teacher.username || '-'}</p>
        </TableCell>
        <TableCell className="font-extrabold text-foreground">
          {earningsQuery.isLoading ? 'Loading...' : formatCurrency(summary?.totalEarned ?? 0, currency)}
        </TableCell>
        <TableCell>{earningsQuery.isLoading ? '-' : summary?.totalSessions ?? earnings.length}</TableCell>
        <TableCell>{earningsQuery.isLoading ? '-' : currency}</TableCell>
        <TableCell>{earningsQuery.isLoading ? '-' : getPeriodLabel(summary, month)}</TableCell>
        <TableCell className="text-right">
          {earningsQuery.isError ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void earningsQuery.refetch()}
              data-testid={`retry-admin-teacher-earnings-${teacher.id}`}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpanded((current) => !current)}
              disabled={earningsQuery.isLoading}
              data-testid={`toggle-admin-teacher-earnings-${teacher.id}`}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Rows
            </Button>
          )}
        </TableCell>
      </TableRow>
      {earningsQuery.isError && (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="lms-alert-error text-sm">
              {getFriendlyApiErrorMessage(earningsQuery.error, 'Failed to load teacher earnings')}
            </div>
          </TableCell>
        </TableRow>
      )}
      {expanded && !earningsQuery.isError && (
        <TableRow>
          <TableCell colSpan={6} className="bg-background">
            <TeacherEarningDetails earnings={earnings} currency={currency} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

function TeacherEarningDetails({ earnings, currency }: { earnings: TeacherEarning[]; currency: string }) {
  if (earnings.length === 0) {
    return <p className="text-sm text-muted-foreground">No earnings recorded for this month.</p>
  }

  return (
    <div className="grid gap-2">
      {earnings.map((earning) => (
        <div key={earning.id || earning.bookingId} className="grid gap-2 rounded-md border border-border bg-white p-3 text-sm lg:grid-cols-[160px_1fr_1fr_120px_120px] lg:items-center">
          <span className="text-muted-foreground">{formatDateTime(earning.earnedAt)}</span>
          <span className="font-semibold text-foreground">{earning.studentName || `Student #${earning.studentId ?? '-'}`}</span>
          <span>{earning.lessonName || `Lesson #${earning.lessonId ?? '-'}`}</span>
          <span>Booking #{earning.bookingId ?? '-'}</span>
          <span className="font-extrabold text-foreground lg:text-right">
            {formatCurrency(earning.amount ?? 0, earning.currency || currency)}
          </span>
        </div>
      ))}
    </div>
  )
}
