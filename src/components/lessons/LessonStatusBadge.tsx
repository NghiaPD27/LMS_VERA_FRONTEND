import React from 'react'
import { Badge } from '@/components/ui/badge'

interface LessonStatusBadgeProps {
  status?: string
}

export const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({ status = 'DRAFT' }) => {
  const normalizedStatus = status.toUpperCase()

  let variant: 'secondary' | 'default' | 'outline' = 'secondary'
  let label = 'Draft'
  let className = 'border-border bg-muted text-muted-foreground hover:bg-muted'

  if (normalizedStatus === 'PUBLISHED') {
    variant = 'default'
    label = 'Published'
    className = 'border border-emerald-500/35 bg-[hsl(var(--brand-green-soft))] text-emerald-200 hover:bg-[hsl(var(--brand-green-soft))]'
  } else if (normalizedStatus === 'ARCHIVED') {
    variant = 'outline'
    label = 'Archived'
    className = 'border-border bg-muted text-muted-foreground hover:bg-muted'
  }

  return (
    <Badge variant={variant} className={className} data-testid="lesson-status-badge">
      {label}
    </Badge>
  )
}

