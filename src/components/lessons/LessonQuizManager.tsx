import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, HelpCircle, ListChecks, Plus, Save, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '../common/Button'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import type { Lesson } from '../../types/lesson'
import type { Quiz, QuizAttempt, UpsertQuizRequest } from '../../types/quiz'
import { useDeleteLessonQuiz, useGetLessonQuiz, useGetLessonQuizAttempts, useUpsertLessonQuiz } from '../../hooks/useQuiz'
import { getFriendlyApiErrorMessage, isNotFoundError } from '../../utils/errorMessage'

interface LessonQuizManagerProps {
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
}

interface QuizOptionDraft {
  optionText: string
  correct: boolean
}

interface QuizQuestionDraft {
  questionText: string
  options: QuizOptionDraft[]
}

type QuizDraft = ReturnType<typeof createEmptyQuiz>

const createEmptyQuestion = (): QuizQuestionDraft => ({
  questionText: '',
  options: [
    { optionText: '', correct: true },
    { optionText: '', correct: false },
  ],
})

const createEmptyQuiz = () => ({
  title: '',
  questions: [createEmptyQuestion()],
})

const toDraft = (quiz?: Quiz): QuizDraft => {
  if (!quiz) return createEmptyQuiz()

  const questions = (quiz.questions || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((question) => ({
      questionText: question.questionText || '',
      options: (question.options || [])
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((option) => ({
          optionText: option.optionText || '',
          correct: option.correct === true,
        })),
    }))

  return {
    title: quiz.title || '',
    questions: questions.length > 0 ? questions : [createEmptyQuestion()],
  }
}

const getQuestionIssue = (question: QuizQuestionDraft): string | null => {
  if (!question.questionText.trim()) return 'Question text is required.'
  if (question.options.length < 2) return 'At least 2 options are required.'

  const correctCount = question.options.filter((option) => option.correct).length
  if (correctCount !== 1) return 'Choose exactly 1 correct answer.'

  const emptyOptionIndex = question.options.findIndex((option) => !option.optionText.trim())
  if (emptyOptionIndex >= 0) return `Option ${emptyOptionIndex + 1} is required.`

  return null
}

const validateQuizDraft = (draft: QuizDraft): string | null => {
  if (!draft.title.trim()) return 'Quiz title is required.'
  if (draft.questions.length < 1) return 'Add at least one question.'

  for (const [questionIndex, question] of draft.questions.entries()) {
    const issue = getQuestionIssue(question)
    if (issue) return `Question ${questionIndex + 1}: ${issue}`
  }

  return null
}

const toRequest = (draft: QuizDraft): UpsertQuizRequest => ({
  title: draft.title.trim(),
  questions: draft.questions.map((question) => ({
    questionText: question.questionText.trim(),
    options: question.options.map((option) => ({
      optionText: option.optionText.trim(),
      correct: option.correct,
    })),
  })),
})

export function LessonQuizManager({ lesson, isOpen, onClose }: LessonQuizManagerProps) {
  const lessonId = lesson?.id
  const quizQuery = useGetLessonQuiz(lessonId, isOpen)
  const quizMissing = quizQuery.isError && isNotFoundError(quizQuery.error)
  const attemptsQuery = useGetLessonQuizAttempts(lessonId, isOpen && !!lessonId && !quizMissing)
  const upsertQuizMutation = useUpsertLessonQuiz()
  const deleteQuizMutation = useDeleteLessonQuiz()
  const [draft, setDraft] = useState<QuizDraft>(createEmptyQuiz)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [clientError, setClientError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isBusy = upsertQuizMutation.isPending || deleteQuizMutation.isPending

  useEffect(() => {
    if (!isOpen) {
      setDraft(createEmptyQuiz())
      setSelectedQuestionIndex(0)
      setClientError(null)
      setSuccessMessage(null)
      return
    }

    if (quizQuery.data) {
      setDraft(toDraft(quizQuery.data))
      setSelectedQuestionIndex(0)
      setClientError(null)
      setSuccessMessage(null)
    }

    if (quizMissing) {
      setDraft(createEmptyQuiz())
      setSelectedQuestionIndex(0)
      setClientError(null)
      setSuccessMessage(null)
    }
  }, [isOpen, quizMissing, quizQuery.data])

  const questionCount = draft.questions.length
  const optionCount = useMemo(
    () => draft.questions.reduce((total, question) => total + question.options.length, 0),
    [draft.questions]
  )
  const selectedQuestion = draft.questions[selectedQuestionIndex] || draft.questions[0]
  const selectedQuestionIssue = selectedQuestion ? getQuestionIssue(selectedQuestion) : null
  const validQuestionCount = draft.questions.filter((question) => !getQuestionIssue(question)).length

  const updateQuestion = (questionIndex: number, questionText: string) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex ? { ...question, questionText } : question
      ),
    }))
  }

  const updateOptionText = (questionIndex: number, optionIndex: number, optionText: string) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, optionText } : option
              ),
            }
          : question
      ),
    }))
  }

  const selectCorrectOption = (questionIndex: number, optionIndex: number) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) => ({
                ...option,
                correct: currentOptionIndex === optionIndex,
              })),
            }
          : question
      ),
    }))
  }

  const addQuestion = () => {
    setDraft((current) => {
      const nextQuestions = [...current.questions, createEmptyQuestion()]
      setSelectedQuestionIndex(nextQuestions.length - 1)
      return {
        ...current,
        questions: nextQuestions,
      }
    })
    setClientError(null)
    setSuccessMessage(null)
  }

  const removeQuestion = (questionIndex: number) => {
    setDraft((current) => {
      if (current.questions.length <= 1) return current

      const nextQuestions = current.questions.filter((_, index) => index !== questionIndex)
      setSelectedQuestionIndex(Math.min(Math.max(questionIndex - 1, 0), nextQuestions.length - 1))
      return {
        ...current,
        questions: nextQuestions,
      }
    })
    setClientError(null)
    setSuccessMessage(null)
  }

  const addOption = (questionIndex: number) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? { ...question, options: [...question.options, { optionText: '', correct: false }] }
          : question
      ),
    }))
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question
        const nextOptions = question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex)
        const hasCorrectOption = nextOptions.some((option) => option.correct)
        return {
          ...question,
          options: hasCorrectOption
            ? nextOptions
            : nextOptions.map((option, currentOptionIndex) => ({ ...option, correct: currentOptionIndex === 0 })),
        }
      }),
    }))
  }

  const handleSave = async () => {
    if (!lessonId) return

    const validationMessage = validateQuizDraft(draft)
    if (validationMessage) {
      setClientError(validationMessage)
      setSuccessMessage(null)
      return
    }

    try {
      setClientError(null)
      setSuccessMessage(null)
      const savedQuiz = await upsertQuizMutation.mutateAsync({
        lessonId,
        data: toRequest(draft),
      })
      setDraft(toDraft(savedQuiz))
      setSelectedQuestionIndex(0)
      setSuccessMessage('Quiz saved successfully.')
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to save quiz'))
    }
  }

  const handleDeleteQuiz = async () => {
    if (!lessonId) return

    try {
      setClientError(null)
      setSuccessMessage(null)
      await deleteQuizMutation.mutateAsync(lessonId)
      setDraft(createEmptyQuiz())
      setSelectedQuestionIndex(0)
      setSuccessMessage('Quiz deleted. Add a new title and questions when ready.')
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to delete quiz. It may already have student attempts.'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-lg bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="max-h-[92dvh] overflow-y-auto">
          <DialogHeader className="border-b border-border bg-white px-6 py-5">
            <DialogTitle>Lesson quiz</DialogTitle>
            <DialogDescription>
              Create or replace the review quiz students take after completing the lesson video.
            </DialogDescription>
          </DialogHeader>

          {quizQuery.isLoading ? (
            <div className="p-6">
              <LoadingState message="Loading quiz..." />
            </div>
          ) : quizQuery.isError && !quizMissing ? (
            <div className="p-6">
              <ErrorState
                message={getFriendlyApiErrorMessage(quizQuery.error, 'Failed to load quiz')}
                onRetry={quizQuery.refetch}
              />
            </div>
          ) : (
            <div className="space-y-5 p-6">
              <section className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-muted-foreground">Lesson</p>
                    <h3 className="mt-1 text-xl font-extrabold text-foreground">
                      {lesson?.lessonNumber ? `${lesson.lessonNumber}. ` : ''}
                      {lesson?.name || 'Selected lesson'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <QuizStat value={questionCount} label="Questions" />
                    <QuizStat value={optionCount} label="Options" />
                    <QuizStat value={`${validQuestionCount}/${questionCount}`} label="Ready" />
                  </div>
                </div>
              </section>

              {!quizMissing && (
                <section className="grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <h3 className="font-extrabold text-foreground">Student attempts</h3>
                    {attemptsQuery.isLoading ? (
                      <p className="mt-1 text-sm text-muted-foreground">Loading attempts...</p>
                    ) : attemptsQuery.isError ? (
                      <p className="mt-1 text-sm text-red-700">{getFriendlyApiErrorMessage(attemptsQuery.error, 'Failed to load quiz attempts')}</p>
                    ) : (attemptsQuery.data ?? []).length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No students have attempted this quiz yet.</p>
                    ) : (
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <QuizStat value={attemptsQuery.data?.length ?? 0} label="Attempts" />
                        <QuizStat value={getSubmittedAttemptCount(attemptsQuery.data ?? [])} label="Submitted" />
                        <QuizStat value={`${getAverageScore(attemptsQuery.data ?? [])}%`} label="Avg score" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => void handleDeleteQuiz()}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteQuizMutation.isPending ? 'Deleting...' : 'Delete quiz'}
                  </Button>
                </section>
              )}

              {quizMissing && (
                <QuizMessage tone="warning" icon={<HelpCircle className="mt-0.5 h-5 w-5 shrink-0" />}>
                  This lesson does not have a quiz yet. Add a title, choose each question, and fill in the answer options.
                </QuizMessage>
              )}

              {clientError && (
                <QuizMessage tone="error" icon={<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}>
                  {clientError}
                </QuizMessage>
              )}

              {successMessage && (
                <QuizMessage tone="success" icon={<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}>
                  {successMessage}
                </QuizMessage>
              )}

              <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
                <aside className="rounded-lg border border-border bg-white">
                  <div className="border-b border-border p-4">
                    <label htmlFor="quiz-title" className="text-sm font-bold text-foreground">
                      Quiz title
                    </label>
                    <input
                      id="quiz-title"
                      className="lms-input mt-1"
                      value={draft.title}
                      disabled={isBusy}
                      placeholder="Example: Lesson 1 review"
                      onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    />
                  </div>

                  <div className="p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                        <ListChecks className="h-4 w-4 text-[hsl(var(--brand-green))]" />
                        Questions
                      </div>
                      <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={addQuestion}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="max-h-[46dvh] space-y-2 overflow-y-auto pr-1">
                      {draft.questions.map((question, questionIndex) => {
                        const issue = getQuestionIssue(question)
                        const selected = questionIndex === selectedQuestionIndex
                        return (
                          <button
                            key={questionIndex}
                            type="button"
                            disabled={isBusy}
                            onClick={() => setSelectedQuestionIndex(questionIndex)}
                            className={`w-full rounded-md border p-3 text-left transition-colors ${
                              selected
                                ? 'border-primary bg-[hsl(var(--brand-orange-soft))]'
                                : 'border-border bg-background hover:border-primary/40 hover:bg-white'
                            }`}
                            data-testid={`select-quiz-question-${questionIndex}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Question {questionIndex + 1}</p>
                                <p className="mt-1 truncate text-sm font-extrabold text-foreground">
                                  {question.questionText || 'Untitled question'}
                                </p>
                              </div>
                              <QuestionStatusBadge valid={!issue} />
                            </div>
                            {issue && <p className="mt-2 line-clamp-2 text-xs text-amber-700">{issue}</p>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </aside>

                <section className="rounded-lg border border-border bg-white">
                  {selectedQuestion ? (
                    <div className="flex min-h-[34rem] flex-col">
                      <div className="border-b border-border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-muted-foreground">Editing</p>
                            <h3 className="mt-1 text-lg font-extrabold text-foreground">
                              Question {selectedQuestionIndex + 1}
                            </h3>
                            {selectedQuestionIssue && <p className="mt-1 text-sm text-amber-700">{selectedQuestionIssue}</p>}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isBusy || draft.questions.length <= 1}
                            onClick={() => removeQuestion(selectedQuestionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove question
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-5 p-4">
                        <div>
                          <label className="text-sm font-bold text-foreground">Question text</label>
                          <textarea
                            className="lms-input mt-1 min-h-28"
                            value={selectedQuestion.questionText}
                            disabled={isBusy}
                            placeholder="Write the question students will answer"
                            onChange={(event) => updateQuestion(selectedQuestionIndex, event.target.value)}
                          />
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-extrabold text-foreground">Answer options</h4>
                              <p className="text-sm text-muted-foreground">Select exactly one correct answer.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => addOption(selectedQuestionIndex)}>
                              <Plus className="h-4 w-4" />
                              Add option
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {selectedQuestion.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`grid gap-3 rounded-lg border p-3 md:grid-cols-[auto_1fr_auto] md:items-center ${
                                  option.correct
                                    ? 'border-[hsl(var(--brand-green))]/35 bg-[hsl(var(--brand-green-soft))]'
                                    : 'border-border bg-background'
                                }`}
                              >
                                <label className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                                  <input
                                    type="radio"
                                    name={`question-${selectedQuestionIndex}-correct`}
                                    checked={option.correct}
                                    disabled={isBusy}
                                    onChange={() => selectCorrectOption(selectedQuestionIndex, optionIndex)}
                                  />
                                  Correct
                                </label>
                                <input
                                  className="lms-input mt-0"
                                  value={option.optionText}
                                  disabled={isBusy}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  onChange={(event) => updateOptionText(selectedQuestionIndex, optionIndex, event.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={isBusy || selectedQuestion.options.length <= 2}
                                  onClick={() => removeOption(selectedQuestionIndex, optionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-80 items-center justify-center p-6 text-center">
                      <div>
                        <ListChecks className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--brand-green))]" />
                        <p className="font-extrabold text-foreground">Select a question</p>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" disabled={isBusy} onClick={addQuestion}>
                  <Plus className="h-4 w-4" />
                  Add question
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="button" disabled={isBusy} onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    {isBusy ? 'Saving...' : 'Save quiz'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuizStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="min-w-20 rounded-md border border-border bg-white px-3 py-2">
      <p className="font-extrabold text-foreground">{value}</p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  )
}

function getSubmittedAttemptCount(attempts: QuizAttempt[]) {
  return attempts.filter((attempt) => attempt.submitted).length
}

function getAverageScore(attempts: QuizAttempt[]) {
  const scoredAttempts = attempts.filter((attempt) => typeof attempt.scorePercent === 'number')
  if (scoredAttempts.length === 0) return 0

  const total = scoredAttempts.reduce((sum, attempt) => sum + (attempt.scorePercent ?? 0), 0)
  return Math.round(total / scoredAttempts.length)
}

function QuestionStatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-[10px] font-extrabold ${
        valid
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}
    >
      {valid ? 'Ready' : 'Needs work'}
    </span>
  )
}

function QuizMessage({
  tone,
  icon,
  children,
}: {
  tone: 'warning' | 'error' | 'success'
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const toneClass = {
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[tone]

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 ${toneClass}`}>
      {icon}
      <div>{children}</div>
    </div>
  )
}
