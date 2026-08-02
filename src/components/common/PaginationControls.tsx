import { Button } from './Button'

interface PaginationControlsProps {
  page: number
  totalPages?: number
  totalElements?: number
  isFetching?: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  totalPages = 0,
  totalElements,
  isFetching = false,
  onPageChange,
}: PaginationControlsProps) {
  const pageCount = Math.max(totalPages, 1)

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span className="font-semibold">
        Page {page + 1} / {pageCount}
        {totalElements !== undefined ? ` - ${totalElements} total` : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 0 || isFetching}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={totalPages === 0 || page >= totalPages - 1 || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
