import React from 'react'
import { Badge } from '@/components/ui/badge'

interface EnrollmentStatusBadgeProps {
  status?: string
}

export const EnrollmentStatusBadge: React.FC<EnrollmentStatusBadgeProps> = ({ status = 'ACTIVE' }) => {
  const normalizedStatus = status.toUpperCase()

  let variant: 'secondary' | 'default' | 'outline' = 'default'
  let label = 'Active'
  let className = 'bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-soft))]'

  if (normalizedStatus === 'COMPLETED') {
    variant = 'secondary'
    label = 'Completed'
    className = 'bg-[hsl(var(--brand-orange-soft))] text-primary hover:bg-[hsl(var(--brand-orange-soft))]'
  }

  return (
    <Badge variant={variant} className={className} data-testid="enrollment-status-badge">
      {label}
    </Badge>
  )
}

