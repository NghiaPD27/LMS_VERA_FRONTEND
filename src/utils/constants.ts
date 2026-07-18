export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  EVALUATOR: 'evaluator',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

const ROLE_BY_BACKEND_VALUE: Record<string, UserRole> = {
  ADMIN: ROLES.ADMIN,
  TEACHER: ROLES.TEACHER,
  STUDENT: ROLES.STUDENT,
  EVALUATOR: ROLES.EVALUATOR,
  admin: ROLES.ADMIN,
  teacher: ROLES.TEACHER,
  student: ROLES.STUDENT,
  evaluator: ROLES.EVALUATOR,
}

export const BRAND_COLORS = {
  orange: '#F47A3D',
  orangeHover: '#E8662B',
  orangeSoft: '#FFF3EB',
  green: '#2F8F5B',
  greenHover: '#24784B',
  greenSoft: '#ECF8F1',
} as const

export function normalizeRole(role?: string | null): UserRole | undefined {
  if (!role) {
    return undefined
  }

  const rawRole = String(role).trim()
  const directRole = ROLE_BY_BACKEND_VALUE[rawRole]
  if (directRole) {
    return directRole
  }

  const normalizedRole = rawRole
    .toUpperCase()
    .replace(/^ROLE[_-]?/, '')
    .replace(/[^A-Z]/g, '')

  if (normalizedRole.includes('ADMIN')) return ROLES.ADMIN
  if (normalizedRole.includes('STUDENT')) return ROLES.STUDENT
  if (normalizedRole.includes('TEACHER')) return ROLES.TEACHER
  if (normalizedRole.includes('EVALUATOR')) return ROLES.EVALUATOR

  return undefined
}

export function getRoleHomePath(role?: string): string {
  const normalizedRole = normalizeRole(role)
  return normalizedRole ? `/${normalizedRole}` : '/login'
}
