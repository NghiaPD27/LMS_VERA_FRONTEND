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
import type { AdminTeacher } from '../../types/teacher'
import { useAssignTeacher, useGetAdminTeacher, useGetAdminTeachers } from '../../hooks/useTeacher'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import {
  getEnrollmentAccessBadgeClass,
  getEnrollmentAccessLabel,
  isEnrollmentExpired
} from '../../utils/enrollmentAccess'
import { formatDateTime, formatDateShort } from '../../utils/formatters'
import { CalendarPlus, Search, UserCheck, UserPlus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const getStudentName = (student?: AdminStudent) => {
  if (!student) return 'No student selected'
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()
  return fullName || student.username || `Student #${student.id}`
}

const getProgramName = (program?: Program) => {
  return program?.name || `Program #${program?.id ?? ''}`
}

const getTeacherName = (teacher?: AdminTeacher) => {
  if (!teacher) return 'No teacher selected'
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').trim()
  return fullName || teacher.username || `Teacher #${teacher.id}`
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
  const [extendEnrollment, setExtendEnrollment] = useState<AdminEnrollment | null>(null)
  const [extendMonths, setExtendMonths] = useState('1')
  const [teacherEnrollment, setTeacherEnrollment] = useState<AdminEnrollment | null>(null)

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
      setExtendEnrollment(null)
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
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 sm:flex">
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
            <h2 className="text-base font-extrabold text-white">1. Choose Student</h2>
            <p className="text-xs text-muted-foreground">Search by name, username, or email.</p>
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
            <div className="lms-alert-error">
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
                  className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    selectedStudent?.id === student.id
                      ? 'border-primary bg-primary/15 shadow-[0_0_15px_rgba(244,106,37,0.2)]'
                      : 'border-border bg-slate-900/60 hover:border-primary/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{getStudentName(student)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{student.email || student.username}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      student.enabled === false
                        ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                        : 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                    }`}>
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
            <h2 className="text-base font-extrabold text-white">2. Choose Program</h2>
            <p className="text-xs text-muted-foreground">Search programs and choose target course.</p>
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
            <div className="lms-alert-error">
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
                  className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    selectedProgram?.id === program.id
                      ? 'border-primary bg-primary/15 shadow-[0_0_15px_rgba(244,106,37,0.2)]'
                      : 'border-border bg-slate-900/60 hover:border-primary/40 hover:bg-slate-800/80'
                  }`}
                >
                  <p className="font-bold text-white text-sm">{getProgramName(program)}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-0.5">{program.description || 'No description'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="lms-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-white">3. Enroll</h2>
            <p className="text-xs text-muted-foreground">Confirm selection and enroll in one action.</p>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-slate-900/70 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Student</p>
              <p className="font-bold text-white text-sm mt-0.5">{getStudentName(selectedStudentView || undefined)}</p>
              {selectedStudentView?.email && (
                <p className="text-xs text-muted-foreground">{selectedStudentView.email}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Program</p>
              <p className="font-bold text-white text-sm mt-0.5">
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
            className="mt-4 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)]"
            disabled={!selectedStudent?.id || !selectedProgram?.id || enrollStudentMutation.isPending}
            onClick={handleEnroll}
            data-testid="enroll-selected-student"
          >
            {enrollStudentMutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </Button>

          {selectedStudent && (
            <div className="mt-6 border-t border-border/80 pt-4">
              <h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Current enrollments</h3>
              {selectedStudentEnrollmentsQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">Loading enrollments...</p>
              ) : currentEnrollments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No enrollments yet.</p>
              ) : (
                <div className="space-y-2">
                  {currentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="rounded-xl border border-border bg-slate-900/60 p-3 text-xs">
                      <p className="font-bold text-white">{enrollment.programName || `Program #${enrollment.programId}`}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <EnrollmentStatusBadge status={enrollment.status} />
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getEnrollmentAccessBadgeClass(enrollment)}`}>
                          {getEnrollmentAccessLabel(enrollment)}
                        </span>
                      </div>
                      <dl className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex justify-between gap-2">
                          <dt>Enrolled</dt>
                          <dd className="text-right font-medium text-zinc-300">{formatDateTime(enrollment.enrolledAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Expires</dt>
                          <dd className="text-right font-medium text-zinc-300">{formatDateTime(enrollment.expiredAt)}</dd>
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
            <h2 className="text-lg font-bold text-white">Enrollment Overview</h2>
            <p className="text-xs text-muted-foreground">Review and update status directly from each row.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setAdminPage(0)
              }}
              className="lms-input min-w-[160px] text-xs"
              data-testid="admin-enrollment-status-filter"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
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
          <div className="lms-alert-error">
            {getFriendlyApiErrorMessage(adminEnrollmentsQuery.error, 'Failed to fetch enrollments')}
          </div>
        ) : adminEnrollments.length === 0 ? (
          <EmptyState message="No enrollments found" description="Adjust filters or enroll a student." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-slate-900/60">
            <Table data-testid="admin-enrollments-table" className="w-full text-left border-collapse">
              <TableHeader className="bg-slate-900/90 border-b border-border/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Student</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Program</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Status</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Teacher</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Enrolled</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs py-2.5 px-3">Expires</TableHead>
                  <TableHead className="text-right text-zinc-400 font-bold text-xs py-2.5 px-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {adminEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} data-testid={`admin-enrollment-row-${enrollment.id}`} className="hover:bg-slate-900/80 transition-colors">
                    <TableCell className="py-2.5 px-3">
                      <p className="font-bold text-white text-xs truncate max-w-[150px]">{enrollment.studentName || `Student #${enrollment.studentId}`}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{enrollment.studentEmail || '-'}</p>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-zinc-200 py-2.5 px-3 whitespace-nowrap">
                      {enrollment.programName || `Program #${enrollment.programId}`}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <EnrollmentStatusBadge status={isEnrollmentExpired(enrollment) ? 'EXPIRED' : enrollment.status} />
                    </TableCell>
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                          {enrollment.teacherName || (enrollment.teacherId ? `Teacher #${enrollment.teacherId}` : 'Not assigned')}
                        </p>
                        {enrollment.teacherAssignedAt && (
                          <p className="text-[10px] text-muted-foreground">{formatDateShort(enrollment.teacherAssignedAt)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-zinc-300 py-2.5 px-3 whitespace-nowrap">{formatDateShort(enrollment.enrolledAt)}</TableCell>
                    <TableCell className="text-xs font-medium text-zinc-300 py-2.5 px-3 whitespace-nowrap">{formatDateShort(enrollment.expiredAt)}</TableCell>
                    <TableCell className="text-right py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-semibold border-border hover:border-primary/50 hover:bg-slate-800"
                          disabled={updateEnrollmentMutation.isPending}
                          onClick={() => handleToggleStatus(enrollment)}
                          data-testid={`toggle-enrollment-${enrollment.id}`}
                        >
                          {enrollment.status === 'ACTIVE' ? 'Complete' : 'Activate'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-semibold border-border hover:border-primary/50 hover:bg-slate-800"
                          onClick={() => {
                            setTeacherEnrollment(enrollment)
                            setRowError(null)
                          }}
                          data-testid={`manage-teacher-${enrollment.id}`}
                        >
                          <UserCheck className="h-3 w-3 mr-1 text-primary" />
                          Teacher
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-semibold border-border hover:border-primary/50 hover:bg-slate-800"
                          onClick={() => {
                            setExtendEnrollment(enrollment)
                            setExtendMonths('1')
                            setRowError(null)
                          }}
                          data-testid={`extend-enrollment-${enrollment.id}`}
                        >
                          <CalendarPlus className="h-3 w-3 mr-1 text-emerald-400" />
                          Extend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
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

      <Dialog open={!!extendEnrollment} onOpenChange={(open) => !open && setExtendEnrollment(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border-border bg-[hsl(220_14%_10%)] p-0 text-white shadow-2xl">
          <DialogHeader className="border-b border-border bg-[hsl(220_14%_12%)] px-6 py-4">
            <DialogTitle className="text-white text-base">Extend enrollment</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add access time for this enrollment without changing the table layout.
            </DialogDescription>
          </DialogHeader>
          {extendEnrollment && (
            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-border bg-slate-900/70 p-4 text-xs">
                <TeacherMeta label="Student" value={extendEnrollment.studentName || `Student #${extendEnrollment.studentId ?? '-'}`} />
                <div className="mt-3">
                  <TeacherMeta label="Program" value={extendEnrollment.programName || `Program #${extendEnrollment.programId ?? '-'}`} />
                </div>
                <div className="mt-3">
                  <TeacherMeta label="Current expiry" value={formatDateTime(extendEnrollment.expiredAt)} />
                </div>
              </div>
              <div>
                <label htmlFor="extend-months-modal" className="text-xs font-bold text-white">Months to add</label>
                <input
                  id="extend-months-modal"
                  type="number"
                  min={1}
                  value={extendMonths}
                  onChange={(event) => setExtendMonths(event.target.value)}
                  className="lms-input mt-1"
                  data-testid={`extend-months-${extendEnrollment.id}`}
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setExtendEnrollment(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-primary text-white hover:bg-primary/90 font-bold"
                  disabled={extendEnrollmentMutation.isPending}
                  onClick={() => handleExtendEnrollment(extendEnrollment)}
                  data-testid={`confirm-extend-enrollment-${extendEnrollment.id}`}
                >
                  {extendEnrollmentMutation.isPending ? 'Extending...' : 'Save extension'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!teacherEnrollment} onOpenChange={(open) => !open && setTeacherEnrollment(null)}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-5xl overflow-hidden rounded-xl border-border bg-[hsl(220_14%_10%)] p-0 text-white shadow-2xl">
          <div className="max-h-[92dvh] overflow-y-auto">
            <DialogHeader className="border-b border-border bg-[hsl(220_14%_12%)] px-6 py-4">
              <DialogTitle className="text-white text-base">Teacher assignment</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign one teacher to this enrollment without changing course access or lesson progress.
              </DialogDescription>
            </DialogHeader>
            {teacherEnrollment && (
              <TeacherAssignmentPanel
                enrollment={teacherEnrollment}
                onClose={() => setTeacherEnrollment(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function TeacherAssignmentPanel({ enrollment, onClose }: { enrollment: AdminEnrollment; onClose: () => void }) {
  const [keyword, setKeyword] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const teachersQuery = useGetAdminTeachers({ keyword: keyword || undefined, page: 0, size: 8 }, true)
  const currentTeacherQuery = useGetAdminTeacher(enrollment.teacherId, !!enrollment.teacherId)
  const assignTeacherMutation = useAssignTeacher()

  const teachers = teachersQuery.data?.content ?? []

  const assignTeacher = async () => {
    if (!enrollment.id || !selectedTeacher?.id) return

    try {
      setMessage(null)
      setError(null)
      await assignTeacherMutation.mutateAsync({
        enrollmentId: enrollment.id,
        teacherId: selectedTeacher.id,
      })
      setMessage(`${getTeacherName(selectedTeacher)} assigned to ${enrollment.studentName || `Student #${enrollment.studentId}`}.`)
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err, 'Failed to assign teacher'))
    }
  }

  return (
    <div className="space-y-4 p-6">
      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-slate-900/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enrollment</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <TeacherMeta label="Student" value={enrollment.studentName || `Student #${enrollment.studentId ?? '-'}`} />
            <TeacherMeta label="Program" value={enrollment.programName || `Program #${enrollment.programId ?? '-'}`} />
            <TeacherMeta label="Status" value={enrollment.status || '-'} />
            <TeacherMeta label="Expires" value={formatDateTime(enrollment.expiredAt)} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-slate-900/60 p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-extrabold text-white text-sm">Choose teacher</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Search by name, username, or email.</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-950 px-3 py-2 text-xs">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Current</p>
              <p className="font-extrabold text-white">
                {enrollment.teacherName ||
                  (currentTeacherQuery.data ? getTeacherName(currentTeacherQuery.data) : enrollment.teacherId ? `Teacher #${enrollment.teacherId}` : 'Not assigned yet')}
              </p>
            </div>
          </div>

          <label htmlFor={`teacher-search-${enrollment.id}`} className="text-xs font-bold text-white">
            Search teacher
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id={`teacher-search-${enrollment.id}`}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="lms-input h-9 pl-9 text-xs"
              placeholder="Name or email"
              data-testid={`teacher-search-${enrollment.id}`}
            />
          </div>

          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {teachersQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">Loading teachers...</p>
            ) : teachersQuery.isError ? (
              <p className="text-xs text-rose-400">{getFriendlyApiErrorMessage(teachersQuery.error, 'Failed to load teachers')}</p>
            ) : teachers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No teachers found.</p>
            ) : (
              teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  className={`rounded-xl border p-3 text-left text-xs transition-all duration-150 ${
                    selectedTeacher?.id === teacher.id
                      ? 'border-primary bg-primary/15 text-white font-bold'
                      : 'border-border bg-slate-950 text-muted-foreground hover:border-primary/40 hover:text-white'
                  }`}
                  onClick={() => setSelectedTeacher(teacher)}
                  data-testid={`select-teacher-${teacher.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{getTeacherName(teacher)}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{teacher.email || teacher.username}</p>
                    </div>
                    <span className="rounded-full border border-border bg-slate-900 px-2 py-0.5 text-[9px] font-extrabold text-zinc-300">
                      {teacher.enabled === false ? 'Disabled' : teacher.status || 'Active'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <Button
            type="button"
            className="mt-4 w-full bg-primary text-white font-bold hover:bg-primary/90"
            disabled={!selectedTeacher?.id || assignTeacherMutation.isPending}
            onClick={() => void assignTeacher()}
            data-testid={`assign-teacher-${enrollment.id}`}
          >
            {assignTeacherMutation.isPending ? 'Assigning...' : 'Assign selected teacher'}
          </Button>
        </div>
        {message && <div className="lms-alert-success text-xs">{message}</div>}
        {error && <div className="lms-alert-error text-xs">{error}</div>}

        <Button type="button" variant="outline" className="w-full border-border text-xs sm:w-auto" onClick={onClose}>
          Close
        </Button>
      </section>
    </div>
  )
}

function TeacherMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold text-white text-xs">{value}</p>
    </div>
  )
}
