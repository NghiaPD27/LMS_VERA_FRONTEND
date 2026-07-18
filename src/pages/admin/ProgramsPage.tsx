import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCreateProgram,
  useDeleteProgram,
  useGetPrograms,
  useUpdateProgram
} from '../../hooks/usePrograms'
import { ProgramTable } from '../../components/programs/ProgramTable'
import { ProgramForm, type ProgramFormValues } from '../../components/programs/ProgramForm'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import type { Program } from '../../types/program'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { Plus, Search } from 'lucide-react'

export const ProgramsPage: React.FC = () => {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const { data: programsPage, isLoading, isError, error, refetch } = useGetPrograms({
    keyword: keyword || undefined,
    page,
    size: 10
  })
  const createProgramMutation = useCreateProgram()
  const updateProgramMutation = useUpdateProgram()
  const deleteProgramMutation = useDeleteProgram()

  // State management for dialogs & forms
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [deletingProgramId, setDeletingProgramId] = useState<number | null>(null)
  const [formServerError, setFormServerError] = useState<string | null>(null)
  const programs = programsPage?.content ?? []
  const totalPages = programsPage?.totalPages ?? 0

  const handleCreateClick = () => {
    setEditingProgram(null)
    setFormServerError(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (program: Program) => {
    setEditingProgram(program)
    setFormServerError(null)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingProgramId(id)
  }

  const handleFormSubmit = async (values: ProgramFormValues) => {
    try {
      setFormServerError(null)
      if (editingProgram && editingProgram.id) {
        await updateProgramMutation.mutateAsync({
          id: editingProgram.id,
          data: values
        })
      } else {
        await createProgramMutation.mutateAsync(values)
      }
      setIsFormOpen(false)
      setEditingProgram(null)
    } catch (err) {
      setFormServerError(getFriendlyApiErrorMessage(err, 'Failed to save program'))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingProgramId) return
    try {
      await deleteProgramMutation.mutateAsync(deletingProgramId)
      setDeletingProgramId(null)
    } catch (err) {
      setFormServerError(getFriendlyApiErrorMessage(err, 'Failed to delete program'))
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading programs..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={getFriendlyApiErrorMessage(error, 'Failed to fetch programs')}
        onRetry={refetch}
      />
    )
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <h1 className="lms-section-title">Programs</h1>
          <p className="lms-section-description">
            Manage your English learning programs here.
          </p>
        </div>
        <Button onClick={handleCreateClick} data-testid="create-program-button" className="relative">
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
        </div>
      </div>

      <div className="lms-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <label htmlFor="program-search" className="sr-only">Search programs</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="program-search"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPage(0)
            }}
            className="lms-input pl-9"
            placeholder="Search programs by name"
            data-testid="program-search-input"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            Previous
          </Button>
          <span>
            Page {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={totalPages === 0 || page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="lms-surface p-6">
          <h3 className="mb-4 text-lg font-extrabold text-foreground">
            {editingProgram ? 'Edit Program' : 'Create Program'}
          </h3>
          <ProgramForm
            initialValues={
              editingProgram
                ? {
                    name: editingProgram.name,
                    description: editingProgram.description,
                    price: editingProgram.price,
                    currency: editingProgram.currency,
                    salesStatus: editingProgram.salesStatus,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingProgram(null)
            }}
            isLoading={
              createProgramMutation.isPending || updateProgramMutation.isPending
            }
            serverError={formServerError}
          />
        </div>
      )}

      {programs.length === 0 ? (
        <EmptyState
          message="No programs found"
          description="Click 'Create Program' to add your first learning program."
        />
      ) : (
        <ProgramTable
          programs={programs}
          onView={(id) => navigate(`/admin/programs/${id}`)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDialog
        isOpen={deletingProgramId !== null}
        onClose={() => setDeletingProgramId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Program?"
        description="Are you sure you want to delete this program? All associated lessons will be permanently deleted."
        isLoading={deleteProgramMutation.isPending}
      />
    </section>
  )
}
