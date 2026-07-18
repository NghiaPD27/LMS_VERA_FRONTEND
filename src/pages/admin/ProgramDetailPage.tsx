import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProgram } from '../../hooks/usePrograms'
import {
  useCreateLesson,
  useDeleteLesson,
  useGetProgramLessons,
  usePublishLesson,
  useUpdateLesson
} from '../../hooks/useLessons'
import { LessonTable } from '../../components/lessons/LessonTable'
import { LessonForm, type LessonFormValues } from '../../components/lessons/LessonForm'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import type { Lesson } from '../../types/lesson'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { ArrowLeft, Plus } from 'lucide-react'

export const ProgramDetailPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>()
  const navigate = useNavigate()
  const pId = Number(programId)

  const {
    data: program,
    isLoading: isProgramLoading,
    isError: isProgramError,
    error: programError,
    refetch: refetchProgram
  } = useGetProgram(pId)

  const {
    data: lessons,
    isLoading: isLessonsLoading,
    isError: isLessonsError,
    error: lessonsError,
    refetch: refetchLessons
  } = useGetProgramLessons(pId)

  const createLessonMutation = useCreateLesson(pId)
  const updateLessonMutation = useUpdateLesson(pId)
  const publishLessonMutation = usePublishLesson(pId)
  const deleteLessonMutation = useDeleteLesson(pId)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null)
  const [formServerError, setFormServerError] = useState<string | null>(null)

  const handleCreateClick = () => {
    setEditingLesson(null)
    setFormServerError(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormServerError(null)
    setIsFormOpen(true)
  }

  const handlePublishClick = async (id: number) => {
    try {
      await publishLessonMutation.mutateAsync(id)
    } catch (err) {
      setFormServerError(getFriendlyApiErrorMessage(err, 'Failed to publish lesson'))
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingLessonId(id)
  }

  const handleFormSubmit = async (values: LessonFormValues) => {
    try {
      setFormServerError(null)
      if (editingLesson && editingLesson.id) {
        await updateLessonMutation.mutateAsync({
          id: editingLesson.id,
          data: values
        })
      } else {
        await createLessonMutation.mutateAsync(values)
      }
      setIsFormOpen(false)
      setEditingLesson(null)
    } catch (err) {
      setFormServerError(getFriendlyApiErrorMessage(err, 'Failed to save lesson'))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingLessonId) return
    try {
      await deleteLessonMutation.mutateAsync(deletingLessonId)
      setDeletingLessonId(null)
    } catch (err) {
      setFormServerError(getFriendlyApiErrorMessage(err, 'Failed to delete lesson'))
    }
  }

  const handleBack = () => {
    navigate('/admin/programs')
  }

  if (isProgramLoading || isLessonsLoading) {
    return <LoadingState message="Loading program details..." />
  }

  if (isProgramError) {
    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(programError, 'Failed to fetch program')}
        onRetry={refetchProgram}
      />
    )
  }

  // Sort lessons by lessonNumber
  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
    : []

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={handleBack}
            data-testid="back-to-programs-button"
            className="mb-2 h-auto p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Button>
          <h1 className="lms-section-title" data-testid="program-detail-title">
            {program?.name}
          </h1>
          <p className="lms-section-description">{program?.description || 'No description provided.'}</p>
        </div>
        <Button onClick={handleCreateClick} data-testid="create-lesson-button" className="relative">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="lms-surface p-6">
          <h3 className="mb-4 text-lg font-extrabold text-foreground">
            {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
          </h3>
          <LessonForm
            initialValues={
              editingLesson
                ? {
                    name: editingLesson.name,
                    lessonNumber: editingLesson.lessonNumber,
                    content: editingLesson.content
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingLesson(null)
            }}
            isLoading={
              createLessonMutation.isPending || updateLessonMutation.isPending
            }
            serverError={formServerError}
          />
        </div>
      )}

      {isLessonsError ? (
        <ErrorState
          message={getFriendlyApiErrorMessage(lessonsError, 'Failed to fetch lessons')}
          onRetry={refetchLessons}
        />
      ) : sortedLessons.length === 0 ? (
        <EmptyState
          message="No lessons found"
          description="Click 'Add Lesson' to add your first lesson to this program."
        />
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-foreground">Lessons</h3>
          <LessonTable
            lessons={sortedLessons}
            onEdit={handleEditClick}
            onPublish={handlePublishClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={deletingLessonId !== null}
        onClose={() => setDeletingLessonId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Lesson?"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        isLoading={deleteLessonMutation.isPending}
      />
    </section>
  )
}
