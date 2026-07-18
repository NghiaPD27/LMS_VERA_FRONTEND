import React from 'react'
import { BookOpen } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  description?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  description
}) => {
  return (
    <div className="lms-surface flex min-h-56 flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))]">
        <BookOpen className="h-7 w-7" />
      </div>
      <p className="text-base font-semibold text-foreground">{message}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
