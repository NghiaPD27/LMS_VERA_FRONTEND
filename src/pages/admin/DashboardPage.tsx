import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, Users } from 'lucide-react'

const cards = [
  { title: 'Programs', description: 'Create and manage A1/A2 learning programs.', href: '/admin/programs', icon: BookOpen },
  { title: 'Enrollments', description: 'Enroll students and update enrollment status.', href: '/admin/enrollments', icon: ClipboardList },
  { title: 'Users', description: 'Create users and manage account access.', href: '/admin/users', icon: Users },
]

export function DashboardPage() {
  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold text-primary">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">Manage Vera with clarity.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Programs, lessons, enrollments, and user access are grouped into focused work areas for daily operations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} to={card.href} className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(244,122,61,0.12)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))]">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
