import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarClock, GraduationCap, KeyRound, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { Button } from '../components/common/Button'
import { VeraBackgroundArt } from '../components/common/VeraBackgroundArt'
import { useCurrentUser, useLogout } from '../hooks/useAuth'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'Bookings', href: '/teacher/bookings', icon: CalendarClock },
  { label: 'Availability', href: '/teacher/availability', icon: CalendarClock },
  { label: 'Students', href: '/teacher/students', icon: Users },
  { label: 'Change Password', href: '/change-password', icon: KeyRound },
]

export function TeacherLayout() {
  const { data: user } = useCurrentUser()
  const { mutateAsync: logout } = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="vera-workspace-bg flex min-h-screen">
      <VeraBackgroundArt />
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-72 border-r border-[hsl(var(--brand-green))]/15 bg-white md:flex md:flex-col">
        <div className="shrink-0 border-b border-border/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] shadow-[0_10px_22px_rgba(47,143,91,0.14)]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">LMS Vera</p>
              <p className="text-xs text-muted-foreground">Teacher workspace</p>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-[background-color,color,transform] hover:-translate-y-0.5',
                  isActive
                    ? 'bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] shadow-sm'
                    : 'text-muted-foreground hover:bg-[hsl(var(--brand-orange-soft))] hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border/80 p-4">
          <div className="mb-3 rounded-md border border-border/80 bg-background px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{user?.username}</p>
            <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
          </div>
          <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50" onClick={handleLogout} data-testid="logout-button">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-white px-5 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <GraduationCap className="h-6 w-6 text-[hsl(var(--brand-green))]" />
              LMS Vera
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

