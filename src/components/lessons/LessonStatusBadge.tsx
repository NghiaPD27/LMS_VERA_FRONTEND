import React from 'react'
import { Badge } from '@/components/ui/badge'

interface LessonStatusBadgeProps {
  status?: string
}

export const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({ status = 'DRAFT' }) => {
  const normalizedStatus = status.toUpperCase()

  let variant: 'secondary' | 'default' | 'outline' = 'secondary'
  let label = 'Draft'
  let className = 'bg-gray-100 text-gray-700 hover:bg-gray-100'

  if (normalizedStatus === 'PUBLISHED') {
    variant = 'default'
    label = 'Published'
    className = 'bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-soft))]'
  } else if (normalizedStatus === 'ARCHIVED') {
    variant = 'outline'
    label = 'Archived'
    className = 'border-gray-200 bg-muted text-muted-foreground hover:bg-muted'
  }

  return (
    <Badge variant={variant} className={className} data-testid="lesson-status-badge">
      {label}
    </Badge>
  )
}

