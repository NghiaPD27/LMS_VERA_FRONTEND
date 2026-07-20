import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, HelpCircle, Plus, Save, Trash2 } from 'lucide-react'
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
import type { Quiz, UpsertQuizRequest } from '../../types/quiz'
import { useGetLessonQuiz, useUpsertLessonQuiz } from '../../hooks/useQuiz'
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

const toDraft = (quiz?: Quiz) => {
  if (!quiz) return createEmptyQuiz()

  return {
    title: quiz.title || '',
    questions: (quiz.questions || [])
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
      })),
  }
}

const validateQuizDraft = (draft: ReturnType<typeof createEmptyQuiz>): string | null => {
  if (!draft.title.trim()) return 'Quiz title is required.'
  if (draft.questions.length < 1) return 'Add at least one question.'

  for (const [questionIndex, question] of draft.questions.entries()) {
    const questionNumber = questionIndex + 1
    if (!question.questionText.trim()) return `Question ${questionNumber} text is required.`
    if (question.options.length < 2) return `Question ${questionNumber} needs at least 2 options.`

    const correctCount = question.options.filter((option) => option.correct).length
    if (correctCount !== 1) return `Question ${questionNumber} must have exactly 1 correct option.`

    for (const [optionIndex, option] of question.options.entries()) {
      if (!option.optionText.trim()) {
        return `Option ${optionIndex + 1} in question ${questionNumber} is required.`
      }
    }
  }

  return null
}

const toRequest = (draft: ReturnType<typeof createEmptyQuiz>): UpsertQuizRequest => ({
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
  const upsertQuizMutation = useUpsertLessonQuiz()
  const [draft, setDraft] = useState(createEmptyQuiz)
  const [clientError, setClientError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const quizMissing = quizQuery.isError && isNotFoundError(quizQuery.error)
  const isBusy = upsertQuizMutation.isPending

  useEffect(() => {
    if (!isOpen) {
      setDraft(createEmptyQuiz())
      setClientError(null)
      setSuccessMessage(null)
      return
    }

    if (quizQuery.data) {
      setDraft(toDraft(quizQuery.data))
      setClientError(null)
      setSuccessMessage(null)
    }

    if (quizMissing) {
      setDraft(createEmptyQuiz())
      setClientError(null)
      setSuccessMessage(null)
    }
  }, [isOpen, quizMissing, quizQuery.data])

  const questionCount = draft.questions.length
  const optionCount = useMemo(
    () => draft.questions.reduce((total, question) => total + question.options.length, 0),
    [draft.questions]
  )

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
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion()],
    }))
  }

  const removeQuestion = (questionIndex: number) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.filter((_, index) => index !== questionIndex),
    }))
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
        if (index !== questionIndex) return question
        const nextOptions = question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex)
        const hasCorrectOption = nextOptions.some((option) => option.correct)
        return {
          ...question,
          options: hasCorrectOption || nextOptions.length === 0
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
      setSuccessMessage('Quiz saved successfully.')
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to save quiz'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <DialogHeader>
          <DialogTitle>Lesson quiz</DialogTitle>
          <DialogDescription>
            Create or replace the review quiz students take after completing the lesson video.
          </DialogDescription>
        </DialogHeader>

        {quizQuery.isLoading ? (
          <LoadingState message="Loading quiz..." />
        ) : quizQuery.isError && !quizMissing ? (
          <ErrorState
            message={getFriendlyApiErrorMessage(quizQuery.error, 'Failed to load quiz')}
            onRetry={quizQuery.refetch}
          />
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Lesson</p>
                  <h3 className="mt-1 text-xl font-extrabold text-foreground">
                    {lesson?.lessonNumber ? `${lesson.lessonNumber}. ` : ''}
                    {lesson?.name || 'Selected lesson'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="rounded-md border border-border bg-white px-3 py-2">
                    <p className="font-extrabold text-foreground">{questionCount}</p>
                    <p className="text-xs font-bold text-muted-foreground">Questions</p>
                  </div>
                  <div className="rounded-md border border-border bg-white px-3 py-2">
                    <p className="font-extrabold text-foreground">{optionCount}</p>
                    <p className="text-xs font-bold text-muted-foreground">Options</p>
                  </div>
                </div>
              </div>
            </section>

            {quizMissing && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0" />
                This lesson does not have a quiz yet. Add the title, questions, and answer options below.
              </div>
            )}

            {clientError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                {clientError}
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                {successMessage}
              </div>
            )}

            <section className="rounded-lg border border-border bg-white p-4">
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
            </section>

            <div className="space-y-4">
              {draft.questions.map((question, questionIndex) => (
                <section key={questionIndex} className="rounded-lg border border-border bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-bold text-foreground">
                        Question {questionIndex + 1}
                      </label>
                      <textarea
                        className="lms-input mt-1 min-h-20"
                        value={question.questionText}
                        disabled={isBusy}
                        placeholder="Write the question here"
                        onChange={(event) => updateQuestion(questionIndex, event.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="sm:mt-7"
                      disabled={isBusy || draft.questions.length <= 1}
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {question.options.map((option, optionIndex) => (
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
                            name={`question-${questionIndex}-correct`}
                            checked={option.correct}
                            disabled={isBusy}
                            onChange={() => selectCorrectOption(questionIndex, optionIndex)}
                          />
                          Correct
                        </label>
                        <input
                          className="lms-input mt-0"
                          value={option.optionText}
                          disabled={isBusy}
                          placeholder={`Option ${optionIndex + 1}`}
                          onChange={(event) => updateOptionText(questionIndex, optionIndex, event.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBusy || question.options.length <= 2}
                          onClick={() => removeOption(questionIndex, optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    disabled={isBusy}
                    onClick={() => addOption(questionIndex)}
                  >
                    <Plus className="h-4 w-4" />
                    Add option
                  </Button>
                </section>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
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
      </DialogContent>
    </Dialog>
  )
}
