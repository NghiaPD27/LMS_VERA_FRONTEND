import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList } from 'lucide-react'

export function StudentDashboardPage() {
  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold text-[hsl(var(--brand-green))]">Student Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">Your learning path, kept simple.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              View your enrollments and continue the lessons available in your learning path.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/student/enrollments" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(244,122,61,0.12)]">
          <ClipboardList className="mb-4 h-8 w-8 text-primary" />
          <h2 className="font-extrabold text-foreground">My Enrollments</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">See active and completed enrollments.</p>
        </Link>
        <Link to="/student/enrollments" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-[hsl(var(--brand-green))]/40 hover:shadow-[0_18px_45px_rgba(47,143,91,0.12)]">
          <BookOpen className="mb-4 h-8 w-8 text-[hsl(var(--brand-green))]" />
          <h2 className="font-extrabold text-foreground">My Lessons</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose an enrollment first, then open available lessons.</p>
        </Link>
      </div>
    </section>
  )
}
