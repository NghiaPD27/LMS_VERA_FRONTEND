import { Link, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { getRoleHomePath, type UserRole } from '../utils/constants'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { data: user } = useCurrentUser()

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="lms-surface max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to access this feature.
          </p>
          <Button asChild className="mt-6">
            <Link to={getRoleHomePath(user?.role)}>Back to my workspace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
