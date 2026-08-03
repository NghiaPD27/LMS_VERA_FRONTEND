import type { AdminEnrollment, Enrollment } from '../types/enrollment'

type EnrollmentLike = Pick<Enrollment | AdminEnrollment, 'status' | 'expiredAt'>

export const isEnrollmentExpired = (enrollment?: EnrollmentLike | null, now = new Date()): boolean => {
  if (!enrollment?.expiredAt) {
    return false
  }

  const expiresAt = new Date(enrollment.expiredAt)
  if (Number.isNaN(expiresAt.getTime())) {
    return false
  }

  return expiresAt.getTime() < now.getTime()
}

export const hasActiveCourseAccess = (enrollment?: EnrollmentLike | null): boolean => {
  return enrollment?.status === 'ACTIVE' && !isEnrollmentExpired(enrollment)
}

export const getEnrollmentAccessLabel = (enrollment?: EnrollmentLike | null): string => {
  if (!enrollment) {
    return 'No enrollment'
  }

  if (isEnrollmentExpired(enrollment)) {
    return 'Expired'
  }

  if (enrollment.status === 'ACTIVE') {
    return 'Active access'
  }

  if (enrollment.status === 'COMPLETED') {
    return 'Completed'
  }

  return enrollment.status || 'Unknown'
}

export const getEnrollmentAccessBadgeClass = (enrollment?: EnrollmentLike | null): string => {
  if (!enrollment) {
    return 'border-border bg-slate-900/80 text-muted-foreground font-semibold whitespace-nowrap'
  }

  if (isEnrollmentExpired(enrollment)) {
    return 'border-rose-500/30 bg-rose-950/60 text-rose-400 font-semibold whitespace-nowrap'
  }

  if (enrollment.status === 'ACTIVE') {
    return 'border-emerald-500/30 bg-emerald-950/60 text-emerald-400 font-semibold whitespace-nowrap'
  }

  if (enrollment.status === 'COMPLETED') {
    return 'border-primary/30 bg-primary/15 text-primary font-semibold whitespace-nowrap'
  }

  return 'border-border bg-slate-900/80 text-muted-foreground font-semibold whitespace-nowrap'
}
