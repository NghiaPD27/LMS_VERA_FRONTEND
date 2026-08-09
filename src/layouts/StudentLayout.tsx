import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShoppingBag,
  X,
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { NoIndexSeo } from '../components/common/Seo'
import { useCurrentUser, useLogout } from '../hooks/useAuth'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard, end: true },
  { label: 'Courses', href: '/student/courses', icon: ShoppingBag, end: false },
  { label: 'My Purchases', href: '/student/purchases', icon: ReceiptText, end: false },
  { label: 'My Enrollments', href: '/student/enrollments', icon: ClipboardList, end: true },
  { label: 'Change Password', href: '/change-password', icon: KeyRound, end: true },
]

export function StudentLayout() {
  const { data: user } = useCurrentUser()
  const { mutateAsync: logout } = useLogout()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'ST'

  return (
    <div className="vera-workspace-bg flex min-h-screen bg-[hsl(220_14%_7%)] text-foreground">
      <NoIndexSeo title="Sen Languages | Student portal" />

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 border-r border-border bg-[hsl(220_14%_9%)] md:flex md:flex-col">
        {/* Brand Header */}
        <div className="shrink-0 border-b border-border/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_16px_rgba(244,106,37,0.35)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-white">Sen Languages</p>
              <p className="text-[11px] font-medium text-muted-foreground">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Learning Portal
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary/12 text-primary font-bold border-l-2 border-primary -ml-[2px] pl-[10px]'
                    : 'text-zinc-400 hover:bg-slate-800/60 hover:text-white'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="shrink-0 border-t border-border/80 p-3.5">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border/60 bg-slate-900/60 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user?.username || 'Student'}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{user?.role || 'student'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 hover:text-rose-300"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 flex-col bg-[hsl(220_14%_9%)] border-r border-border p-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Vera Language</p>
                  <p className="text-[10px] text-muted-foreground">Student Portal</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold',
                      isActive
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-zinc-400 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-rose-900/40 bg-rose-950/20 text-rose-400"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-[hsl(220_14%_9%)]/90 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-border bg-slate-900 p-2 text-zinc-300 hover:text-white"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <GraduationCap className="h-5 w-5 text-primary" />
                Vera Language
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-xs">
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
