import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
} from '../tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve access token', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('test-access-token')
    expect(getAccessToken()).toBe('test-access-token')
  })

  it('should store and retrieve refresh token', () => {
    expect(getRefreshToken()).toBeNull()
    setRefreshToken('test-refresh-token')
    expect(getRefreshToken()).toBe('test-refresh-token')
  })

  it('should clear tokens', () => {
    setAccessToken('access')
    setRefreshToken('refresh')
    expect(getAccessToken()).toBe('access')
    expect(getRefreshToken()).toBe('refresh')

    clearTokens()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
