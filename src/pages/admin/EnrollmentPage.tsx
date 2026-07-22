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
import type { TeacherProfile } from '../../types/user'
import { useAssignTeacher, useGetAdminTeachers, useGetTeacherEarnings, useUpsertTeacherCompensation } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import {
  getEnrollmentAccessBadgeClass,
  getEnrollmentAccessLabel
} from '../../utils/enrollmentAccess'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { CalendarPlus, DollarSign, ReceiptText, Search, UserCheck, UserPlus } from 'lucide-react'
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

const getTeacherName = (teacher?: TeacherProfile) => {
  if (!teacher) return 'No teacher selected'
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').trim()
  return fullName || teacher.username || `Teacher #${teacher.userId}`
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
                      <TeacherAssignmentPanel enrollment={enrollment} />
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

function TeacherAssignmentPanel({ enrollment }: { enrollment: AdminEnrollment }) {
  const [expanded, setExpanded] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null)
  const [compensationAmount, setCompensationAmount] = useState('')
  const [compensationCurrency, setCompensationCurrency] = useState('VND')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const teacherIdForEarnings = selectedTeacher?.userId || enrollment.teacherId
  const teachersQuery = useGetAdminTeachers({ keyword: keyword || undefined, page: 0, size: 6 }, expanded)
  const earningsQuery = useGetTeacherEarnings(teacherIdForEarnings, expanded && !!teacherIdForEarnings)
  const assignTeacherMutation = useAssignTeacher()
  const compensationMutation = useUpsertTeacherCompensation()

  const teachers = teachersQuery.data?.content ?? []

  const assignTeacher = async () => {
    if (!enrollment.id || !selectedTeacher?.userId) return

    try {
      setMessage(null)
      setError(null)
      await assignTeacherMutation.mutateAsync({
        enrollmentId: enrollment.id,
        teacherId: selectedTeacher.userId,
      })
      setMessage(`${getTeacherName(selectedTeacher)} assigned to ${enrollment.studentName || `Student #${enrollment.studentId}`}.`)
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err, 'Failed to assign teacher'))
    }
  }

  const saveCompensation = async () => {
    const teacherId = selectedTeacher?.userId || enrollment.teacherId
    const amountPerSession = Number(compensationAmount)

    if (!teacherId) {
      setError('Choose a teacher before saving compensation.')
      return
    }

    if (!Number.isFinite(amountPerSession) || amountPerSession < 0) {
      setError('Compensation must be zero or greater.')
      return
    }

    try {
      setMessage(null)
      setError(null)
      await compensationMutation.mutateAsync({
        teacherId,
        data: {
          amountPerSession,
          currency: compensationCurrency || 'VND',
        },
      })
      setMessage(`Compensation saved for ${selectedTeacher ? getTeacherName(selectedTeacher) : enrollment.teacherName || `Teacher #${teacherId}`}.`)
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err, 'Failed to save teacher compensation'))
    }
  }

  return (
    <div className="w-full max-w-md text-left">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center"
        onClick={() => setExpanded((current) => !current)}
        data-testid={`manage-teacher-${enrollment.id}`}
      >
        <UserCheck className="h-4 w-4" />
        Teacher assignment
      </Button>

      {expanded && (
        <div className="mt-2 rounded-lg border border-border bg-white p-3 shadow-sm">
          <div className="mb-3 rounded-md border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Current teacher</p>
            <p className="mt-1 font-extrabold text-foreground">
              {enrollment.teacherName || (enrollment.teacherId ? `Teacher #${enrollment.teacherId}` : 'Not assigned yet')}
            </p>
            {enrollment.teacherAssignedAt && (
              <p className="mt-1 text-xs text-muted-foreground">Assigned {formatDateTime(enrollment.teacherAssignedAt)}</p>
            )}
          </div>

          <label htmlFor={`teacher-search-${enrollment.id}`} className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
            Search teacher
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id={`teacher-search-${enrollment.id}`}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="lms-input h-9 pl-9 text-sm"
              placeholder="Name or email"
              data-testid={`teacher-search-${enrollment.id}`}
            />
          </div>

          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto">
            {teachersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading teachers...</p>
            ) : teachersQuery.isError ? (
              <p className="text-sm text-red-700">{getFriendlyApiErrorMessage(teachersQuery.error, 'Failed to load teachers')}</p>
            ) : teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teachers found.</p>
            ) : (
              teachers.map((teacher) => (
                <button
                  key={teacher.userId}
                  type="button"
                  className={`rounded-md border p-2 text-left text-sm transition ${
                    selectedTeacher?.userId === teacher.userId
                      ? 'border-primary bg-[hsl(var(--brand-orange-soft))] text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                  onClick={() => setSelectedTeacher(teacher)}
                  data-testid={`select-teacher-${teacher.userId}`}
                >
                  <p className="font-bold">{getTeacherName(teacher)}</p>
                  <p className="text-xs">{teacher.email || teacher.username}</p>
                </button>
              ))
            )}
          </div>

          <Button
            type="button"
            className="mt-3 w-full"
            size="sm"
            disabled={!selectedTeacher?.userId || assignTeacherMutation.isPending}
            onClick={() => void assignTeacher()}
            data-testid={`assign-teacher-${enrollment.id}`}
          >
            {assignTeacherMutation.isPending ? 'Assigning...' : 'Assign selected teacher'}
          </Button>

          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground">
              <DollarSign className="h-4 w-4" />
              Compensation
            </div>
            <div className="grid grid-cols-[1fr_86px] gap-2">
              <input
                type="number"
                min={0}
                value={compensationAmount}
                onChange={(event) => setCompensationAmount(event.target.value)}
                className="lms-input h-9 text-sm"
                placeholder="Amount/session"
                data-testid={`teacher-compensation-amount-${enrollment.id}`}
              />
              <input
                value={compensationCurrency}
                onChange={(event) => setCompensationCurrency(event.target.value.toUpperCase())}
                className="lms-input h-9 text-sm"
                placeholder="VND"
                data-testid={`teacher-compensation-currency-${enrollment.id}`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              size="sm"
              disabled={compensationMutation.isPending}
              onClick={() => void saveCompensation()}
              data-testid={`save-teacher-compensation-${enrollment.id}`}
            >
              {compensationMutation.isPending ? 'Saving...' : 'Save compensation'}
            </Button>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground">
              <ReceiptText className="h-4 w-4" />
              Earnings
            </div>
            {!teacherIdForEarnings ? (
              <p className="text-sm text-muted-foreground">Choose or assign a teacher to view earnings.</p>
            ) : earningsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading earnings...</p>
            ) : earningsQuery.isError ? (
              <p className="text-sm text-red-700">{getFriendlyApiErrorMessage(earningsQuery.error, 'Failed to load earnings')}</p>
            ) : (
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Total earned</p>
                <p className="mt-1 text-lg font-extrabold text-foreground">
                  {formatCurrency(earningsQuery.data?.totalEarned ?? 0, earningsQuery.data?.currency || 'VND')}
                </p>
                <div className="mt-3 max-h-36 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                  {(earningsQuery.data?.earnings || []).length === 0 ? (
                    <p>No earnings yet.</p>
                  ) : (
                    earningsQuery.data?.earnings?.map((earning) => (
                      <div key={earning.id || earning.bookingId} className="rounded border border-border bg-white p-2">
                        <p className="font-bold text-foreground">
                          {formatCurrency(earning.amount ?? 0, earning.currency || earningsQuery.data?.currency || 'VND')}
                        </p>
                        <p>{earning.lessonName || `Lesson #${earning.lessonId ?? '-'}`}</p>
                        <p>{formatDateTime(earning.earnedAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {message && <div className="mt-3 lms-alert-success text-sm">{message}</div>}
          {error && <div className="mt-3 lms-alert-error text-sm">{error}</div>}
        </div>
      )}
    </div>
  )
}
