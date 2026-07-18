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
          <h1 className="text-2xl font-bold text-foreground">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-muted-foreground">Bạn không có quyền truy cập chức năng này.</p>
          <Button asChild className="mt-6">
            <Link to={getRoleHomePath(user?.role)}>Về trang của tôi</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
