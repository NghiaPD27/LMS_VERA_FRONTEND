import React from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  description?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  description
}) => {
  return (
    <div className="lms-surface flex min-h-56 flex-col items-center justify-center overflow-hidden p-8 text-center border-dashed border-border/80">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(244,106,37,0.15)]">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="text-base font-bold text-white">{message}</p>
      {description && <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  )
}
