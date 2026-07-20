import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, HelpCircle, RotateCcw, Send, Trophy } from 'lucide-react'
import { Button } from '../common/Button'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import type { QuizAttempt, QuizQuestion } from '../../types/quiz'
import { useGetLessonQuiz, useStartQuizAttempt, useSubmitQuizAttempt } from '../../hooks/useQuiz'
import { getFriendlyApiErrorMessage, isForbiddenError, isNotFoundError } from '../../utils/errorMessage'
import { formatLessonProgressStatus } from '../../utils/lessonProgress'

interface StudentQuizPanelProps {
  lessonId?: number
  enabled: boolean
}

export function StudentQuizPanel({ lessonId, enabled }: StudentQuizPanelProps) {
  const quizQuery = useGetLessonQuiz(lessonId, enabled)
  const startAttemptMutation = useStartQuizAttempt()
  const submitAttemptMutation = useSubmitQuizAttempt()
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => {
    setAttempt(null)
    setSubmittedAttempt(null)
    setAnswers({})
    setClientError(null)
  }, [lessonId, enabled])

  const questions = useMemo(
    () =>
      (quizQuery.data?.questions || [])
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    [quizQuery.data?.questions]
  )

  const isAllAnswered = questions.length > 0 && questions.every((question) => question.id && answers[question.id])

  const startAttempt = async () => {
    if (!quizQuery.data?.id) return

    try {
      setClientError(null)
      setAnswers({})
      setSubmittedAttempt(null)
      const nextAttempt = await startAttemptMutation.mutateAsync(quizQuery.data.id)
      setAttempt(nextAttempt)
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to start quiz attempt'))
    }
  }

  const submitAttempt = async () => {
    if (!attempt?.id) return

    if (!isAllAnswered) {
      setClientError('Answer every question before submitting.')
      return
    }

    try {
      setClientError(null)
      const response = await submitAttemptMutation.mutateAsync({
        attemptId: attempt.id,
        data: {
          answers: questions.map((question) => ({
            questionId: question.id as number,
            selectedOptionId: answers[question.id as number],
          })),
        },
      })
      setSubmittedAttempt(response)
      setAttempt(response)
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to submit quiz'))
    }
  }

  if (!enabled) {
    return (
      <section className="border-t border-border bg-[hsl(var(--brand-green-soft))]/60 p-5">
        <QuizNotice
          icon={<HelpCircle className="h-5 w-5" />}
          title="Quiz locked"
          description="Watch at least 90% of the video to unlock the quiz."
          tone="neutral"
        />
      </section>
    )
  }

  if (quizQuery.isLoading) {
    return (
      <section className="border-t border-border p-5">
        <LoadingState message="Loading quiz..." />
      </section>
    )
  }

  if (quizQuery.isError) {
    if (isForbiddenError(quizQuery.error)) {
      return (
        <section className="border-t border-border bg-[hsl(var(--brand-green-soft))]/60 p-5">
          <QuizNotice
            icon={<HelpCircle className="h-5 w-5" />}
            title="Quiz locked"
            description="Watch at least 90% of the video to unlock the quiz."
            tone="neutral"
            onRetry={() => void quizQuery.refetch()}
          />
        </section>
      )
    }

    if (isNotFoundError(quizQuery.error)) {
      return (
        <section className="border-t border-border bg-amber-50 p-5">
          <QuizNotice
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Quiz is not available yet"
            description="This lesson does not have a quiz yet. Continue with the next available lesson."
            tone="warning"
            onRetry={() => void quizQuery.refetch()}
          />
        </section>
      )
    }

    return (
      <section className="border-t border-border p-5">
        <ErrorState
          message={getFriendlyApiErrorMessage(quizQuery.error, 'Failed to load quiz')}
          onRetry={quizQuery.refetch}
        />
      </section>
    )
  }

  const quiz = quizQuery.data
  if (!quiz) return null

  return (
    <section className="border-t border-border bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[hsl(var(--brand-green))]">Review quiz</p>
          <h3 className="mt-1 text-xl font-extrabold text-foreground">{quiz.title || 'Lesson quiz'}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            You can retake this quiz any time. Low scores do not block your learning.
          </p>
        </div>
        <Button
          type="button"
          variant={attempt && !submittedAttempt ? 'outline' : 'default'}
          disabled={startAttemptMutation.isPending || submitAttemptMutation.isPending}
          onClick={startAttempt}
        >
          <RotateCcw className="h-4 w-4" />
          {attempt && !submittedAttempt ? 'Restart quiz' : submittedAttempt ? 'Try again' : 'Start quiz'}
        </Button>
      </div>

      {clientError && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {clientError}
        </div>
      )}

      {submittedAttempt && (
        <QuizResult attempt={submittedAttempt} />
      )}

      {attempt && !submittedAttempt && (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-[hsl(var(--brand-orange))]/25 bg-[hsl(var(--brand-orange-soft))] p-4">
            <p className="font-extrabold text-foreground">Attempt {attempt.attemptNumber || '-'}</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose one answer for each question before submitting.</p>
          </div>

          {questions.map((question, questionIndex) => (
            <QuizQuestionCard
              key={question.id || questionIndex}
              question={question}
              questionIndex={questionIndex}
              selectedOptionId={question.id ? answers[question.id] : undefined}
              onSelect={(optionId) => {
                if (!question.id) return
                setAnswers((current) => ({ ...current, [question.id as number]: optionId }))
              }}
            />
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} questions answered
            </p>
            <Button
              type="button"
              disabled={!isAllAnswered || submitAttemptMutation.isPending}
              onClick={submitAttempt}
            >
              <Send className="h-4 w-4" />
              {submitAttemptMutation.isPending ? 'Submitting...' : 'Submit quiz'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

function QuizQuestionCard({
  question,
  questionIndex,
  selectedOptionId,
  onSelect,
}: {
  question: QuizQuestion
  questionIndex: number
  selectedOptionId?: number
  onSelect: (optionId: number) => void
}) {
  const options = (question.options || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
        Question {questionIndex + 1}
      </p>
      <h4 className="mt-1 font-extrabold leading-6 text-foreground">
        {question.questionText || 'Untitled question'}
      </h4>

      <div className="mt-4 grid gap-3">
        {options.map((option, optionIndex) => {
          const optionId = option.id
          const selected = optionId === selectedOptionId
          return (
            <button
              key={option.id || optionIndex}
              type="button"
              disabled={!optionId}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                selected
                  ? 'border-[hsl(var(--brand-green))] bg-[hsl(var(--brand-green-soft))] text-foreground shadow-sm'
                  : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
              onClick={() => optionId && onSelect(optionId)}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${
                  selected
                    ? 'border-[hsl(var(--brand-green))] bg-[hsl(var(--brand-green))] text-white'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="text-sm font-bold leading-6">{option.optionText || 'Untitled option'}</span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function QuizResult({ attempt }: { attempt: QuizAttempt }) {
  return (
    <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-emerald-950">Quiz submitted</h4>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Teacher review is next. You can try again whenever you want.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <ResultStat label="Score" value={`${attempt.scorePercent ?? 0}%`} />
          <ResultStat label="Correct" value={`${attempt.correctCount ?? 0}/${attempt.totalQuestions ?? 0}`} />
          <ResultStat label="Best" value={`${attempt.bestScorePercent ?? attempt.scorePercent ?? 0}%`} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-emerald-900">
        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 font-bold">
          Attempt {attempt.attemptNumber || '-'}
        </span>
        {attempt.lessonProgressStatus && (
          <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 font-bold">
            {formatLessonProgressStatus(attempt.lessonProgressStatus)}
          </span>
        )}
      </div>
    </div>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
      <p className="text-base font-extrabold text-emerald-950">{value}</p>
      <p className="text-xs font-bold text-emerald-700">{label}</p>
    </div>
  )
}

function QuizNotice({
  icon,
  title,
  description,
  tone,
  onRetry,
}: {
  icon: React.ReactNode
  title: string
  description: string
  tone: 'neutral' | 'warning'
  onRetry?: () => void
}) {
  const toneClass = tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-border bg-white text-muted-foreground'

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <h3 className="font-extrabold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6">{description}</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" className="mt-3 bg-white" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
