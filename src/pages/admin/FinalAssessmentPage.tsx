import { useMemo, useState } from 'react'
import { CalendarClock, ClipboardCheck, Link as LinkIcon, Pencil, Plus, Search, Trash2, Users, XCircle } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetPrograms } from '../../hooks/usePrograms'
import { useGetAdminEvaluators } from '../../hooks/useCheckpoint'
import {
  useAddFinalAssessmentParticipants,
  useCreateFinalAssessmentSession,
  useGetAdminFinalAssessmentSessions,
  useGetFinalAssessmentEligibleStudents,
  useRemoveFinalAssessmentParticipant,
  useUpdateFinalAssessmentSession,
  useUpdateFinalAssessmentSessionStatus,
} from '../../hooks/useFinalAssessment'
import type { AdminEvaluator } from '../../types/checkpoint'
import type { FinalAssessmentEligibleStudent, FinalAssessmentSession } from '../../types/finalAssessment'
import { getFriendlyApiErrorMessage, isConflictError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

const sessionStatusOptions = ['', 'PENDING', 'COMPLETED', 'CANCELLED']

export function FinalAssessmentPage() {
  const [programId, setProgramId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<number[]>([])
  const [evaluatorKeyword, setEvaluatorKeyword] = useState('')
  const [selectedEvaluator, setSelectedEvaluator] = useState<AdminEvaluator | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [existingSessionId, setExistingSessionId] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [editEvaluatorId, setEditEvaluatorId] = useState('')
  const [editScheduledAt, setEditScheduledAt] = useState('')
  const [editMeetLink, setEditMeetLink] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionPage, setSessionPage] = useState(0)
  const [createdSession, setCreatedSession] = useState<FinalAssessmentSession | null>(null)

  const programsQuery = useGetPrograms({ page: 0, size: 100 })
  const eligibleQuery = useGetFinalAssessmentEligibleStudents({
    programId: programId ? Number(programId) : undefined,
    weekStart: weekStart ? new Date(weekStart).toISOString() : undefined,
    weekEnd: weekEnd ? new Date(weekEnd).toISOString() : undefined,
  })
  const evaluatorsQuery = useGetAdminEvaluators({ keyword: evaluatorKeyword || undefined, page: 0, size: 8 })
  const sessionsQuery = useGetAdminFinalAssessmentSessions({
    programId: programId ? Number(programId) : undefined,
    status: statusFilter || undefined,
    weekStart: weekStart ? new Date(weekStart).toISOString() : undefined,
    weekEnd: weekEnd ? new Date(weekEnd).toISOString() : undefined,
    page: sessionPage,
    size: 8,
  })
  const createSessionMutation = useCreateFinalAssessmentSession()
  const addParticipantsMutation = useAddFinalAssessmentParticipants()
  const updateSessionMutation = useUpdateFinalAssessmentSession()
  const updateStatusMutation = useUpdateFinalAssessmentSessionStatus()
  const removeParticipantMutation = useRemoveFinalAssessmentParticipant()

  const programs = programsQuery.data?.content ?? []
  const eligibleStudents = useMemo(() => eligibleQuery.data ?? [], [eligibleQuery.data])
  const evaluators = evaluatorsQuery.data?.content ?? []
  const sessions = sessionsQuery.data?.content ?? []
  const totalSessionPages = sessionsQuery.data?.totalPages ?? 0
  const selectedStudents = useMemo(
    () => eligibleStudents.filter((student) => student.enrollmentId && selectedEnrollmentIds.includes(student.enrollmentId)),
    [eligibleStudents, selectedEnrollmentIds]
  )

  const toggleEnrollment = (student: FinalAssessmentEligibleStudent) => {
    if (!student.enrollmentId) return
    setSelectedEnrollmentIds((current) =>
      current.includes(student.enrollmentId as number)
        ? current.filter((id) => id !== student.enrollmentId)
        : [...current, student.enrollmentId as number]
    )
  }

  const createSession = async () => {
    const formError = validateSessionForm(programId, selectedEvaluator?.id, scheduledAt, meetLink)
    if (formError) {
      setError(formError)
      return
    }

    try {
      setError(null)
      setMessage(null)
      const response = await createSessionMutation.mutateAsync({
        programId: Number(programId),
        evaluatorId: selectedEvaluator?.id as number,
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetLink: meetLink.trim(),
        participantEnrollmentIds: selectedEnrollmentIds,
      })
      setCreatedSession(response)
      setMessage(`Final assessment session #${response.id ?? '-'} created with ${response.participants?.length ?? selectedEnrollmentIds.length} participant(s).`)
      setSelectedEnrollmentIds([])
    } catch (err) {
      setError(getFinalErrorMessage(err, 'Failed to create final assessment session'))
    }
  }

  const addParticipants = async () => {
    const sessionId = Number(existingSessionId)
    if (!Number.isInteger(sessionId) || sessionId < 1) {
      setError('Enter a valid final session ID.')
      return
    }
    if (selectedEnrollmentIds.length === 0) {
      setError('Select at least one eligible student.')
      return
    }

    try {
      setError(null)
      setMessage(null)
      const response = await addParticipantsMutation.mutateAsync({
        sessionId,
        data: { enrollmentIds: selectedEnrollmentIds },
      })
      setCreatedSession(response)
      setMessage(`Added ${selectedEnrollmentIds.length} participant(s) to final session #${response.id ?? sessionId}.`)
      setSelectedEnrollmentIds([])
    } catch (err) {
      setError(getFinalErrorMessage(err, 'Failed to add final assessment participants'))
    }
  }

  const startEditing = (session: FinalAssessmentSession) => {
    setEditingSessionId(session.id ?? null)
    setEditEvaluatorId(session.evaluatorId ? String(session.evaluatorId) : '')
    setEditScheduledAt(toDateTimeLocalValue(session.scheduledAt))
    setEditMeetLink(session.meetLink || '')
    setError(null)
    setMessage(null)
  }

  const saveSessionEdit = async (session: FinalAssessmentSession) => {
    if (!session.id) return
    const nextEvaluatorId = Number(editEvaluatorId)
    if (!Number.isInteger(nextEvaluatorId) || nextEvaluatorId < 1) {
      setError('Enter a valid evaluator ID.')
      return
    }
    if (!editScheduledAt || !editMeetLink.trim()) {
      setError('Scheduled time and Meet link are required.')
      return
    }

    try {
      setError(null)
      setMessage(null)
      const response = await updateSessionMutation.mutateAsync({
        sessionId: session.id,
        data: {
          evaluatorId: nextEvaluatorId,
          scheduledAt: new Date(editScheduledAt).toISOString(),
          meetLink: editMeetLink.trim(),
        },
      })
      setCreatedSession(response)
      setEditingSessionId(null)
      setMessage(`Final session #${response.id ?? session.id} updated.`)
    } catch (err) {
      setError(getFinalErrorMessage(err, 'Failed to update final assessment session'))
    }
  }

  const cancelSession = async (session: FinalAssessmentSession) => {
    if (!session.id) return
    try {
      setError(null)
      setMessage(null)
      const response = await updateStatusMutation.mutateAsync({
        sessionId: session.id,
        data: { status: 'CANCELLED' },
      })
      setCreatedSession(response)
      setMessage(`Final session #${response.id ?? session.id} cancelled.`)
    } catch (err) {
      setError(getFinalErrorMessage(err, 'Failed to cancel final assessment session'))
    }
  }

  const removeParticipant = async (session: FinalAssessmentSession, participantId?: number) => {
    if (!session.id || !participantId) return
    try {
      setError(null)
      setMessage(null)
      const response = await removeParticipantMutation.mutateAsync({ sessionId: session.id, participantId })
      setCreatedSession(response)
      setMessage(`Participant removed from final session #${session.id}.`)
    } catch (err) {
      setError(getFinalErrorMessage(err, 'Failed to remove final assessment participant'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Final Assessment Sessions</h1>
              <p className="lms-section-description">Group final-ready students, schedule evaluator rooms, and manage retake participants.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <div className="lms-surface p-5">
            <FinalFilters
              programs={programs}
              programId={programId}
              statusFilter={statusFilter}
              weekStart={weekStart}
              weekEnd={weekEnd}
              onProgramIdChange={(value) => {
                setProgramId(value)
                setSessionPage(0)
              }}
              onStatusFilterChange={(value) => {
                setStatusFilter(value)
                setSessionPage(0)
              }}
              onWeekStartChange={setWeekStart}
              onWeekEndChange={setWeekEnd}
            />

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold text-foreground">Eligible students</h2>
                <p className="text-sm text-muted-foreground">{selectedEnrollmentIds.length} selected for final assessment grouping.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => void eligibleQuery.refetch()} disabled={eligibleQuery.isFetching}>
                <Search className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {eligibleQuery.isLoading ? (
              <LoadingState message="Loading final-ready students..." />
            ) : eligibleQuery.isError ? (
              <div className="lms-alert-error">{getFriendlyApiErrorMessage(eligibleQuery.error, 'Failed to load final assessment eligible students')}</div>
            ) : eligibleStudents.length === 0 ? (
              <EmptyState message="No final-ready students" description="Adjust program or week filters." />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {eligibleStudents.map((student) => (
                  <EligibleFinalStudentCard
                    key={`${student.enrollmentId}-${student.retakePaymentId ?? 'first'}`}
                    student={student}
                    selected={!!student.enrollmentId && selectedEnrollmentIds.includes(student.enrollmentId)}
                    onToggle={() => toggleEnrollment(student)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lms-surface p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold text-foreground">Final session management</h2>
                <p className="text-sm text-muted-foreground">Edit, cancel, or remove participants only while the session has no submitted results.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => void sessionsQuery.refetch()} disabled={sessionsQuery.isFetching}>
                <Search className="h-4 w-4" />
                Refresh sessions
              </Button>
            </div>

            {sessionsQuery.isLoading ? (
              <LoadingState message="Loading final sessions..." />
            ) : sessionsQuery.isError ? (
              <div className="lms-alert-error">{getFriendlyApiErrorMessage(sessionsQuery.error, 'Failed to load final assessment sessions')}</div>
            ) : sessions.length === 0 ? (
              <EmptyState message="No final sessions" description="Create a session or adjust filters." />
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <AdminFinalSessionCard
                    key={session.id}
                    session={session}
                    editing={editingSessionId === session.id}
                    editEvaluatorId={editEvaluatorId}
                    editScheduledAt={editScheduledAt}
                    editMeetLink={editMeetLink}
                    onEditEvaluatorIdChange={setEditEvaluatorId}
                    onEditScheduledAtChange={setEditScheduledAt}
                    onEditMeetLinkChange={setEditMeetLink}
                    onStartEditing={() => startEditing(session)}
                    onCancelEditing={() => setEditingSessionId(null)}
                    onSaveEdit={() => void saveSessionEdit(session)}
                    onCancelSession={() => void cancelSession(session)}
                    onRemoveParticipant={(participantId) => void removeParticipant(session, participantId)}
                    isBusy={updateSessionMutation.isPending || updateStatusMutation.isPending || removeParticipantMutation.isPending}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Button type="button" variant="outline" size="sm" disabled={sessionPage === 0} onClick={() => setSessionPage((current) => Math.max(current - 1, 0))}>
                Previous
              </Button>
              <span>Page {sessionPage + 1} / {Math.max(totalSessionPages, 1)}</span>
              <Button type="button" variant="outline" size="sm" disabled={totalSessionPages === 0 || sessionPage >= totalSessionPages - 1} onClick={() => setSessionPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <aside className="lms-surface h-fit p-5">
          <div className="mb-4">
            <h2 className="font-extrabold text-foreground">Create final session</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use selected students as participants for one final assessment room.</p>
          </div>

          <EvaluatorPicker
            evaluators={evaluators}
            keyword={evaluatorKeyword}
            selectedEvaluator={selectedEvaluator}
            isLoading={evaluatorsQuery.isLoading}
            isError={evaluatorsQuery.isError}
            error={evaluatorsQuery.error}
            onKeywordChange={setEvaluatorKeyword}
            onSelect={setSelectedEvaluator}
          />

          <div className="mt-4 space-y-3">
            <Field label="Scheduled time" value={scheduledAt} onChange={setScheduledAt} type="datetime-local" testId="final-scheduled-at" icon={<CalendarClock className="h-4 w-4" />} />
            <Field label="Google Meet link" value={meetLink} onChange={setMeetLink} testId="final-meet-link" icon={<LinkIcon className="h-4 w-4" />} />
          </div>

          <Button type="button" className="mt-4 w-full" disabled={createSessionMutation.isPending} onClick={() => void createSession()} data-testid="create-final-session">
            <Plus className="h-4 w-4" />
            {createSessionMutation.isPending ? 'Creating...' : 'Create session'}
          </Button>

          <div className="mt-5 border-t border-border pt-4">
            <h3 className="font-extrabold text-foreground">Add to existing session</h3>
            <p className="mt-1 text-sm text-muted-foreground">Select students first, then enter an existing session ID.</p>
            <Field label="Session ID" value={existingSessionId} onChange={setExistingSessionId} type="number" testId="final-existing-session-id" />
            <Button type="button" variant="outline" className="mt-3 w-full" disabled={addParticipantsMutation.isPending} onClick={() => void addParticipants()} data-testid="add-final-participants">
              <Users className="h-4 w-4" />
              {addParticipantsMutation.isPending ? 'Adding...' : 'Add participants'}
            </Button>
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-5 rounded-lg border border-border bg-background p-3">
              <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Selected</p>
              <div className="mt-2 space-y-1 text-sm font-semibold text-foreground">
                {selectedStudents.map((student) => (
                  <p key={student.enrollmentId}>{student.studentName || `Enrollment #${student.enrollmentId}`}</p>
                ))}
              </div>
            </div>
          )}

          {createdSession && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Session #{createdSession.id ?? '-'} - {createdSession.evaluatorName || `Evaluator #${createdSession.evaluatorId ?? '-'}`}
            </div>
          )}
          {message && <div className="mt-4 lms-alert-success">{message}</div>}
          {error && <div className="mt-4 lms-alert-error">{error}</div>}
        </aside>
      </div>
    </section>
  )
}

function FinalFilters({
  programs,
  programId,
  statusFilter,
  weekStart,
  weekEnd,
  onProgramIdChange,
  onStatusFilterChange,
  onWeekStartChange,
  onWeekEndChange,
}: {
  programs: Array<{ id?: number; name?: string }>
  programId: string
  statusFilter: string
  weekStart: string
  weekEnd: string
  onProgramIdChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onWeekStartChange: (value: string) => void
  onWeekEndChange: (value: string) => void
}) {
  return (
    <div className="mb-5 grid gap-3 md:grid-cols-4">
      <div>
        <label htmlFor="final-program" className="text-sm font-bold text-foreground">Program</label>
        <select id="final-program" value={programId} onChange={(event) => onProgramIdChange(event.target.value)} className="lms-input mt-1">
          <option value="">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>{program.name || `Program #${program.id}`}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="final-status" className="text-sm font-bold text-foreground">Status</label>
        <select id="final-status" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="lms-input mt-1">
          {sessionStatusOptions.map((status) => (
            <option key={status || 'all'} value={status}>{status || 'All statuses'}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="final-week-start" className="text-sm font-bold text-foreground">Week start</label>
        <input id="final-week-start" type="datetime-local" value={weekStart} onChange={(event) => onWeekStartChange(event.target.value)} className="lms-input mt-1" />
      </div>
      <div>
        <label htmlFor="final-week-end" className="text-sm font-bold text-foreground">Week end</label>
        <input id="final-week-end" type="datetime-local" value={weekEnd} onChange={(event) => onWeekEndChange(event.target.value)} className="lms-input mt-1" />
      </div>
    </div>
  )
}

function EligibleFinalStudentCard({
  student,
  selected,
  onToggle,
}: {
  student: FinalAssessmentEligibleStudent
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={`rounded-lg border p-4 text-left transition ${
        selected
          ? 'border-primary bg-[hsl(var(--brand-orange-soft))] text-foreground shadow-sm'
          : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
      onClick={onToggle}
      data-testid={`select-final-student-${student.enrollmentId}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-foreground">{student.studentName || `Student #${student.studentId ?? '-'}`}</p>
          <p className="mt-1 text-sm">{student.programName || `Program #${student.programId ?? '-'}`}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${student.retake ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {student.retake ? 'Retake' : 'First attempt'}
        </span>
      </div>
      <dl className="mt-3 grid gap-1 text-xs">
        <div className="flex justify-between gap-2"><dt>Final lesson</dt><dd>{student.finalLessonNumber ?? '-'} - {student.finalLessonName || '-'}</dd></div>
        <div className="flex justify-between gap-2"><dt>Eligible</dt><dd className="text-right">{formatDateTime(student.eligibleAt)}</dd></div>
        {student.retakePaymentId && <div className="flex justify-between gap-2"><dt>Retake payment</dt><dd>#{student.retakePaymentId}</dd></div>}
      </dl>
    </button>
  )
}

function EvaluatorPicker({
  evaluators,
  keyword,
  selectedEvaluator,
  isLoading,
  isError,
  error,
  onKeywordChange,
  onSelect,
}: {
  evaluators: AdminEvaluator[]
  keyword: string
  selectedEvaluator: AdminEvaluator | null
  isLoading: boolean
  isError: boolean
  error: unknown
  onKeywordChange: (value: string) => void
  onSelect: (evaluator: AdminEvaluator) => void
}) {
  return (
    <div>
      <label htmlFor="final-evaluator-search" className="text-sm font-bold text-foreground">Evaluator</label>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="final-evaluator-search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          className="lms-input pl-9"
          placeholder="Search evaluator"
          data-testid="final-evaluator-search"
        />
      </div>
      <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading evaluators...</p>
        ) : isError ? (
          <p className="text-sm text-red-700">{getFriendlyApiErrorMessage(error, 'Failed to load evaluators')}</p>
        ) : evaluators.length === 0 ? (
          <p className="text-sm text-muted-foreground">No evaluators found.</p>
        ) : (
          evaluators.map((evaluator) => (
            <button
              key={evaluator.id}
              type="button"
              className={`rounded-md border p-2 text-left text-sm transition ${
                selectedEvaluator?.id === evaluator.id
                  ? 'border-primary bg-[hsl(var(--brand-orange-soft))] text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
              onClick={() => onSelect(evaluator)}
              data-testid={`select-final-evaluator-${evaluator.id}`}
            >
              <p className="font-bold">{getEvaluatorName(evaluator)}</p>
              <p className="text-xs">{evaluator.email || evaluator.username}</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function AdminFinalSessionCard({
  session,
  editing,
  editEvaluatorId,
  editScheduledAt,
  editMeetLink,
  onEditEvaluatorIdChange,
  onEditScheduledAtChange,
  onEditMeetLinkChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onCancelSession,
  onRemoveParticipant,
  isBusy,
}: {
  session: FinalAssessmentSession
  editing: boolean
  editEvaluatorId: string
  editScheduledAt: string
  editMeetLink: string
  onEditEvaluatorIdChange: (value: string) => void
  onEditScheduledAtChange: (value: string) => void
  onEditMeetLinkChange: (value: string) => void
  onStartEditing: () => void
  onCancelEditing: () => void
  onSaveEdit: () => void
  onCancelSession: () => void
  onRemoveParticipant: (participantId?: number) => void
  isBusy: boolean
}) {
  const hasResult = session.participants?.some((participant) => participant.result)
  const canManage = session.canManage ?? (session.status === 'PENDING' && !hasResult)
  const participantCount = session.participantCount ?? session.participants?.length ?? 0
  const resultSubmittedCount = session.resultSubmittedCount ?? session.participants?.filter((participant) => participant.result).length ?? 0

  return (
    <article className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">Final session #{session.id ?? '-'}</p>
          <h3 className="mt-1 text-lg font-extrabold text-foreground">{session.programName || `Program #${session.programId ?? '-'}`}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.evaluatorName || `Evaluator #${session.evaluatorId ?? '-'}`} - {formatDateTime(session.scheduledAt)}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {resultSubmittedCount}/{participantCount} results submitted
          </p>
        </div>
        <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-foreground">
          {session.status || 'PENDING'}
        </span>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[160px_1fr_1fr_auto] lg:items-end">
          <Field label="Evaluator ID" value={editEvaluatorId} onChange={onEditEvaluatorIdChange} type="number" testId={`edit-final-evaluator-${session.id}`} />
          <Field label="Scheduled time" value={editScheduledAt} onChange={onEditScheduledAtChange} type="datetime-local" testId={`edit-final-scheduled-${session.id}`} />
          <Field label="Meet link" value={editMeetLink} onChange={onEditMeetLinkChange} testId={`edit-final-meet-${session.id}`} />
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={isBusy} onClick={onSaveEdit} data-testid={`save-final-session-${session.id}`}>Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={onCancelEditing}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={!canManage || isBusy} onClick={onStartEditing}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!canManage || isBusy} onClick={onCancelSession} data-testid={`cancel-final-session-${session.id}`}>
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}

      <div className="mt-4 grid gap-2">
        {(session.participants ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No participants yet.</p>
        ) : (
          session.participants?.map((participant) => (
            <div key={participant.id} className="flex flex-col gap-2 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-foreground">{participant.studentName || `Student #${participant.studentId ?? '-'}`}</p>
                <p className="text-xs text-muted-foreground">
                  Enrollment #{participant.enrollmentId ?? '-'} - {participant.retake ? `Retake payment #${participant.retakePaymentId ?? '-'}` : 'First attempt'} - {participant.result?.result ? `Result ${participant.result.result}` : 'No result yet'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canManage || isBusy}
                onClick={() => onRemoveParticipant(participant.id)}
                data-testid={`remove-final-participant-${participant.id}`}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  testId,
  icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  testId: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <div className="relative mt-1">
        {icon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`lms-input ${icon ? 'pl-9' : ''}`}
          data-testid={testId}
        />
      </div>
    </div>
  )
}

function validateSessionForm(programId: string, evaluatorId: number | undefined, scheduledAt: string, meetLink: string) {
  if (!programId) return 'Choose a program before creating a final assessment session.'
  if (!evaluatorId) return 'Choose an evaluator.'
  if (!scheduledAt) return 'Choose a scheduled time.'
  if (!meetLink.trim()) return 'Google Meet link is required.'
  return null
}

function getFinalErrorMessage(error: unknown, fallback: string) {
  if (isConflictError(error)) {
    return getFriendlyApiErrorMessage(error, 'One or more enrollments already passed, have a pending final session, are duplicate participants, or already have results.')
  }

  return getFriendlyApiErrorMessage(error, fallback)
}

function getEvaluatorName(evaluator: AdminEvaluator) {
  return [evaluator.firstName, evaluator.lastName].filter(Boolean).join(' ').trim() || evaluator.username || `Evaluator #${evaluator.id ?? '-'}`
}

function toDateTimeLocalValue(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}
