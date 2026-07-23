import { http, HttpResponse } from 'msw'
import type { components } from '../../api/openapi'
import { loginSchema } from '../authSchema'
import {
  createStudentSchema,
  createTeacherSchema,
  createEvaluatorSchema,
  updateUserStatusSchema,
  extendEnrollmentSchema
} from '../../components/users/adminUserSchema'

interface UserProfileData {
  userId: number
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  bio?: string
  status?: string
  mustChangePassword?: boolean
}

// In-memory data store type definitions
interface UserState {
  id: string
  username: string
  email: string
  enabled: boolean
  role: 'admin' | 'teacher' | 'student' | 'evaluator'
  password?: string
  mustChangePassword: boolean
  profile: Partial<UserProfileData>
  accountAccess: {
    userId: number
    status: string
    mustChangePassword: boolean
    firstLoginAt: string
    expiredAt: string
  }
}

// Seed mock database
const usersDb: UserState[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@vera.com',
    enabled: true,
    role: 'admin',
    password: 'password123',
    mustChangePassword: false,
    profile: {},
    accountAccess: {
      userId: 1,
      status: 'active',
      mustChangePassword: false,
      firstLoginAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    id: '2',
    username: 'teacher',
    email: 'teacher@vera.com',
    enabled: true,
    role: 'teacher',
    password: 'password123',
    mustChangePassword: false,
    profile: {
      userId: 2,
      username: 'teacher',
      email: 'teacher@vera.com',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      bio: 'English Teacher'
    },
    accountAccess: {
      userId: 2,
      status: 'active',
      mustChangePassword: false,
      firstLoginAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    id: '3',
    username: 'student',
    email: 'student@vera.com',
    enabled: true,
    role: 'student',
    password: 'password123',
    mustChangePassword: true,
    profile: {
      userId: 3,
      username: 'student',
      email: 'student@vera.com',
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '0987654321',
      status: 'active',
      mustChangePassword: true
    },
    accountAccess: {
      userId: 3,
      status: 'active',
      mustChangePassword: true,
      firstLoginAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    id: '4',
    username: 'evaluator',
    email: 'evaluator@vera.com',
    enabled: true,
    role: 'evaluator',
    password: 'password123',
    mustChangePassword: false,
    profile: {
      userId: 4,
      username: 'evaluator',
      email: 'evaluator@vera.com',
      firstName: 'Evan',
      lastName: 'Tran',
      phoneNumber: '1112223333',
    },
    accountAccess: {
      userId: 4,
      status: 'active',
      mustChangePassword: false,
      firstLoginAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }
]

const programsDb: components['schemas']['ProgramResponse'][] = [
  {
    id: 1,
    name: 'Foundation English',
    description: 'Core speaking, listening, and grammar program.'
  },
  {
    id: 2,
    name: 'Business English',
    description: 'Workplace communication and presentation skills.'
  }
]

type MockAdminEnrollment = components['schemas']['AdminEnrollmentResponse'] & {
  teacherId?: number
  teacherName?: string
  teacherAssignedAt?: string
}

let enrollmentsDb: MockAdminEnrollment[] = [
  {
    id: 1,
    studentId: 3,
    studentName: 'John Smith',
    studentEmail: 'student@vera.com',
    programId: 1,
    programName: 'Foundation English',
    status: 'ACTIVE',
    teacherId: 2,
    teacherName: 'Jane Doe',
    teacherAssignedAt: new Date().toISOString(),
  }
]

let teacherAssignmentsDb: components['schemas']['TeacherAssignmentResponse'][] = [
  {
    id: 1,
    enrollmentId: 1,
    studentId: 3,
    studentName: 'John Smith',
    programId: 1,
    programName: 'Foundation English',
    teacherId: 2,
    teacherName: 'Jane Doe',
    assignedAt: new Date().toISOString(),
  }
]
let teacherCompensationsDb: components['schemas']['TeacherCompensationResponse'][] = []
const teacherAvailabilitiesDb: components['schemas']['TeacherAvailabilityResponse'][] = [
  {
    id: 1,
    teacherId: 2,
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }
]
const teacherBookingsDb: components['schemas']['TeacherBookingResponse'][] = [
  {
    id: 1,
    studentId: 3,
    studentName: 'John Smith',
    teacherId: 2,
    teacherName: 'Jane Doe',
    enrollmentId: 1,
    lessonId: 1,
    lessonName: 'Welcome lesson',
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]
const teacherEarningsDb: components['schemas']['TeacherEarningResponse'][] = []
const checkpointEligibleDb: components['schemas']['CheckpointEligibleStudentResponse'][] = [
  {
    studentId: 3,
    studentName: 'John Smith',
    enrollmentId: 1,
    programId: 1,
    programName: 'Foundation English',
    blockNumber: 1,
    startLessonNumber: 1,
    gateLessonNumber: 5,
    nextLessonNumber: 6,
    gateLessonId: 5,
    gateLessonName: 'Block 1 review',
    eligibleAt: new Date().toISOString(),
  }
]
const checkpointSessionsDb: components['schemas']['CheckpointSessionResponse'][] = [
  {
    id: 1,
    checkpointId: 1,
    programId: 1,
    programName: 'Foundation English',
    blockNumber: 1,
    startLessonNumber: 1,
    gateLessonNumber: 5,
    nextLessonNumber: 6,
    evaluatorId: 4,
    evaluatorName: 'Evan Tran',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    meetLink: 'https://meet.google.com/mock-room',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: 1,
        enrollmentId: 1,
        studentId: 3,
        studentName: 'John Smith',
        addedAt: new Date().toISOString(),
      }
    ],
  }
]
const finalRetakePaymentsDb: components['schemas']['FinalAssessmentRetakePaymentResponse'][] = []
const auditLogsDb: components['schemas']['AuditLogResponse'][] = [
  {
    id: 1,
    actorId: 4,
    actorUsername: 'evaluator',
    action: 'CHECKPOINT_RESULT_SUBMITTED',
    targetType: 'CHECKPOINT_PARTICIPANT',
    targetId: 1,
    details: 'Evaluator submitted PASS for checkpoint participant #1.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    actorId: 1,
    actorUsername: 'admin',
    action: 'ENROLLMENT_EXTENDED',
    targetType: 'ENROLLMENT',
    targetId: 1,
    details: 'Enrollment access was extended by admin.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
]

// Helper to authenticate user from Bearer token
const getSessionUser = (request: Request): UserState | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  if (!token.startsWith('mock-access-token-')) {
    return null
  }
  const username = token.replace('mock-access-token-', '')
  return usersDb.find(u => u.username === username) || null
}

const paginate = <T,>(items: T[], page: number, size: number) => {
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    page,
    size
  }
}

const getPageParams = (request: Request) => {
  const url = new URL(request.url)
  return {
    keyword: url.searchParams.get('keyword')?.toLowerCase().trim() || '',
    page: Number(url.searchParams.get('page') || 0),
    size: Number(url.searchParams.get('size') || 20)
  }
}

const toAdminStudentProgress = (enrollment: MockAdminEnrollment): components['schemas']['AdminStudentProgressResponse'] => {
  const student = usersDb.find((user) => Number(user.id) === enrollment.studentId)
  return {
    enrollmentId: enrollment.id,
    studentId: enrollment.studentId,
    studentName: enrollment.studentName,
    studentEmail: enrollment.studentEmail,
    studentEnabled: student?.enabled,
    accountStatus: student?.accountAccess.status?.toUpperCase(),
    programId: enrollment.programId,
    programName: enrollment.programName,
    enrollmentStatus: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    expiredAt: enrollment.expiredAt,
    progressPercent: 42,
    currentLessonNumber: 3,
    currentLessonName: 'Speaking checkpoint prep',
    currentLessonStatus: 'PUBLISHED',
    nextAction: 'Continue video lesson',
    teacherId: enrollment.teacherId,
    teacherName: enrollment.teacherName,
    teacherAssignedAt: enrollment.teacherAssignedAt,
  }
}

const toAdminStudent = (user: UserState): components['schemas']['AdminStudentResponse'] => ({
  id: Number(user.id),
  username: user.username,
  email: user.email,
  firstName: user.profile.firstName,
  lastName: user.profile.lastName,
  phoneNumber: user.profile.phoneNumber || undefined,
  enabled: user.enabled,
  status: user.accountAccess.status
})

const toAdminTeacher = (user: UserState): components['schemas']['AdminTeacherResponse'] => ({
  id: Number(user.id),
  username: user.username,
  email: user.email,
  firstName: user.profile.firstName,
  lastName: user.profile.lastName,
  phoneNumber: user.profile.phoneNumber || undefined,
  bio: user.profile.bio || undefined,
  enabled: user.enabled,
  status: user.accountAccess.status,
})

const toAdminEvaluator = (user: UserState): components['schemas']['AdminEvaluatorResponse'] => ({
  id: Number(user.id),
  username: user.username,
  email: user.email,
  firstName: user.profile.firstName,
  lastName: user.profile.lastName,
  phoneNumber: user.profile.phoneNumber || undefined,
  enabled: user.enabled,
  status: user.accountAccess.status,
})

const getTeacherDisplayName = (teacher?: UserState) => {
  if (!teacher) return undefined
  return [teacher.profile.firstName, teacher.profile.lastName].filter(Boolean).join(' ') || teacher.username
}

export const handlers = [
  http.get<never, never, components['schemas']['PageResponseProgramResponse']>(
    '/api/programs',
    ({ request }) => {
      const { keyword, page, size } = getPageParams(request)
      const filtered = programsDb.filter((program) => {
        const haystack = `${program.name || ''} ${program.description || ''}`.toLowerCase()
        return !keyword || haystack.includes(keyword)
      })
      return HttpResponse.json(paginate(filtered, page, size))
    }
  ),

  http.post<never, components['schemas']['CreateProgramRequest'], components['schemas']['ProgramResponse'] | { message: string }>(
    '/api/programs',
    async ({ request }) => {
      const body = await request.json()
      if (!body.name?.trim()) {
        return HttpResponse.json({ message: 'Program name is required' }, { status: 400 })
      }
      const program = {
        id: programsDb.length + 1,
        name: body.name,
        description: body.description
      }
      programsDb.unshift(program)
      return HttpResponse.json(program)
    }
  ),

  http.get<{ id: string }, never, components['schemas']['ProgramResponse'] | { message: string }>(
    '/api/programs/:id',
    ({ params }) => {
      const program = programsDb.find((item) => item.id === Number(params.id))
      if (!program) {
        return HttpResponse.json({ message: 'Program not found' }, { status: 404 })
      }
      return HttpResponse.json(program)
    }
  ),

  http.put<{ id: string }, components['schemas']['CreateProgramRequest'], components['schemas']['ProgramResponse'] | { message: string }>(
    '/api/programs/:id',
    async ({ params, request }) => {
      const body = await request.json()
      const program = programsDb.find((item) => item.id === Number(params.id))
      if (!program) {
        return HttpResponse.json({ message: 'Program not found' }, { status: 404 })
      }
      program.name = body.name
      program.description = body.description
      return HttpResponse.json(program)
    }
  ),

  http.delete<{ id: string }>(
    '/api/programs/:id',
    ({ params }) => {
      const index = programsDb.findIndex((item) => item.id === Number(params.id))
      if (index === -1) {
        return HttpResponse.json({ message: 'Program not found' }, { status: 404 })
      }
      programsDb.splice(index, 1)
      return HttpResponse.json({ ok: true })
    }
  ),

  http.get<never, never, components['schemas']['PageResponseAdminStudentResponse']>(
    '/api/admin/students',
    ({ request }) => {
      const { keyword, page, size } = getPageParams(request)
      const students = usersDb
        .filter((user) => user.role === 'student')
        .map(toAdminStudent)
        .filter((student) => {
          const haystack = `${student.username || ''} ${student.email || ''} ${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
          return !keyword || haystack.includes(keyword)
        })
      return HttpResponse.json(paginate(students, page, size))
    }
  ),

  http.get(
    '/api/admin/teachers',
    ({ request }) => {
      const { keyword, page, size } = getPageParams(request)
      const teachers = usersDb
        .filter((user) => user.role === 'teacher')
        .map(toAdminTeacher)
        .filter((teacher) => {
          const haystack = `${teacher.username || ''} ${teacher.email || ''} ${teacher.firstName || ''} ${teacher.lastName || ''}`.toLowerCase()
          return !keyword || haystack.includes(keyword)
        })
      return HttpResponse.json(paginate(teachers, page, size))
    }
  ),

  http.get<{ id: string }, never, components['schemas']['AdminTeacherResponse'] | { message: string }>(
    '/api/admin/teachers/:id',
    ({ params }) => {
      const teacher = usersDb.find((user) => user.id === params.id && user.role === 'teacher')
      if (!teacher) {
        return HttpResponse.json({ message: 'Teacher not found' }, { status: 404 })
      }
      return HttpResponse.json(toAdminTeacher(teacher))
    }
  ),

  http.get<{ id: string }, never, components['schemas']['AdminStudentResponse'] | { message: string }>(
    '/api/admin/students/:id',
    ({ params }) => {
      const student = usersDb.find((user) => user.id === params.id && user.role === 'student')
      if (!student) {
        return HttpResponse.json({ message: 'Student not found' }, { status: 404 })
      }
      return HttpResponse.json(toAdminStudent(student))
    }
  ),

  http.get<{ id: string }, never, components['schemas']['AdminEnrollmentResponse'][]>(
    '/api/admin/students/:id/enrollments',
    ({ params }) => {
      const studentId = Number(params.id)
      return HttpResponse.json(enrollmentsDb.filter((enrollment) => enrollment.studentId === studentId))
    }
  ),

  http.get<never, never, components['schemas']['PageResponseAdminEnrollmentResponse']>(
    '/api/admin/enrollments',
    ({ request }) => {
      const url = new URL(request.url)
      const studentId = url.searchParams.get('studentId')
      const programId = url.searchParams.get('programId')
      const status = url.searchParams.get('status')
      const page = Number(url.searchParams.get('page') || 0)
      const size = Number(url.searchParams.get('size') || 20)
      const filtered = enrollmentsDb.filter((enrollment) => {
        return (
          (!studentId || String(enrollment.studentId) === studentId) &&
          (!programId || String(enrollment.programId) === programId) &&
          (!status || enrollment.status === status)
        )
      })
      return HttpResponse.json(paginate(filtered, page, size))
    }
  ),

  http.post<never, components['schemas']['EnrollStudentRequest'], components['schemas']['EnrollmentResponse'] | { message: string }>(
    '/api/enrollments',
    async ({ request }) => {
      const body = await request.json()
      const student = usersDb.find((user) => Number(user.id) === body.studentId && user.role === 'student')
      const program = programsDb.find((item) => item.id === body.programId)
      if (!student || !program) {
        return HttpResponse.json({ message: 'Student or program not found' }, { status: 400 })
      }
      const activeEnrollment = enrollmentsDb.find(
        (enrollment) => enrollment.studentId === body.studentId && enrollment.status === 'ACTIVE'
      )
      if (activeEnrollment) {
        return HttpResponse.json({ message: 'Student already has an active enrollment' }, { status: 409 })
      }
      const newEnrollment: components['schemas']['AdminEnrollmentResponse'] = {
        id: enrollmentsDb.length + 1,
        studentId: body.studentId,
        studentName: [student.profile.firstName, student.profile.lastName].filter(Boolean).join(' ') || student.username,
        studentEmail: student.email,
        programId: body.programId,
        programName: program.name,
        status: 'ACTIVE'
      }
      enrollmentsDb = [newEnrollment, ...enrollmentsDb]
      return HttpResponse.json({
        id: newEnrollment.id,
        studentId: newEnrollment.studentId,
        programId: newEnrollment.programId,
        status: newEnrollment.status
      })
    }
  ),

  http.patch<{ id: string }, components['schemas']['UpdateEnrollmentRequest'], components['schemas']['EnrollmentResponse'] | { message: string }>(
    '/api/enrollments/:id',
    async ({ params, request }) => {
      const body = await request.json()
      const enrollment = enrollmentsDb.find((item) => item.id === Number(params.id))
      if (!enrollment) {
        return HttpResponse.json({ message: 'Enrollment not found' }, { status: 404 })
      }
      enrollment.status = body.status
      return HttpResponse.json({
        id: enrollment.id,
        studentId: enrollment.studentId,
        programId: enrollment.programId,
        status: enrollment.status
      })
    }
  ),

  // 1. POST /api/auth/login
  http.post<never, components['schemas']['LoginRequest'], components['schemas']['LoginResponse'] | { message: string }>(
    '/api/auth/login',
    async ({ request }) => {
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = loginSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const { username, password } = result.data
      const user = usersDb.find(u => u.username === username)
      if (!user || user.password !== password) {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      }
      if (!user.enabled) {
        return HttpResponse.json({ message: 'User account is disabled' }, { status: 403 })
      }
      return HttpResponse.json({
        accessToken: `mock-access-token-${username}`,
        refreshToken: `mock-refresh-token-${username}`,
        mustChangePassword: user.mustChangePassword
      })
    }
  ),

  // 2. POST /api/auth/refresh
  http.post<never, components['schemas']['RefreshRequest'], components['schemas']['LoginResponse'] | { message: string }>(
    '/api/auth/refresh',
    async ({ request }) => {
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const { refreshToken } = body || {}
      if (!refreshToken || typeof refreshToken !== 'string') {
        return HttpResponse.json({ message: 'Refresh token is required' }, { status: 400 })
      }
      if (!refreshToken.startsWith('mock-refresh-token-')) {
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
      }
      const username = refreshToken.replace('mock-refresh-token-', '')
      const user = usersDb.find(u => u.username === username)
      if (!user) {
        return HttpResponse.json({ message: 'User not found' }, { status: 401 })
      }
      return HttpResponse.json({
        accessToken: `mock-access-token-${username}`,
        refreshToken: `mock-refresh-token-${username}`,
        mustChangePassword: user.mustChangePassword
      })
    }
  ),

  // 3. POST /api/auth/logout
  http.post<never, components['schemas']['RefreshRequest'], { message: string }>(
    '/api/auth/logout',
    async ({ request }) => {
      let body;
      try {
        body = await request.json();
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
      }

      const { refreshToken } = body || {};
      if (!refreshToken) {
        return HttpResponse.json({ message: 'Missing refresh token' }, { status: 400 });
      }

      if (typeof refreshToken !== 'string' || !refreshToken.startsWith('mock-refresh-token-')) {
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 400 });
      }

      const username = refreshToken.replace('mock-refresh-token-', '');
      const user = usersDb.find(u => u.username === username);
      if (!user) {
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 400 });
      }

      return HttpResponse.json({ message: 'Successfully logged out' });
    }
  ),

  // 4. POST /api/auth/change-password
  http.post<never, components['schemas']['ChangePasswordRequest'], { message: string }>(
    '/api/auth/change-password',
    async ({ request }) => {
      const user = getSessionUser(request)
      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const { oldPassword, newPassword } = body || {}
      if (!oldPassword || typeof oldPassword !== 'string') {
        return HttpResponse.json({ message: 'Old password is required' }, { status: 400 })
      }
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
        return HttpResponse.json({ message: 'New password must be at least 8 characters' }, { status: 400 })
      }
      if (user.password !== oldPassword) {
        return HttpResponse.json({ message: 'Incorrect old password' }, { status: 400 })
      }
      user.password = newPassword
      user.mustChangePassword = false
      user.accountAccess.mustChangePassword = false
      if (user.profile && 'mustChangePassword' in user.profile) {
        user.profile.mustChangePassword = false
      }
      return HttpResponse.json({ message: 'Password changed successfully' })
    }
  ),

  // 5. GET /api/auth/me
  http.get<never, never, components['schemas']['UserResponse'] | { message: string }>(
    '/api/auth/me',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      return HttpResponse.json({
        id: parseInt(user.id),
        username: user.username,
        email: user.email,
        enabled: user.enabled,
        role: user.role,
        studentProfile: user.role === 'student' ? user.profile as components['schemas']['StudentProfileResponse'] : undefined,
        teacherProfile: user.role === 'teacher' ? user.profile as components['schemas']['TeacherProfileResponse'] : undefined,
        evaluatorProfile: user.role === 'evaluator' ? user.profile as components['schemas']['EvaluatorProfileResponse'] : undefined,
        accountAccess: user.accountAccess
      })
    }
  ),

  // 6. POST /api/admin/students
  http.post<never, components['schemas']['CreateStudentRequest'], components['schemas']['StudentProfileResponse'] | { message: string }>(
    '/api/admin/students',
    async ({ request }) => {
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = createStudentSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const { username, email, password, firstName, lastName, phoneNumber } = result.data
      const existing = usersDb.find(u => u.username === username || u.email === email)
      if (existing) {
        return HttpResponse.json({ message: 'Username or email already exists' }, { status: 400 })
      }
      const newId = (usersDb.length + 1).toString()
      const studentProfile = {
        userId: parseInt(newId),
        username,
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        status: 'active',
        mustChangePassword: true
      }
      const newUser: UserState = {
        id: newId,
        username,
        email,
        enabled: true,
        role: 'student',
        password: password || 'password123',
        mustChangePassword: true,
        profile: studentProfile,
        accountAccess: {
          userId: parseInt(newId),
          status: 'active',
          mustChangePassword: true,
          firstLoginAt: new Date().toISOString(),
          expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      usersDb.push(newUser)
      return HttpResponse.json(studentProfile)
    }
  ),

  // 7. POST /api/admin/teachers
  http.post<never, components['schemas']['CreateTeacherRequest'], components['schemas']['TeacherProfileResponse'] | { message: string }>(
    '/api/admin/teachers',
    async ({ request }) => {
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = createTeacherSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const { username, email, password, firstName, lastName, phoneNumber, bio } = result.data
      const existing = usersDb.find(u => u.username === username || u.email === email)
      if (existing) {
        return HttpResponse.json({ message: 'Username or email already exists' }, { status: 400 })
      }
      const newId = (usersDb.length + 1).toString()
      const teacherProfile = {
        userId: parseInt(newId),
        username,
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        bio: bio || ''
      }
      const newUser: UserState = {
        id: newId,
        username,
        email,
        enabled: true,
        role: 'teacher',
        password: password || 'password123',
        mustChangePassword: false,
        profile: teacherProfile,
        accountAccess: {
          userId: parseInt(newId),
          status: 'active',
          mustChangePassword: false,
          firstLoginAt: new Date().toISOString(),
          expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      usersDb.push(newUser)
      return HttpResponse.json(teacherProfile)
    }
  ),

  // 8. POST /api/admin/evaluators
  http.get(
    '/api/admin/evaluators',
    ({ request }) => {
      const { keyword, page, size } = getPageParams(request)
      const evaluators = usersDb
        .filter((user) => user.role === 'evaluator')
        .map(toAdminEvaluator)
        .filter((evaluator) => {
          const haystack = `${evaluator.username || ''} ${evaluator.email || ''} ${evaluator.firstName || ''} ${evaluator.lastName || ''}`.toLowerCase()
          return !keyword || haystack.includes(keyword)
        })
      return HttpResponse.json(paginate(evaluators, page, size))
    }
  ),

  http.post<never, components['schemas']['CreateEvaluatorRequest'], components['schemas']['EvaluatorProfileResponse'] | { message: string }>(
    '/api/admin/evaluators',
    async ({ request }) => {
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = createEvaluatorSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const { username, email, password, firstName, lastName, phoneNumber } = result.data
      const existing = usersDb.find(u => u.username === username || u.email === email)
      if (existing) {
        return HttpResponse.json({ message: 'Username or email already exists' }, { status: 400 })
      }
      const newId = (usersDb.length + 1).toString()
      const evaluatorProfile = {
        userId: parseInt(newId),
        username,
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined
      }
      const newUser: UserState = {
        id: newId,
        username,
        email,
        enabled: true,
        role: 'evaluator',
        password: password || 'password123',
        mustChangePassword: false,
        profile: evaluatorProfile,
        accountAccess: {
          userId: parseInt(newId),
          status: 'active',
          mustChangePassword: false,
          firstLoginAt: new Date().toISOString(),
          expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      usersDb.push(newUser)
      return HttpResponse.json(evaluatorProfile)
    }
  ),

  // 9. PATCH /api/admin/users/:id
  http.patch<{ id: string }, components['schemas']['UpdateUserRequest'], components['schemas']['UserResponse'] | { message: string }>(
    '/api/admin/users/:id',
    async ({ params, request }) => {
      const { id } = params
      const idNum = Number(id)
      if (isNaN(idNum) || !Number.isInteger(idNum)) {
        return HttpResponse.json({ message: 'Invalid user ID' }, { status: 400 })
      }
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = updateUserStatusSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const userIdStr = String(id)
      const user = usersDb.find(u => String(u.id) === userIdStr)
      if (!user) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 })
      }
      const { email, enabled, status } = result.data
      if (email !== undefined) {
        user.email = email || ''
        if (user.profile) {
          user.profile.email = email || ''
        }
      }
      if (enabled !== undefined) {
        user.enabled = enabled
      }
      if (status !== undefined) {
        user.accountAccess.status = status || ''
        if (user.profile && 'status' in user.profile) {
          user.profile.status = status || ''
        }
      }
      return HttpResponse.json({
        id: parseInt(user.id),
        username: user.username,
        email: user.email,
        enabled: user.enabled,
        role: user.role,
        studentProfile: user.role === 'student' ? user.profile as components['schemas']['StudentProfileResponse'] : undefined,
        teacherProfile: user.role === 'teacher' ? user.profile as components['schemas']['TeacherProfileResponse'] : undefined,
        evaluatorProfile: user.role === 'evaluator' ? user.profile as components['schemas']['EvaluatorProfileResponse'] : undefined,
        accountAccess: user.accountAccess
      })
    }
  ),

  // 10. PATCH /api/admin/enrollments/:id/extend
  http.patch<{ id: string }, { months: number }, components['schemas']['EnrollmentResponse'] | { message: string }>(
    '/api/admin/enrollments/:id/extend',
    async ({ params, request }) => {
      const { id } = params
      const idNum = Number(id)
      if (isNaN(idNum) || !Number.isInteger(idNum)) {
        return HttpResponse.json({ message: 'Invalid enrollment ID' }, { status: 400 })
      }
      let body;
      try {
        body = await request.json()
      } catch {
        return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
      }
      const result = extendEnrollmentSchema.safeParse(body)
      if (!result.success) {
        return HttpResponse.json({ message: result.error.errors[0].message }, { status: 400 })
      }
      const enrollment = enrollmentsDb.find((item) => item.id === idNum)
      if (!enrollment) {
        return HttpResponse.json({ message: 'Enrollment not found' }, { status: 404 })
      }
      const { months } = result.data
      const currentExpired = enrollment.expiredAt ? new Date(enrollment.expiredAt) : new Date()
      const baseDate = Number.isNaN(currentExpired.getTime()) || currentExpired.getTime() < Date.now() ? new Date() : currentExpired
      baseDate.setMonth(baseDate.getMonth() + months)
      enrollment.expiredAt = baseDate.toISOString()
      return HttpResponse.json({
        id: enrollment.id,
        studentId: enrollment.studentId,
        programId: enrollment.programId,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        expiredAt: enrollment.expiredAt,
      })
    }
  ),

  http.put<{ enrollmentId: string }, components['schemas']['AssignTeacherRequest'], components['schemas']['TeacherAssignmentResponse'] | { message: string }>(
    '/api/admin/enrollments/:enrollmentId/teacher-assignment',
    async ({ params, request }) => {
      const enrollmentId = Number(params.enrollmentId)
      const body = await request.json()
      const enrollment = enrollmentsDb.find((item) => item.id === enrollmentId)
      const teacher = usersDb.find((user) => Number(user.id) === body.teacherId && user.role === 'teacher')
      if (!enrollment || !teacher) {
        return HttpResponse.json({ message: 'Enrollment or teacher not found' }, { status: 404 })
      }

      const assignment: components['schemas']['TeacherAssignmentResponse'] = {
        id: teacherAssignmentsDb.length + 1,
        enrollmentId,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        programId: enrollment.programId,
        programName: enrollment.programName,
        teacherId: body.teacherId,
        teacherName: getTeacherDisplayName(teacher),
        assignedAt: new Date().toISOString(),
      }
      teacherAssignmentsDb = [
        assignment,
        ...teacherAssignmentsDb.filter((item) => item.enrollmentId !== enrollmentId),
      ]
      enrollment.teacherId = assignment.teacherId
      enrollment.teacherName = assignment.teacherName
      enrollment.teacherAssignedAt = assignment.assignedAt
      return HttpResponse.json(assignment)
    }
  ),

  http.put<{ teacherId: string }, components['schemas']['UpsertTeacherCompensationRequest'], components['schemas']['TeacherCompensationResponse'] | { message: string }>(
    '/api/admin/teachers/:teacherId/compensation',
    async ({ params, request }) => {
      const teacherId = Number(params.teacherId)
      const body = await request.json()
      const teacher = usersDb.find((user) => Number(user.id) === teacherId && user.role === 'teacher')
      if (!teacher) {
        return HttpResponse.json({ message: 'Teacher not found' }, { status: 404 })
      }
      if (body.amountPerSession === undefined || body.amountPerSession < 0) {
        return HttpResponse.json({ message: 'Amount per session must be zero or greater' }, { status: 400 })
      }

      const compensation: components['schemas']['TeacherCompensationResponse'] = {
        id: teacherId,
        teacherId,
        amountPerSession: body.amountPerSession,
        currency: body.currency || 'VND',
        updatedAt: new Date().toISOString(),
      }
      teacherCompensationsDb = [
        compensation,
        ...teacherCompensationsDb.filter((item) => item.teacherId !== teacherId),
      ]
      return HttpResponse.json(compensation)
    }
  ),

  http.get<{ teacherId: string }, never, components['schemas']['TeacherEarningsSummaryResponse'] | { message: string }>(
    '/api/admin/teachers/:teacherId/earnings',
    ({ params }) => {
      const teacherId = Number(params.teacherId)
      const earnings = teacherEarningsDb.filter((earning) => earning.teacherId === teacherId)
      const currency = earnings[0]?.currency || teacherCompensationsDb.find((item) => item.teacherId === teacherId)?.currency || 'VND'
      return HttpResponse.json({
        teacherId,
        totalEarned: earnings.reduce((total, earning) => total + (earning.amount || 0), 0),
        currency,
        earnings,
      })
    }
  ),

  http.post<never, components['schemas']['CreateAvailabilityRequest'], components['schemas']['TeacherAvailabilityResponse'] | { message: string }>(
    '/api/teacher/availability',
    async ({ request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'teacher') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const start = new Date(body.startAt)
      const end = new Date(body.endAt)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
        return HttpResponse.json({ message: 'Invalid availability range' }, { status: 400 })
      }

      const availability: components['schemas']['TeacherAvailabilityResponse'] = {
        id: teacherAvailabilitiesDb.length + 1,
        teacherId: Number(user.id),
        startAt: body.startAt,
        endAt: body.endAt,
        createdAt: new Date().toISOString(),
      }
      teacherAvailabilitiesDb.unshift(availability)
      return HttpResponse.json(availability)
    }
  ),

  http.get<never, never, components['schemas']['TeacherAssignmentResponse'][] | { message: string }>(
    '/api/teacher/students',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'teacher') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      return HttpResponse.json(teacherAssignmentsDb.filter((assignment) => assignment.teacherId === Number(user.id)))
    }
  ),

  http.get<never, never, components['schemas']['TeacherBookingResponse'][] | { message: string }>(
    '/api/teacher/bookings',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'teacher') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const status = url.searchParams.get('status')
      const bookings = teacherBookingsDb.filter((booking) =>
        booking.teacherId === Number(user.id) && (!status || booking.status === status)
      )
      return HttpResponse.json(bookings)
    }
  ),

  http.post<{ bookingId: string }, components['schemas']['ReviewBookingRequest'], components['schemas']['TeacherReviewResponse'] | { message: string }>(
    '/api/teacher/bookings/:bookingId/review',
    async ({ params, request }) => {
      const user = getSessionUser(request)
      const booking = teacherBookingsDb.find((item) => item.id === Number(params.bookingId))
      const body = await request.json()
      if (!user || user.role !== 'teacher' || !booking || booking.teacherId !== Number(user.id)) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const compensation = teacherCompensationsDb.find((item) => item.teacherId === Number(user.id))
      if (!compensation) {
        return HttpResponse.json({ message: 'Teacher compensation must be configured before review' }, { status: 400 })
      }

      booking.status = 'COMPLETED'
      booking.updatedAt = new Date().toISOString()
      const earning: components['schemas']['TeacherEarningResponse'] = {
        id: teacherEarningsDb.length + 1,
        teacherId: Number(user.id),
        bookingId: booking.id,
        studentId: booking.studentId,
        studentName: booking.studentName,
        lessonId: booking.lessonId,
        lessonName: booking.lessonName,
        amount: compensation.amountPerSession,
        currency: compensation.currency || 'VND',
        status: 'EARNED',
        earnedAt: new Date().toISOString(),
      }
      teacherEarningsDb.unshift(earning)
      return HttpResponse.json({
        id: Number(params.bookingId),
        bookingId: booking.id,
        result: body.result,
        comment: body.comment,
        reviewedAt: new Date().toISOString(),
        booking,
        earning,
      })
    }
  ),

  http.get<never, never, components['schemas']['TeacherSlotResponse'][] | { message: string }>(
    '/api/student/teacher-slots',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'student') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const lessonId = Number(url.searchParams.get('lessonId'))
      const assignment = teacherAssignmentsDb.find((item) => item.studentId === Number(user.id))
      if (!lessonId || !assignment?.teacherId) {
        return HttpResponse.json({ message: 'Teacher is not assigned yet' }, { status: 403 })
      }
      const bookedStarts = new Set(teacherBookingsDb.map((booking) => booking.startAt))
      return HttpResponse.json(
        teacherAvailabilitiesDb
          .filter((availability) => availability.teacherId === assignment.teacherId && !bookedStarts.has(availability.startAt))
          .map((availability) => ({
            teacherId: assignment.teacherId,
            teacherName: assignment.teacherName,
            availabilityId: availability.id,
            startAt: availability.startAt,
            endAt: availability.endAt,
          }))
      )
    }
  ),

  http.post<never, components['schemas']['CreateBookingRequest'], components['schemas']['TeacherBookingResponse'] | { message: string }>(
    '/api/student/bookings',
    async ({ request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'student') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const assignment = teacherAssignmentsDb.find((item) => item.studentId === Number(user.id))
      if (!assignment?.teacherId) {
        return HttpResponse.json({ message: 'Teacher is not assigned yet' }, { status: 403 })
      }
      const existingActive = teacherBookingsDb.find(
        (booking) => booking.studentId === Number(user.id) && booking.lessonId === body.lessonId && booking.status === 'BOOKED'
      )
      if (existingActive) {
        return HttpResponse.json({ message: 'You already have a booked session for this lesson' }, { status: 409 })
      }
      const availability = teacherAvailabilitiesDb.find(
        (item) => item.teacherId === assignment.teacherId && item.startAt === body.slotStartAt
      )
      if (!availability) {
        return HttpResponse.json({ message: 'Slot is no longer available' }, { status: 409 })
      }
      const booking: components['schemas']['TeacherBookingResponse'] = {
        id: teacherBookingsDb.length + 1,
        studentId: Number(user.id),
        studentName: assignment.studentName,
        teacherId: assignment.teacherId,
        teacherName: assignment.teacherName,
        enrollmentId: assignment.enrollmentId,
        lessonId: body.lessonId,
        lessonName: `Lesson #${body.lessonId}`,
        startAt: body.slotStartAt,
        endAt: availability.endAt,
        status: 'BOOKED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      teacherBookingsDb.unshift(booking)
      return HttpResponse.json(booking)
    }
  ),

  http.get<never, never, components['schemas']['CheckpointEligibleStudentResponse'][] | { message: string }>(
    '/api/admin/checkpoint-eligible-students',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const programId = url.searchParams.get('programId')
      const blockNumber = url.searchParams.get('blockNumber')
      const filtered = checkpointEligibleDb.filter((student) =>
        (!programId || String(student.programId) === programId) &&
        (!blockNumber || String(student.blockNumber) === blockNumber)
      )
      return HttpResponse.json(filtered)
    }
  ),

  http.get<never, never, components['schemas']['PageResponseCheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const programId = url.searchParams.get('programId')
      const blockNumber = url.searchParams.get('blockNumber')
      const status = url.searchParams.get('status')
      const page = Number(url.searchParams.get('page') || 0)
      const size = Number(url.searchParams.get('size') || 20)
      const filtered = checkpointSessionsDb.filter((session) =>
        (!programId || String(session.programId) === programId) &&
        (!blockNumber || String(session.blockNumber) === blockNumber) &&
        (!status || session.status === status)
      )
      return HttpResponse.json(paginate(filtered, page, size))
    }
  ),

  http.post<never, components['schemas']['CreateCheckpointSessionRequest'], components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions',
    async ({ request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const evaluator = usersDb.find((item) => Number(item.id) === body.evaluatorId && item.role === 'evaluator')
      const program = programsDb.find((item) => item.id === body.programId)
      if (!evaluator || !program) {
        return HttpResponse.json({ message: 'Evaluator or program not found' }, { status: 400 })
      }
      const participantEnrollmentIds = body.participantEnrollmentIds ?? []
      const duplicate = checkpointSessionsDb.some((session) =>
        session.blockNumber === body.blockNumber &&
        session.participants?.some((participant) => participant.enrollmentId && participantEnrollmentIds.includes(participant.enrollmentId))
      )
      if (duplicate) {
        return HttpResponse.json({ message: 'Enrollment already has a pending checkpoint session' }, { status: 409 })
      }
      const session: components['schemas']['CheckpointSessionResponse'] = {
        id: checkpointSessionsDb.length + 1,
        checkpointId: checkpointSessionsDb.length + 1,
        programId: body.programId,
        programName: program.name,
        blockNumber: body.blockNumber,
        startLessonNumber: (body.blockNumber - 1) * 5 + 1,
        gateLessonNumber: body.blockNumber * 5,
        nextLessonNumber: body.blockNumber * 5 + 1,
        evaluatorId: body.evaluatorId,
        evaluatorName: [evaluator.profile.firstName, evaluator.profile.lastName].filter(Boolean).join(' ') || evaluator.username,
        scheduledAt: body.scheduledAt,
        meetLink: body.meetLink,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: participantEnrollmentIds.map((enrollmentId, index) => {
          const eligible = checkpointEligibleDb.find((item) => item.enrollmentId === enrollmentId)
          return {
            id: checkpointSessionsDb.length * 100 + index + 1,
            enrollmentId,
            studentId: eligible?.studentId,
            studentName: eligible?.studentName,
            addedAt: new Date().toISOString(),
          }
        }),
      }
      checkpointSessionsDb.unshift(session)
      return HttpResponse.json(session)
    }
  ),

  http.get<{ id: string }, never, components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions/:id',
    ({ params, request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      return HttpResponse.json(session)
    }
  ),

  http.patch<{ id: string }, components['schemas']['UpdateCheckpointSessionRequest'], components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions/:id',
    async ({ params, request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      if (session.participants?.some((participant) => participant.result)) {
        return HttpResponse.json({ message: 'Cannot edit session after results are submitted' }, { status: 409 })
      }
      const evaluator = body.evaluatorId
        ? usersDb.find((item) => Number(item.id) === body.evaluatorId && item.role === 'evaluator')
        : undefined
      if (body.evaluatorId && !evaluator) {
        return HttpResponse.json({ message: 'Evaluator not found' }, { status: 400 })
      }
      session.evaluatorId = body.evaluatorId ?? session.evaluatorId
      session.evaluatorName = evaluator ? [evaluator.profile.firstName, evaluator.profile.lastName].filter(Boolean).join(' ') || evaluator.username : session.evaluatorName
      session.scheduledAt = body.scheduledAt ?? session.scheduledAt
      session.meetLink = body.meetLink ?? session.meetLink
      session.updatedAt = new Date().toISOString()
      return HttpResponse.json(session)
    }
  ),

  http.patch<{ id: string }, components['schemas']['UpdateCheckpointSessionStatusRequest'], components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions/:id/status',
    async ({ params, request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      if (session.participants?.some((participant) => participant.result)) {
        return HttpResponse.json({ message: 'Cannot cancel session after results are submitted' }, { status: 409 })
      }
      session.status = body.status
      session.updatedAt = new Date().toISOString()
      return HttpResponse.json(session)
    }
  ),

  http.post<{ id: string }, components['schemas']['AddCheckpointParticipantsRequest'], components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions/:id/participants',
    async ({ params, request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      const existingEnrollmentIds = new Set(session.participants?.map((participant) => participant.enrollmentId))
      if (body.enrollmentIds.some((enrollmentId) => existingEnrollmentIds.has(enrollmentId))) {
        return HttpResponse.json({ message: 'Duplicate participant' }, { status: 409 })
      }
      const nextParticipants = body.enrollmentIds.map((enrollmentId, index) => {
        const eligible = checkpointEligibleDb.find((item) => item.enrollmentId === enrollmentId)
        return {
          id: (session.participants?.length ?? 0) + index + 1,
          enrollmentId,
          studentId: eligible?.studentId,
          studentName: eligible?.studentName,
          addedAt: new Date().toISOString(),
        }
      })
      session.participants = [...(session.participants ?? []), ...nextParticipants]
      return HttpResponse.json(session)
    }
  ),

  http.delete<{ id: string; participantId: string }, never, components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/admin/checkpoint-sessions/:id/participants/:participantId',
    ({ params, request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      const participant = session.participants?.find((item) => item.id === Number(params.participantId))
      if (!participant) {
        return HttpResponse.json({ message: 'Participant not found' }, { status: 404 })
      }
      if (participant.result) {
        return HttpResponse.json({ message: 'Cannot remove participant after result is submitted' }, { status: 409 })
      }
      session.participants = session.participants?.filter((item) => item.id !== Number(params.participantId))
      session.updatedAt = new Date().toISOString()
      return HttpResponse.json(session)
    }
  ),

  http.get<never, never, components['schemas']['StudentCheckpointStatusResponse'] | { message: string }>(
    '/api/student/checkpoint-status',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'student') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.participants?.some((participant) => participant.studentId === Number(user.id)))
      const participant = session?.participants?.find((item) => item.studentId === Number(user.id))
      if (!session || !participant) {
        return HttpResponse.json({ message: 'Checkpoint status not found' }, { status: 404 })
      }
      return HttpResponse.json({
        lessonId: Number(new URL(request.url).searchParams.get('lessonId')),
        lessonProgressStatus: 'WAITING_FOR_CHECKPOINT',
        checkpointId: session.checkpointId,
        sessionId: session.id,
        participantId: participant.id,
        programId: session.programId,
        programName: session.programName,
        blockNumber: session.blockNumber,
        gateLessonNumber: session.gateLessonNumber,
        nextLessonNumber: session.nextLessonNumber,
        sessionStatus: session.status,
        scheduledAt: session.scheduledAt,
        meetLink: session.meetLink,
        evaluatorId: session.evaluatorId,
        evaluatorName: session.evaluatorName,
        lastResult: participant.result?.result,
        lastComment: participant.result?.comment,
        lastEvaluatedAt: participant.result?.evaluatedAt,
      })
    }
  ),

  http.get<never, never, components['schemas']['CheckpointSessionResponse'][] | { message: string }>(
    '/api/evaluator/checkpoint-sessions',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'evaluator') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      return HttpResponse.json(checkpointSessionsDb.filter((session) => session.evaluatorId === Number(user.id)))
    }
  ),

  http.get<{ id: string }, never, components['schemas']['CheckpointSessionResponse'] | { message: string }>(
    '/api/evaluator/checkpoint-sessions/:id',
    ({ params, request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'evaluator') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) => item.id === Number(params.id) && item.evaluatorId === Number(user.id))
      if (!session) {
        return HttpResponse.json({ message: 'Checkpoint session not found' }, { status: 404 })
      }
      return HttpResponse.json(session)
    }
  ),

  http.post<never, components['schemas']['SubmitCheckpointResultRequest'], components['schemas']['CheckpointResultResponse'] | { message: string }>(
    '/api/evaluator/checkpoint-results',
    async ({ request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      if (!user || user.role !== 'evaluator') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const session = checkpointSessionsDb.find((item) =>
        item.evaluatorId === Number(user.id) && item.participants?.some((participant) => participant.id === body.participantId)
      )
      const participant = session?.participants?.find((item) => item.id === body.participantId)
      if (!session || !participant) {
        return HttpResponse.json({ message: 'Participant not found in assigned session' }, { status: 403 })
      }
      if (participant.result) {
        return HttpResponse.json({ message: 'Participant already has a result' }, { status: 409 })
      }
      const result: components['schemas']['CheckpointResultResponse'] = {
        id: body.participantId,
        participantId: body.participantId,
        evaluatorId: Number(user.id),
        result: body.result,
        comment: body.comment,
        evaluatedAt: new Date().toISOString(),
      }
      participant.result = result
      if (session.participants?.every((item) => item.result)) {
        session.status = 'COMPLETED'
        session.updatedAt = new Date().toISOString()
      }
      return HttpResponse.json(result)
    }
  ),

  http.get<never, never, components['schemas']['AdminDashboardResponse'] | { message: string }>(
    '/api/admin/reports/dashboard',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      return HttpResponse.json({
        totalStudents: usersDb.filter((item) => item.role === 'student').length,
        totalTeachers: usersDb.filter((item) => item.role === 'teacher').length,
        totalEvaluators: usersDb.filter((item) => item.role === 'evaluator').length,
        activeAccounts: usersDb.filter((item) => item.accountAccess.status === 'active').length,
        suspendedAccounts: usersDb.filter((item) => item.accountAccess.status === 'suspended').length,
        expiredAccounts: usersDb.filter((item) => item.accountAccess.status === 'expired').length,
        totalEnrollments: enrollmentsDb.length,
        activeEnrollments: enrollmentsDb.filter((item) => item.status === 'ACTIVE').length,
        expiredActiveEnrollments: enrollmentsDb.filter((item) => item.status === 'ACTIVE' && item.expiredAt && new Date(item.expiredAt).getTime() < Date.now()).length,
        completedEnrollments: enrollmentsDb.filter((item) => item.status === 'COMPLETED').length,
        waitingReassessmentEnrollments: enrollmentsDb.filter((item) => item.status === 'WAITING_FOR_REASSESSMENT').length,
        pendingPurchases: 1,
        paidPurchases: 1,
        bookedTeacherBookings: teacherBookingsDb.filter((item) => item.status === 'BOOKED').length,
        pendingCheckpointSessions: checkpointSessionsDb.filter((item) => item.status === 'PENDING').length,
        pendingFinalAssessmentSessions: 0,
      })
    }
  ),

  http.get<never, never, components['schemas']['PageResponseAdminStudentProgressResponse'] | { message: string }>(
    '/api/admin/reports/student-progress',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page') || 0)
      const size = Number(url.searchParams.get('size') || 10)
      const keyword = url.searchParams.get('keyword')?.toLowerCase().trim() || ''
      const programId = url.searchParams.get('programId')
      const enrollmentStatus = url.searchParams.get('enrollmentStatus')
      const accountStatus = url.searchParams.get('accountStatus')
      const teacherId = url.searchParams.get('teacherId')
      const filtered = enrollmentsDb
        .map(toAdminStudentProgress)
        .filter((item) =>
          (!keyword || [item.studentName, item.studentEmail, item.programName].some((value) => value?.toLowerCase().includes(keyword))) &&
          (!programId || String(item.programId) === programId) &&
          (!enrollmentStatus || item.enrollmentStatus === enrollmentStatus) &&
          (!accountStatus || item.accountStatus === accountStatus) &&
          (!teacherId || String(item.teacherId) === teacherId)
        )
      return HttpResponse.json(paginate(filtered, page, size))
    }
  ),

  http.get<{ enrollmentId: string }, never, components['schemas']['AdminStudentProgressDetailResponse'] | { message: string }>(
    '/api/admin/reports/student-progress/:enrollmentId',
    ({ params, request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const enrollment = enrollmentsDb.find((item) => item.id === Number(params.enrollmentId))
      if (!enrollment) {
        return HttpResponse.json({ message: 'Enrollment not found' }, { status: 404 })
      }
      return HttpResponse.json({
        summary: toAdminStudentProgress(enrollment),
        lessons: [1, 2, 3, 4, 5].map((lessonNumber) => ({
          lessonId: lessonNumber,
          lessonNumber,
          lessonName: `Lesson ${lessonNumber}`,
          lessonStatus: 'PUBLISHED',
          progressStatus: lessonNumber < 3 ? 'COMPLETED' : lessonNumber === 3 ? 'VIDEO_IN_PROGRESS' : 'LOCKED',
        })),
      })
    }
  ),

  http.get<never, never, components['schemas']['PageResponseAuditLogResponse'] | { message: string }>(
    '/api/admin/audit-logs',
    ({ request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page') || 0)
      const size = Number(url.searchParams.get('size') || 12)
      const action = url.searchParams.get('action')
      const actorId = url.searchParams.get('actorId')
      const targetType = url.searchParams.get('targetType')
      const targetId = url.searchParams.get('targetId')
      const filtered = auditLogsDb.filter((log) =>
        (!action || log.action === action) &&
        (!actorId || String(log.actorId) === actorId) &&
        (!targetType || log.targetType?.toLowerCase().includes(targetType.toLowerCase())) &&
        (!targetId || String(log.targetId) === targetId)
      )
      return HttpResponse.json(paginate(filtered, page, size))
    }
  ),

  http.get<{ id: string }, never, components['schemas']['AuditLogResponse'] | { message: string }>(
    '/api/admin/audit-logs/:id',
    ({ params, request }) => {
      const user = getSessionUser(request)
      if (!user || user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      const log = auditLogsDb.find((item) => item.id === Number(params.id))
      if (!log) {
        return HttpResponse.json({ message: 'Audit log not found' }, { status: 404 })
      }
      return HttpResponse.json(log)
    }
  ),

  http.get<never, never, components['schemas']['StudentFinalAssessmentStatusResponse'] | { message: string }>(
    '/api/student/final-assessment-status',
    ({ request }) => {
      const user = getSessionUser(request)
      const enrollmentId = Number(new URL(request.url).searchParams.get('enrollmentId'))
      const enrollment = enrollmentsDb.find((item) => item.id === enrollmentId)
      if (!user || user.role !== 'student' || !enrollment || enrollment.studentId !== Number(user.id)) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      return HttpResponse.json({
        enrollmentId,
        programId: enrollment.programId,
        programName: enrollment.programName,
        enrollmentStatus: enrollment.status,
        eligible: enrollment.status === 'COMPLETED',
        retakeRequired: enrollment.status === 'WAITING_FOR_REASSESSMENT',
        latestRetakePayment: finalRetakePaymentsDb.find((payment) => payment.enrollmentId === enrollmentId),
      })
    }
  ),

  http.get<never, never, components['schemas']['FinalAssessmentRetakePaymentResponse'][] | { message: string }>(
    '/api/student/final-assessment-retake-payments',
    ({ request }) => {
      const user = getSessionUser(request)
      const enrollmentId = Number(new URL(request.url).searchParams.get('enrollmentId'))
      const enrollment = enrollmentsDb.find((item) => item.id === enrollmentId)
      if (!user || user.role !== 'student' || !enrollment || enrollment.studentId !== Number(user.id)) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      return HttpResponse.json(finalRetakePaymentsDb.filter((payment) => payment.enrollmentId === enrollmentId))
    }
  ),

  http.post<never, components['schemas']['CreateFinalAssessmentRetakePaymentRequest'], components['schemas']['FinalAssessmentRetakePaymentResponse'] | { message: string }>(
    '/api/student/final-assessment-retake-payments',
    async ({ request }) => {
      const user = getSessionUser(request)
      const body = await request.json()
      const enrollment = enrollmentsDb.find((item) => item.id === body.enrollmentId)
      if (!user || user.role !== 'student' || !enrollment || enrollment.studentId !== Number(user.id)) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      if (enrollment.status !== 'WAITING_FOR_REASSESSMENT') {
        return HttpResponse.json({ message: 'Enrollment is not waiting for reassessment' }, { status: 409 })
      }
      const payment: components['schemas']['FinalAssessmentRetakePaymentResponse'] = {
        id: finalRetakePaymentsDb.length + 1,
        enrollmentId: body.enrollmentId,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        programId: enrollment.programId,
        programName: enrollment.programName,
        amount: 500000,
        currency: 'VND',
        status: 'PENDING',
        paymentCode: `LMSR${finalRetakePaymentsDb.length + 1}`,
        paymentQrUrl: 'https://img.vietqr.io/image/mock-retake.png',
        paymentProvider: 'SePay',
        paymentContent: `LMSR${finalRetakePaymentsDb.length + 1}`,
        createdAt: new Date().toISOString(),
      }
      finalRetakePaymentsDb.unshift(payment)
      return HttpResponse.json(payment)
    }
  )
]

