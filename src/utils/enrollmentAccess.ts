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
    return 'border-border bg-muted text-muted-foreground'
  }

  if (isEnrollmentExpired(enrollment)) {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (enrollment.status === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (enrollment.status === 'COMPLETED') {
    return 'border-slate-200 bg-slate-50 text-slate-700'
  }

  return 'border-border bg-muted text-muted-foreground'
}
