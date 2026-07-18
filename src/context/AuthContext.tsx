import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'
import { useCurrentUser } from '../hooks/useAuth'
import type { CurrentUser } from '../types/user'

interface AuthContextValue {
  user: CurrentUser | null | undefined
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const { data: user, isLoading } = useCurrentUser()

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
