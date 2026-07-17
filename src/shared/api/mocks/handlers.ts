import { http, HttpResponse } from 'msw'

// In-memory data store type definitions
interface UserState {
  id: string
  username: string
  email: string
  enabled: boolean
  role: 'admin' | 'teacher' | 'student' | 'evaluator'
  password?: string
  mustChangePassword: boolean
  profile: any
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

export const handlers = [
  // 1. POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as any
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
  }),

  // 2. POST /api/auth/refresh
  http.post('/api/auth/refresh', async ({ request }) => {
    const { refreshToken } = await request.json() as any
    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-')) {
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
  }),

  // 3. POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Successfully logged out' })
  }),

  // 4. POST /api/auth/change-password
  http.post('/api/auth/change-password', async ({ request }) => {
    const user = getSessionUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const { oldPassword, newPassword } = await request.json() as any
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
  }),

  // 5. GET /api/auth/me
  http.get('/api/auth/me', ({ request }) => {
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
      studentProfile: user.role === 'student' ? user.profile : undefined,
      teacherProfile: user.role === 'teacher' ? user.profile : undefined,
      evaluatorProfile: user.role === 'evaluator' ? user.profile : undefined,
      accountAccess: user.accountAccess
    })
  }),

  // 6. POST /api/admin/students
  http.post('/api/admin/students', async ({ request }) => {
    const { username, email, password, firstName, lastName, phoneNumber } = await request.json() as any
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
      phoneNumber,
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
  }),

  // 7. POST /api/admin/teachers
  http.post('/api/admin/teachers', async ({ request }) => {
    const { username, email, password, firstName, lastName, phoneNumber, bio } = await request.json() as any
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
      phoneNumber,
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
  }),

  // 8. POST /api/admin/evaluators
  http.post('/api/admin/evaluators', async ({ request }) => {
    const { username, email, password, firstName, lastName, phoneNumber } = await request.json() as any
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
      phoneNumber
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
  }),

  // 9. PATCH /api/admin/users/:id
  http.patch('/api/admin/users/:id', async ({ params, request }) => {
    const { id } = params
    const user = usersDb.find(u => u.id === id)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    const { email, enabled, status } = await request.json() as any
    if (email !== undefined) {
      user.email = email
      if (user.profile) {
        user.profile.email = email
      }
    }
    if (enabled !== undefined) {
      user.enabled = enabled
    }
    if (status !== undefined) {
      user.accountAccess.status = status
      if (user.profile && 'status' in user.profile) {
        user.profile.status = status
      }
    }
    return HttpResponse.json({
      id: parseInt(user.id),
      username: user.username,
      email: user.email,
      enabled: user.enabled,
      role: user.role,
      studentProfile: user.role === 'student' ? user.profile : undefined,
      teacherProfile: user.role === 'teacher' ? user.profile : undefined,
      evaluatorProfile: user.role === 'evaluator' ? user.profile : undefined,
      accountAccess: user.accountAccess
    })
  }),

  // 10. PATCH /api/admin/users/:id/extend
  http.patch('/api/admin/users/:id/extend', async ({ params, request }) => {
    const { id } = params
    const user = usersDb.find(u => u.id === id)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    const { months } = await request.json() as any
    if (!months || months < 1) {
      return HttpResponse.json({ message: 'Months must be greater than or equal to 1' }, { status: 400 })
    }
    const currentExpired = new Date(user.accountAccess.expiredAt)
    currentExpired.setMonth(currentExpired.getMonth() + months)
    user.accountAccess.expiredAt = currentExpired.toISOString()
    return HttpResponse.json(user.accountAccess)
  })
]
