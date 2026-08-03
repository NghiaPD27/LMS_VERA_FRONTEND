import React from 'react'
import { Badge } from '@/components/ui/badge'

interface UserRoleBadgeProps {
  role?: string
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role = 'STUDENT' }) => {
  const normalizedRole = role.toUpperCase()

  let label = role
  let className = 'border border-emerald-500/40 bg-emerald-950/70 text-emerald-400 font-bold shadow-none whitespace-nowrap'

  if (normalizedRole === 'ADMIN') {
    label = 'ADMIN'
    className = 'border border-rose-500/40 bg-rose-950/70 text-rose-400 font-bold shadow-none whitespace-nowrap'
  } else if (normalizedRole === 'TEACHER') {
    label = 'TEACHER'
    className = 'border border-primary/40 bg-primary/20 text-primary font-bold shadow-none whitespace-nowrap'
  } else if (normalizedRole === 'EVALUATOR') {
    label = 'EVALUATOR'
    className = 'border border-cyan-500/40 bg-cyan-950/70 text-cyan-400 font-bold shadow-none whitespace-nowrap'
  } else if (normalizedRole === 'STUDENT') {
    label = 'STUDENT'
    className = 'border border-emerald-500/40 bg-emerald-950/70 text-emerald-400 font-bold shadow-none whitespace-nowrap'
  }

  return (
    <Badge variant="outline" className={className} data-testid="user-role-badge">
      {label}
    </Badge>
  )
}
