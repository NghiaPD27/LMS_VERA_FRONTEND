import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Award, CheckCircle2, ExternalLink, Send } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetEvaluatorFinalAssessmentSession, useGetEvaluatorFinalAssessmentSessions, useSubmitFinalAssessmentResult } from '../../hooks/useFinalAssessment'
import type { FinalAssessmentParticipant, FinalAssessmentResultValue, FinalAssessmentSession } from '../../types/finalAssessment'
import { getFriendlyApiErrorMessage, isConflictError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

export function EvaluatorFinalAssessmentPage() {
  const sessionsQuery = useGetEvaluatorFinalAssessmentSessions()
  const sessions = sessionsQuery.data ?? []

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] sm:flex">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">Final Assessment Reviews</h1>
              <p className="lms-section-description">Submit PASS or NOT_PASS for each assigned final assessment participant.</p>
            </div>
          </div>
        </div>
      </div>

      {sessionsQuery.isLoading ? (
        <LoadingState message="Loading final assessment sessions..." />
      ) : sessionsQuery.isError ? (
        <div className="lms-alert-error">{getFriendlyApiErrorMessage(sessionsQuery.error, 'Failed to load final assessment sessions')}</div>
      ) : sessions.length === 0 ? (
        <EmptyState message="No final sessions" description="No final assessment rooms have been assigned to you yet." />
      ) : (
        <div className="grid gap-5">
          {sessions.map((session) => (
            <FinalSessionCard key={session.id} session={session} showDetailLink />
          ))}
        </div>
      )}
    </section>
  )
}

export function EvaluatorFinalAssessmentDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const id = Number(sessionId)
  const sessionQuery = useGetEvaluatorFinalAssessmentSession(id, Number.isInteger(id) && id > 0)

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div>
            <Button asChild variant="ghost" className="mb-2 h-auto p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground">
              <Link to="/evaluator/finals">Back to final assessments</Link>
            </Button>
            <h1 className="lms-section-title">Final Assessment Detail</h1>
            <p className="lms-section-description">Review participants in this assigned final assessment room.</p>
          </div>
        </div>
      </div>

      {sessionQuery.isLoading ? (
        <LoadingState message="Loading final assessment session..." />
      ) : sessionQuery.isError ? (
        <div className="lms-alert-error">{getFriendlyApiErrorMessage(sessionQuery.error, 'Failed to load final assessment session')}</div>
      ) : sessionQuery.data ? (
        <FinalSessionCard session={sessionQuery.data} />
      ) : null}
    </section>
  )
}

function FinalSessionCard({ session, showDetailLink = false }: { session: FinalAssessmentSession; showDetailLink?: boolean }) {
  const participants = session.participants ?? []

  return (
    <article className="lms-surface overflow-hidden">
      <div className="border-b border-border bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-primary">Final assessment</p>
            <h2 className="mt-1 text-xl font-extrabold text-foreground">{session.programName || `Program #${session.programId ?? '-'}`}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {session.resultSubmittedCount ?? participants.filter((participant) => participant.result).length}/{session.participantCount ?? participants.length} results submitted
            </p>
          </div>
          <div className="text-sm text-muted-foreground lg:text-right">
            <p className="font-bold text-foreground">{formatDateTime(session.scheduledAt)}</p>
            {session.meetLink && (
              <a className="mt-1 inline-flex items-center gap-1 font-bold text-primary hover:underline" href={session.meetLink} target="_blank" rel="noreferrer">
                Open Meet
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {showDetailLink && session.id && (
              <Link className="mt-1 block font-bold text-[hsl(var(--brand-green))] hover:underline" to={`/evaluator/finals/${session.id}`}>
                View detail
              </Link>
            )}
          </div>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="p-5">
          <EmptyState message="No participants" description="Admin has not added participants to this session yet." />
        </div>
      ) : (
        <div className="grid gap-3 p-5">
          {participants.map((participant) => (
            <FinalParticipantReview key={participant.id} participant={participant} />
          ))}
        </div>
      )}
    </article>
  )
}

function FinalParticipantReview({ participant }: { participant: FinalAssessmentParticipant }) {
  const submitResultMutation = useSubmitFinalAssessmentResult()
  const [result, setResult] = useState<FinalAssessmentResultValue>('PASS')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const alreadyReviewed = !!participant.result

  const submitResult = async () => {
    if (!participant.id) return

    try {
      setMessage(null)
      setError(null)
      const response = await submitResultMutation.mutateAsync({
        participantId: participant.id,
        result,
        comment: comment.trim() || undefined,
      })
      setMessage(`Final result saved as ${response.result || result}.`)
      setComment('')
    } catch (err) {
      const fallback = isConflictError(err)
        ? 'This participant already has a final result or is no longer eligible.'
        : 'Failed to submit final assessment result'
      setError(getFriendlyApiErrorMessage(err, fallback))
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-extrabold text-foreground">{participant.studentName || `Student #${participant.studentId ?? '-'}`}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enrollment #{participant.enrollmentId ?? '-'} - {participant.retake ? `Retake payment #${participant.retakePaymentId ?? '-'}` : 'First attempt'} - added {formatDateTime(participant.addedAt)}
          </p>
        </div>
        {participant.result && (
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
            {participant.result.result || 'REVIEWED'}
          </span>
        )}
      </div>

      {alreadyReviewed ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-extrabold">Final result submitted</p>
          <p className="mt-1">This result is final once submitted.</p>
          {participant.result?.comment && <p className="mt-1">{participant.result.comment}</p>}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-[160px_1fr_auto] lg:items-start">
          <select value={result} onChange={(event) => setResult(event.target.value as FinalAssessmentResultValue)} className="lms-input" data-testid={`final-result-${participant.id}`}>
            <option value="PASS">PASS</option>
            <option value="NOT_PASS">NOT_PASS</option>
          </select>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="lms-input min-h-24"
            maxLength={1000}
            placeholder="Optional evaluator comment"
            data-testid={`final-comment-${participant.id}`}
          />
          <Button type="button" disabled={submitResultMutation.isPending} onClick={() => void submitResult()} data-testid={`submit-final-result-${participant.id}`}>
            <Send className="h-4 w-4" />
            {submitResultMutation.isPending ? 'Saving...' : 'Submit result'}
          </Button>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
