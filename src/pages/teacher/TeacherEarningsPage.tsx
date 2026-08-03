import { useState } from 'react'
import { CalendarDays, RefreshCw, ReceiptText, WalletCards } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetMyTeacherEarnings } from '../../hooks/useTeacher'
import type { TeacherEarning, TeacherEarningsSummary } from '../../types/teacher'
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

type EarningsMode = 'monthly' | 'all-time'

export function TeacherEarningsPage() {
  const [month, setMonth] = useState(getCurrentVietnamMonth)
  const [mode, setMode] = useState<EarningsMode>('monthly')
  const params = mode === 'monthly' ? { month } : {}
  const earningsQuery = useGetMyTeacherEarnings(params)
  const summary = earningsQuery.data
  const earnings = summary?.earnings ?? []

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Earnings</h1>
              <p className="lms-section-description">
                Track earned teaching sessions by Vietnam business month or view your all-time total.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Earnings Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'monthly' ? `Viewing ${formatMonthLabel(month)}` : 'Viewing all earned sessions.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex rounded-lg border border-border bg-slate-950 p-1">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  mode === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
                onClick={() => setMode('monthly')}
                data-testid="teacher-earnings-monthly-mode"
              >
                Monthly
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  mode === 'all-time' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
                onClick={() => setMode('all-time')}
                data-testid="teacher-earnings-all-time-mode"
              >
                All-time
              </button>
            </div>
            <label className="text-sm font-bold text-foreground">
              Month
              <input
                type="month"
                value={month}
                disabled={mode === 'all-time'}
                onChange={(event) => setMonth(event.target.value || getCurrentVietnamMonth())}
                className="lms-input mt-1 h-10 w-full sm:w-44"
                data-testid="teacher-earnings-month-input"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => void earningsQuery.refetch()}
              disabled={earningsQuery.isFetching}
              data-testid="teacher-earnings-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${earningsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {earningsQuery.isLoading ? (
          <LoadingState message="Loading earnings..." />
        ) : earningsQuery.isError ? (
          <EarningsError
            message={getFriendlyApiErrorMessage(earningsQuery.error, 'Failed to load earnings')}
            onRetry={() => void earningsQuery.refetch()}
          />
        ) : (
          <div className="space-y-5">
            <TeacherEarningsStats summary={summary} mode={mode} month={month} />
            {earnings.length === 0 ? (
              <EmptyState
                message="No earnings found"
                description={mode === 'monthly' ? 'No earned sessions were recorded for this month.' : 'No earned sessions have been recorded yet.'}
              />
            ) : (
              <TeacherEarningsTable earnings={earnings} currency={summary?.currency || 'VND'} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function TeacherEarningsStats({
  summary,
  mode,
  month,
}: {
  summary?: TeacherEarningsSummary
  mode: EarningsMode
  month: string
}) {
  const currency = summary?.currency || 'VND'
  const period = summary?.periodStart && summary.periodEnd
    ? `${formatDateTime(summary.periodStart)} - ${formatDateTime(summary.periodEnd)}`
    : mode === 'monthly'
      ? formatMonthLabel(summary?.periodMonth || month)
      : 'All time'

  const stats = [
    {
      label: 'Total earned',
      value: formatCurrency(summary?.totalEarned ?? 0, currency),
      icon: WalletCards,
    },
    {
      label: 'Sessions',
      value: String(summary?.totalSessions ?? summary?.earnings?.length ?? 0),
      icon: ReceiptText,
    },
    {
      label: 'Period',
      value: period,
      icon: CalendarDays,
    },
    {
      label: 'Currency',
      value: currency,
      icon: WalletCards,
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="mt-1 break-words text-lg font-extrabold text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TeacherEarningsTable({ earnings, currency }: { earnings: TeacherEarning[]; currency: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-slate-900/60">
      <Table data-testid="teacher-earnings-table">
        <TableHeader>
          <TableRow>
            <TableHead>Earned Date</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Lesson</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings.map((earning) => (
            <TableRow key={earning.id || earning.bookingId}>
              <TableCell>{formatDateTime(earning.earnedAt)}</TableCell>
              <TableCell>
                <p className="font-semibold text-foreground">{earning.studentName || `Student #${earning.studentId ?? '-'}`}</p>
              </TableCell>
              <TableCell>{earning.lessonName || `Lesson #${earning.lessonId ?? '-'}`}</TableCell>
              <TableCell>#{earning.bookingId ?? '-'}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-xs font-extrabold text-foreground">
                  {earning.status || 'EARNED'}
                </span>
              </TableCell>
              <TableCell className="text-right font-extrabold text-foreground">
                {formatCurrency(earning.amount ?? 0, earning.currency || currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EarningsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="lms-alert-error flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-testid="teacher-earnings-error">
      <span>{message}</span>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}
