import { describe, it, expect } from 'vitest'

describe('MSW Server Mocking', () => {
  it('should intercept POST /api/auth/login and return mocked response', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json() as any
    expect(data).toHaveProperty('accessToken')
    expect(data.accessToken).toBe('mock-access-token-admin')
    expect(data.mustChangePassword).toBe(false)
  })

  it('should fail login with invalid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword',
      }),
    })

    expect(response.status).toBe(401)
    const data = await response.json() as any
    expect(data.message).toBe('Invalid credentials')
  })
})
