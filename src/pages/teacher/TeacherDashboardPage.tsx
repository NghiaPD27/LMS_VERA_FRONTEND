import { Link } from 'react-router-dom'
import { CalendarClock, Users } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetTeacherBookings, useGetTeacherStudents } from '../../hooks/useTeacher'

export function TeacherDashboardPage() {
  const studentsQuery = useGetTeacherStudents()
  const bookingsQuery = useGetTeacherBookings()

  if (studentsQuery.isLoading || bookingsQuery.isLoading) {
    return <LoadingState message="Loading teacher workspace..." />
  }

  const students = studentsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const bookedSessions = bookings.filter((booking) => booking.status === 'BOOKED')

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div>
            <h1 className="lms-section-title">Teacher Dashboard</h1>
            <p className="lms-section-description">Review your students, open teaching slots, and complete lesson reviews.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link to="/teacher/bookings" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-primary/40">
          <CalendarClock className="mb-4 h-8 w-8 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground">{bookedSessions.length} booked session{bookedSessions.length === 1 ? '' : 's'}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Open bookings that need teaching and review.</p>
        </Link>
        <Link to="/teacher/students" className="lms-surface p-5 transition hover:-translate-y-1 hover:border-[hsl(var(--brand-green))]/40">
          <Users className="mb-4 h-8 w-8 text-[hsl(var(--brand-green))]" />
          <h2 className="text-xl font-extrabold text-foreground">{students.length} assigned student{students.length === 1 ? '' : 's'}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Students assigned through active enrollments.</p>
        </Link>
      </div>

      <div className="lms-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Availability</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create whole-hour slots so students can book review sessions.</p>
          </div>
          <Button asChild>
            <Link to="/teacher/availability">Create availability</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

