import { useMemo, useState } from 'react'
import { BookOpenCheck, Eye, Filter, RefreshCw, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { EnrollmentStatusBadge } from '../../components/enrollments/EnrollmentStatusBadge'
import { useGetAdminStudentProgress, useGetAdminStudentProgressDetail } from '../../hooks/useAdminReports'
import { useGetPrograms } from '../../hooks/usePrograms'
import { useGetAdminTeachers } from '../../hooks/useTeacher'
import type { AdminStudentProgress } from '../../types/adminReport'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'WAITING_FOR_REASSESSMENT']
const ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED', 'EXPIRED']

export function StudentProgressReportPage() {
  const [keyword, setKeyword] = useState('')
  const [programId, setProgramId] = useState('')
  const [enrollmentStatus, setEnrollmentStatus] = useState('')
  const [accountStatus, setAccountStatus] = useState('')
  const [teacherKeyword, setTeacherKeyword] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [expiryFrom, setExpiryFrom] = useState('')
  const [expiryTo, setExpiryTo] = useState('')
  const [page, setPage] = useState(0)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | undefined>()

  const queryParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      programId: toNumber(programId),
      enrollmentStatus: enrollmentStatus || undefined,
      accountStatus: accountStatus || undefined,
      teacherId: toNumber(teacherId),
      expiryFrom: expiryFrom || undefined,
      expiryTo: expiryTo || undefined,
      page,
      size: 10,
    }),
    [accountStatus, enrollmentStatus, expiryFrom, expiryTo, keyword, page, programId, teacherId]
  )

  const progressQuery = useGetAdminStudentProgress(queryParams)
  const detailQuery = useGetAdminStudentProgressDetail(selectedEnrollmentId, !!selectedEnrollmentId)
  const programsQuery = useGetPrograms({ page: 0, size: 100 })
  const teachersQuery = useGetAdminTeachers({ keyword: teacherKeyword || undefined, page: 0, size: 8 })

  const rows = progressQuery.data?.content ?? []
  const totalPages = progressQuery.data?.totalPages ?? 0
  const selectedTeacherName = teachersQuery.data?.content?.find((teacher) => String(teacher.id) === teacherId)
  const hasFilters = keyword || programId || enrollmentStatus || accountStatus || teacherId || expiryFrom || expiryTo

  const resetFilters = () => {
    setKeyword('')
    setProgramId('')
    setEnrollmentStatus('')
    setAccountStatus('')
    setTeacherKeyword('')
    setTeacherId('')
    setExpiryFrom('')
    setExpiryTo('')
    setPage(0)
  }

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Student progress</h1>
              <p className="lms-section-description">Track each enrollment from the admin reporting endpoint with filters for daily follow-up.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="font-extrabold text-foreground">Filters</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(event) => changeFilter(setKeyword)(event.target.value)}
              className="lms-input pl-9"
              placeholder="Search name, username, email"
              data-testid="student-progress-keyword"
            />
          </div>
          <select value={programId} onChange={(event) => changeFilter(setProgramId)(event.target.value)} className="lms-input" data-testid="student-progress-program">
            <option value="">All programs</option>
            {(programsQuery.data?.content ?? []).map((program) => (
              <option key={program.id} value={program.id}>{program.name}</option>
            ))}
          </select>
          <select value={enrollmentStatus} onChange={(event) => changeFilter(setEnrollmentStatus)(event.target.value)} className="lms-input" data-testid="student-progress-enrollment-status">
            <option value="">All enrollment statuses</option>
            {ENROLLMENT_STATUSES.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
          </select>
          <select value={accountStatus} onChange={(event) => changeFilter(setAccountStatus)(event.target.value)} className="lms-input" data-testid="student-progress-account-status">
            <option value="">All account statuses</option>
            {ACCOUNT_STATUSES.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
          </select>
          <input value={expiryFrom} onChange={(event) => changeFilter(setExpiryFrom)(event.target.value)} type="date" className="lms-input" aria-label="Expiry from" />
          <input value={expiryTo} onChange={(event) => changeFilter(setExpiryTo)(event.target.value)} type="date" className="lms-input" aria-label="Expiry to" />
          <div className="lg:col-span-2">
            <div className="flex gap-2">
              <input value={teacherKeyword} onChange={(event) => setTeacherKeyword(event.target.value)} className="lms-input" placeholder="Search teacher" />
              <select value={teacherId} onChange={(event) => changeFilter(setTeacherId)(event.target.value)} className="lms-input max-w-[220px]">
                <option value="">{selectedTeacherName ? getUserName(selectedTeacherName) : 'All teachers'}</option>
                {(teachersQuery.data?.content ?? []).map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{getUserName(teacher)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={resetFilters}>Clear filters</Button>
        )}
      </div>

      <div className="lms-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Progress report</h2>
            <p className="text-sm text-muted-foreground">{progressQuery.data?.totalElements ?? 0} enrollments found.</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={progressQuery.isFetching} onClick={() => void progressQuery.refetch()}>
            <RefreshCw className={`h-4 w-4 ${progressQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {progressQuery.isLoading ? (
          <LoadingState message="Loading student progress..." />
        ) : progressQuery.isError ? (
          <div className="m-5 lms-alert-error">{getFriendlyApiErrorMessage(progressQuery.error, 'Failed to load student progress')}</div>
        ) : rows.length === 0 ? (
          <EmptyState message="No matching students" description="Adjust filters or refresh the report." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Current lesson</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <StudentProgressRow key={row.enrollmentId} row={row} onOpen={() => setSelectedEnrollmentId(row.enrollmentId)} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" disabled={page === 0 || progressQuery.isFetching} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button type="button" variant="outline" disabled={page + 1 >= totalPages || progressQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </div>
      </div>

      <Dialog open={!!selectedEnrollmentId} onOpenChange={(open) => !open && setSelectedEnrollmentId(undefined)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Enrollment progress detail</DialogTitle>
            <DialogDescription>Lesson-level state from the admin report detail endpoint.</DialogDescription>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <LoadingState message="Loading enrollment detail..." />
          ) : detailQuery.isError ? (
            <div className="lms-alert-error">{getFriendlyApiErrorMessage(detailQuery.error, 'Failed to load enrollment detail')}</div>
          ) : (
            <div className="space-y-4">
              {detailQuery.data?.summary && <DetailSummary summary={detailQuery.data.summary} />}
              <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Lesson status</TableHead>
                      <TableHead>Progress status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detailQuery.data?.lessons ?? []).map((lesson) => (
                      <TableRow key={lesson.lessonId}>
                        <TableCell>
                          <p className="font-bold text-foreground">#{lesson.lessonNumber} {lesson.lessonName}</p>
                        </TableCell>
                        <TableCell><StatusPill value={lesson.lessonStatus} /></TableCell>
                        <TableCell><StatusPill value={lesson.progressStatus} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function StudentProgressRow({ row, onOpen }: { row: AdminStudentProgress; onOpen: () => void }) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-bold text-foreground">{row.studentName || `Student #${row.studentId}`}</p>
        <p className="text-sm text-muted-foreground">{row.studentEmail || '-'}</p>
      </TableCell>
      <TableCell>{row.programName || `Program #${row.programId}`}</TableCell>
      <TableCell>
        <div className="space-y-2">
          <EnrollmentStatusBadge status={row.enrollmentStatus} />
          <StatusPill value={row.accountStatus || (row.studentEnabled === false ? 'DISABLED' : 'ACTIVE')} />
        </div>
      </TableCell>
      <TableCell>
        <div className="min-w-32">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-foreground">
            <span>{row.progressPercent ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[hsl(var(--brand-green))]" style={{ width: `${Math.min(Math.max(row.progressPercent ?? 0, 0), 100)}%` }} />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium text-foreground">{row.currentLessonNumber ? `#${row.currentLessonNumber}` : '-'} {row.currentLessonName || ''}</p>
        <p className="text-xs text-muted-foreground">{row.currentLessonStatus || row.nextAction || '-'}</p>
      </TableCell>
      <TableCell>{row.teacherName || 'Unassigned'}</TableCell>
      <TableCell>{row.expiredAt ? formatDateTime(row.expiredAt) : '-'}</TableCell>
      <TableCell className="text-right">
        <Button type="button" variant="outline" size="sm" onClick={onOpen} disabled={!row.enrollmentId}>
          <Eye className="h-4 w-4" />
          Detail
        </Button>
      </TableCell>
    </TableRow>
  )
}

function DetailSummary({ summary }: { summary: AdminStudentProgress }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryTile label="Student" value={summary.studentName || `#${summary.studentId}`} />
      <SummaryTile label="Program" value={summary.programName || `#${summary.programId}`} />
      <SummaryTile label="Next action" value={summary.nextAction || '-'} />
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  )
}

function StatusPill({ value }: { value?: string }) {
  return <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">{formatLabel(value || '-')}</span>
}

function getUserName(user: { firstName?: string; lastName?: string; username?: string; email?: string; id?: number }) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username || user.email || `User #${user.id}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function toNumber(value: string) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
