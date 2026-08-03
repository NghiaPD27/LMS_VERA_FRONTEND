import React from 'react'
import { Badge } from '@/components/ui/badge'

interface EnrollmentStatusBadgeProps {
  status?: string
}

export const EnrollmentStatusBadge: React.FC<EnrollmentStatusBadgeProps> = ({ status = 'ACTIVE' }) => {
  const normalizedStatus = status.toUpperCase()

  let label = 'Active'
  let className = 'border border-emerald-500/40 bg-emerald-950/70 text-emerald-400 font-bold shadow-none whitespace-nowrap'

  if (normalizedStatus === 'COMPLETED') {
    label = 'Completed'
    className = 'border border-primary/40 bg-primary/20 text-primary font-bold shadow-none whitespace-nowrap'
  } else if (normalizedStatus === 'EXPIRED') {
    label = 'Expired'
    className = 'border border-rose-500/40 bg-rose-950/70 text-rose-400 font-bold shadow-none whitespace-nowrap'
  } else if (normalizedStatus === 'WAITING_FOR_REASSESSMENT' || normalizedStatus === 'WAITING') {
    label = 'Waiting Reassessment'
    className = 'border border-amber-500/40 bg-amber-950/70 text-amber-400 font-bold shadow-none whitespace-nowrap'
  } else if (normalizedStatus === 'DISABLED' || normalizedStatus === 'SUSPENDED') {
    label = 'Disabled'
    className = 'border border-purple-500/40 bg-purple-950/70 text-purple-300 font-bold shadow-none whitespace-nowrap'
  }

  return (
    <Badge variant="outline" className={className} data-testid="enrollment-status-badge">
      {label}
    </Badge>
  )
}
