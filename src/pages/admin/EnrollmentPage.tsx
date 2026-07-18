import React, { useState } from 'react'
import { useGetStudents, useGetStudent, useGetStudentEnrollments } from '../../hooks/useAdminUsers'
import { useEnrollStudent, useExtendEnrollment, useGetAdminEnrollments, useUpdateEnrollment } from '../../hooks/useEnrollments'
import { useGetPrograms } from '../../hooks/usePrograms'
import { Button } from '../../components/common/Button'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { EnrollmentStatusBadge } from '../../components/enrollments/EnrollmentStatusBadge'
import type { AdminEnrollment } from '../../types/enrollment'
import type { Program } from '../../types/program'
import type { AdminStudent } from '../../types/user'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import {
  getEnrollmentAccessBadgeClass,
  getEnrollmentAccessLabel
} from '../../utils/enrollmentAccess'
import { formatDateTime } from '../../utils/formatters'
import { CalendarPlus, Search, UserPlus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const getStudentName = (student?: AdminStudent) => {
  if (!student) return 'No student selected'
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()
  return fullName || student.username || `Student #${student.id}`
}

const getProgramName = (program?: Program) => {
  return program?.name || `Program #${program?.id ?? ''}`
}

export const EnrollmentPage: React.FC = () => {
  const [studentKeyword, setStudentKeyword] = useState('')
  const [programKeyword, setProgramKeyword] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [adminPage, setAdminPage] = useState(0)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)
  const [extendEnrollmentId, setExtendEnrollmentId] = useState<number | null>(null)
  const [extendMonths, setExtendMonths] = useState('1')

  const studentsQuery = useGetStudents({
    keyword: studentKeyword || undefined,
    page: 0,
    size: 8
  })
  const programsQuery = useGetPrograms({
    keyword: programKeyword || undefined,
    page: 0,
    size: 8
  })
  const selectedStudentDetailQuery = useGetStudent(selectedStudent?.id)
  const selectedStudentEnrollmentsQuery = useGetStudentEnrollments(selectedStudent?.id)
  const adminEnrollmentsQuery = useGetAdminEnrollments({
    studentId: selectedStudent?.id ? String(selectedStudent.id) : undefined,
    programId: selectedProgram?.id ? String(selectedProgram.id) : undefined,
    status: statusFilter || undefined,
    page: adminPage,
    size: 10
  })
  const enrollStudentMutation = useEnrollStudent()
  const updateEnrollmentMutation = useUpdateEnrollment()
  const extendEnrollmentMutation = useExtendEnrollment()

  const students = studentsQuery.data?.content ?? []
  const programs = programsQuery.data?.content ?? []
  const currentEnrollments = selectedStudentEnrollmentsQuery.data ?? []
  const adminEnrollments = adminEnrollmentsQuery.data?.content ?? []
  const adminTotalPages = adminEnrollmentsQuery.data?.totalPages ?? 0
  const selectedStudentView = selectedStudentDetailQuery.data || selectedStudent

  const handleSelectStudent = (student: AdminStudent) => {
    setSelectedStudent(student)
    setAdminPage(0)
    setActionMessage(null)
    setActionError(null)
  }

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program)
    setAdminPage(0)
    setActionMessage(null)
    setActionError(null)
  }

  const handleEnroll = async () => {
    if (!selectedStudent?.id || !selectedProgram?.id) return
    try {
      setActionMessage(null)
      setActionError(null)
      await enrollStudentMutation.mutateAsync({
        studentId: selectedStudent.id,
        programId: selectedProgram.id
      })
      setActionMessage(`${getStudentName(selectedStudent)} enrolled in ${getProgramName(selectedProgram)}.`)
      setSelectedProgram(null)
    } catch (err) {
      setActionError(getFriendlyApiErrorMessage(err, 'Failed to enroll student'))
    }
  }

  const handleToggleStatus = async (enrollment: AdminEnrollment) => {
    if (!enrollment.id || !enrollment.status) return
    const nextStatus = enrollment.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE'
    try {
      setRowError(null)
      await updateEnrollmentMutation.mutateAsync({
        id: enrollment.id,
        data: { status: nextStatus }
      })
    } catch (err) {
      setRowError(getFriendlyApiErrorMessage(err, 'Failed to update enrollment'))
    }
  }

  const handleExtendEnrollment = async (enrollment: AdminEnrollment) => {
    if (!enrollment.id) return
    const months = Number(extendMonths)
    if (!Number.isInteger(months) || months < 1) {
      setRowError('Months must be a positive whole number.')
      return
    }

    try {
      setRowError(null)
      await extendEnrollmentMutation.mutateAsync({
        id: enrollment.id,
        data: { months }
      })
      setActionMessage(`${enrollment.programName || `Program #${enrollment.programId}`} access extended by ${months} month${months > 1 ? 's' : ''}.`)
      setExtendEnrollmentId(null)
      setExtendMonths('1')
    } catch (err) {
      setRowError(getFriendlyApiErrorMessage(err, 'Failed to extend enrollment'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Enrollments</h1>
              <p className="lms-section-description">
                Search students, choose a program, and complete enrollment in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_360px]">
        <div className="lms-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">1. Choose Student</h2>
            <p className="text-sm text-muted-foreground">Search by name, username, or email.</p>
          </div>
          <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={studentKeyword}
            onChange={(event) => setStudentKeyword(event.target.value)}
            className="lms-input pl-9"
            placeholder="Search students"
            data-testid="student-search-input"
          />
          </div>
          {studentsQuery.isLoading ? (
            <LoadingState message="Loading students..." />
          ) : studentsQuery.isError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {getFriendlyApiErrorMessage(studentsQuery.error, 'Failed to fetch students')}
            </div>
          ) : students.length === 0 ? (
            <EmptyState message="No students found" description="Try a different keyword." />
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  data-testid={`select-student-${student.id}`}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    selectedStudent?.id === student.id
                      ? 'border-primary bg-[hsl(var(--brand-orange-soft))] shadow-sm'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{getStudentName(student)}</p>
                      <p className="text-sm text-muted-foreground">{student.email || student.username}</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      {student.enabled === false ? 'Disabled' : student.status || 'Active'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lms-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">2. Choose Program</h2>
            <p className="text-sm text-muted-foreground">Search programs and choose the target course.</p>
          </div>
          <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={programKeyword}
            onChange={(event) => setProgramKeyword(event.target.value)}
            className="lms-input pl-9"
            placeholder="Search programs"
            data-testid="program-search-input"
          />
          </div>
          {programsQuery.isLoading ? (
            <LoadingState message="Loading programs..." />
          ) : programsQuery.isError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {getFriendlyApiErrorMessage(programsQuery.error, 'Failed to fetch programs')}
            </div>
          ) : programs.length === 0 ? (
            <EmptyState message="No programs found" description="Try a different keyword." />
          ) : (
            <div className="space-y-2">
              {programs.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  data-testid={`select-program-${program.id}`}
                  onClick={() => handleSelectProgram(program)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    selectedProgram?.id === program.id
                      ? 'border-primary bg-[hsl(var(--brand-orange-soft))] shadow-sm'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-muted/40'
                  }`}
                >
                  <p className="font-medium text-foreground">{getProgramName(program)}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{program.description || 'No description'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="lms-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">3. Enroll</h2>
            <p className="text-sm text-muted-foreground">Confirm the selection and enroll in one action.</p>
          </div>

          <div className="space-y-3 rounded-md border border-border/80 bg-background p-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Student</p>
              <p className="font-semibold text-foreground">{getStudentName(selectedStudentView || undefined)}</p>
              {selectedStudentView?.email && (
                <p className="text-sm text-muted-foreground">{selectedStudentView.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Program</p>
              <p className="font-semibold text-foreground">
                {selectedProgram ? getProgramName(selectedProgram) : 'No program selected'}
              </p>
            </div>
          </div>

          {actionMessage && (
            <div className="mt-4 lms-alert-success" data-testid="enroll-success-message">
              {actionMessage}
            </div>
          )}
          {actionError && (
            <div className="mt-4 lms-alert-error" data-testid="enroll-error-message">
              {actionError}
            </div>
          )}

          <Button
            type="button"
            className="mt-4 w-full"
            disabled={!selectedStudent?.id || !selectedProgram?.id || enrollStudentMutation.isPending}
            onClick={handleEnroll}
            data-testid="enroll-selected-student"
          >
            {enrollStudentMutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </Button>

          {selectedStudent && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Current enrollments</h3>
              {selectedStudentEnrollmentsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading enrollments...</p>
              ) : currentEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments yet.</p>
              ) : (
                <div className="space-y-2">
                  {currentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">{enrollment.programName || `Program #${enrollment.programId}`}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <EnrollmentStatusBadge status={enrollment.status} />
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                          {getEnrollmentAccessLabel(enrollment)}
                        </span>
                      </div>
                      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-2">
                          <dt>Enrolled</dt>
                          <dd className="text-right">{formatDateTime(enrollment.enrolledAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Expires</dt>
                          <dd className="text-right">{formatDateTime(enrollment.expiredAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Enrollment Overview</h2>
            <p className="text-sm text-muted-foreground">Review and update status directly from each row.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setAdminPage(0)
              }}
              className="lms-input min-w-[160px]"
              data-testid="admin-enrollment-status-filter"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedStudent(null)
                setSelectedProgram(null)
                setStatusFilter('')
                setAdminPage(0)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {rowError && (
          <div className="mb-4 lms-alert-error" data-testid="update-enrollment-error">
            {rowError}
          </div>
        )}

        {adminEnrollmentsQuery.isLoading ? (
          <LoadingState message="Loading enrollments..." />
        ) : adminEnrollmentsQuery.isError ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {getFriendlyApiErrorMessage(adminEnrollmentsQuery.error, 'Failed to fetch enrollments')}
          </div>
        ) : adminEnrollments.length === 0 ? (
          <EmptyState message="No enrollments found" description="Adjust filters or enroll a student." />
        ) : (
          <div className="overflow-x-auto">
            <Table data-testid="admin-enrollments-table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id} data-testid={`admin-enrollment-row-${enrollment.id}`}>
                  <TableCell>
                    <p className="font-medium text-foreground">{enrollment.studentName || `Student #${enrollment.studentId}`}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.studentEmail || '-'}</p>
                  </TableCell>
                  <TableCell>{enrollment.programName || `Program #${enrollment.programId}`}</TableCell>
                  <TableCell>
                    <EnrollmentStatusBadge status={enrollment.status} />
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                      {getEnrollmentAccessLabel(enrollment)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(enrollment.enrolledAt)}</TableCell>
                  <TableCell>{formatDateTime(enrollment.expiredAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={updateEnrollmentMutation.isPending}
                          onClick={() => handleToggleStatus(enrollment)}
                          data-testid={`toggle-enrollment-${enrollment.id}`}
                        >
                          Mark {enrollment.status === 'ACTIVE' ? 'Completed' : 'Active'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setExtendEnrollmentId(enrollment.id ?? null)
                            setExtendMonths('1')
                            setRowError(null)
                          }}
                          data-testid={`extend-enrollment-${enrollment.id}`}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Extend
                        </Button>
                      </div>
                      {extendEnrollmentId === enrollment.id && (
                        <div className="flex w-full max-w-xs items-center justify-end gap-2 rounded-md border border-border bg-background p-2">
                          <input
                            type="number"
                            min={1}
                            value={extendMonths}
                            onChange={(event) => setExtendMonths(event.target.value)}
                            className="lms-input h-9 w-20"
                            aria-label="Extension months"
                            data-testid={`extend-months-${enrollment.id}`}
                          />
                          <span className="text-xs text-muted-foreground">months</span>
                          <Button
                            type="button"
                            size="sm"
                            disabled={extendEnrollmentMutation.isPending}
                            onClick={() => handleExtendEnrollment(enrollment)}
                            data-testid={`confirm-extend-enrollment-${enrollment.id}`}
                          >
                            {extendEnrollmentMutation.isPending ? 'Extending...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={adminPage === 0}
            onClick={() => setAdminPage((current) => Math.max(current - 1, 0))}
          >
            Previous
          </Button>
          <span>
            Page {adminPage + 1} / {Math.max(adminTotalPages, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={adminTotalPages === 0 || adminPage >= adminTotalPages - 1}
            onClick={() => setAdminPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}
