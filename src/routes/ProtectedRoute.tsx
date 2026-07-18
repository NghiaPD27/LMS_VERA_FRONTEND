import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useAuth'
import { getAccessToken } from '../utils/tokenStorage'
import { LoadingState } from '../components/common/LoadingState'

export function ProtectedRoute() {
  const location = useLocation()
  const token = getAccessToken()
  const { data: user, isLoading, isError } = useCurrentUser()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isLoading) {
    return <LoadingState message="Loading your workspace..." />
  }

  if (isError || !user || user.enabled === false) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user.accountAccess?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  return <Outlet />
}
