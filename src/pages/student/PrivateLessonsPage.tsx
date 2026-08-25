import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PaginationControls } from '../../components/common/PaginationControls'
import {
  useCancelStudentPrivateBooking,
  useCreateStudentPrivateBooking,
  useGetPrivateTeachers,
  useGetStudentPrivateBookings,
  useGetStudentPrivateTeacherSlots,
} from '../../hooks/useTeacher'
import type { PrivateTeacher, TeacherBooking, TeacherSlot } from '../../types/teacher'
import { getFriendlyApiErrorMessage, isConflictError } from '../../utils/errorMessage'
import { formatDateTime } from '../../utils/formatters'

const teacherPageSize = 10
const slotPageSize = 20
const bookingPageSize = 20

export function PrivateLessonsPage() {
  const [keyword, setKeyword] = useState('')
  const [teacherPage, setTeacherPage] = useState(0)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>()
  const [slotFrom, setSlotFrom] = useState('')
  const [slotTo, setSlotTo] = useState('')
  const [slotPage, setSlotPage] = useState(0)
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState('')
  const [bookingStatus, setBookingStatus] = useState('')
  const [bookingPage, setBookingPage] = useState(0)
  const [clientError, setClientError] = useState<string | null>(null)
  const [clientMessage, setClientMessage] = useState<string | null>(null)
  const [createdBooking, setCreatedBooking] = useState<TeacherBooking | null>(null)
  const teachersQuery = useGetPrivateTeachers({
    keyword: keyword || undefined,
    page: teacherPage,
    size: teacherPageSize,
  })
  const slotsQuery = useGetStudentPrivateTeacherSlots({
    teacherId: selectedTeacherId,
    from: slotFrom ? new Date(slotFrom).toISOString() : undefined,
    to: slotTo ? new Date(slotTo).toISOString() : undefined,
    page: slotPage,
    size: slotPageSize,
  })
  const bookingsQuery = useGetStudentPrivateBookings({
    teacherId: selectedTeacherId,
    status: bookingStatus || undefined,
    page: bookingPage,
    size: bookingPageSize,
  })
  const createBookingMutation = useCreateStudentPrivateBooking()
  const cancelBookingMutation = useCancelStudentPrivateBooking()

  const teachers = teachersQuery.data?.content ?? []
  const selectedTeacher = teachers.find((teacher) => teacher.teacherId === selectedTeacherId)
  const slots = useMemo(
    () =>
      (slotsQuery.data?.content || [])
        .filter((slot) => slot.startAt)
        .slice()
        .sort((a, b) => new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime()),
    [slotsQuery.data?.content]
  )
  const selectedSlot = slots.find((slot) => slot.startAt === selectedSlotStartAt)
  const bookings = bookingsQuery.data?.content ?? []

  const selectTeacher = (teacher: PrivateTeacher) => {
    setSelectedTeacherId(teacher.teacherId)
    setSlotPage(0)
    setBookingPage(0)
    setSelectedSlotStartAt('')
    setClientError(null)
    setClientMessage(null)
    setCreatedBooking(null)
  }

  const bookSelectedSlot = async () => {
    if (!selectedTeacherId || !selectedSlot?.startAt) return

    try {
      setClientError(null)
      setClientMessage(null)
      const booking = await createBookingMutation.mutateAsync({
        teacherId: selectedTeacherId,
        slotStartAt: selectedSlot.startAt,
      })
      setSelectedSlotStartAt('')
      setCreatedBooking(booking)
      setClientMessage(`Private lesson booked with ${booking.teacherName || 'your teacher'}.`)
      await Promise.all([bookingsQuery.refetch(), slotsQuery.refetch()])
    } catch (error) {
      if (isConflictError(error)) {
        setClientError('This private lesson slot is no longer available. The slot list has been refreshed.')
        void slotsQuery.refetch()
        return
      }
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to book private lesson'))
    }
  }

  const cancelBooking = async (booking: TeacherBooking) => {
    if (!booking.id) return

    try {
      setClientError(null)
      setClientMessage(null)
      await cancelBookingMutation.mutateAsync(booking.id)
      setCreatedBooking((current) => (current?.id === booking.id ? null : current))
      setClientMessage('Private lesson booking cancelled.')
      await Promise.all([bookingsQuery.refetch(), slotsQuery.refetch()])
    } catch (error) {
      setClientError(getFriendlyApiErrorMessage(error, 'Failed to cancel private lesson booking'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Private Lessons</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">Book a private session with any teacher.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose a teacher, pick an open slot, and join from the Meet link after the booking is confirmed.
            </p>
          </div>
        </div>
      </div>

      {clientError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {clientError}
        </div>
      )}

      {clientMessage && (
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{clientMessage}</span>
          </div>
          {createdBooking?.meetLink && (
            <Button asChild variant="outline" size="sm" className="border-emerald-500/40 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/60 hover:text-emerald-100">
              <a href={createdBooking.meetLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Meet
              </a>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="lms-surface h-fit p-5">
          <div className="mb-4">
            <h2 className="font-extrabold text-white">Teachers</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Search all teachers available for private lessons.</p>
          </div>

          <div className="relative mb-4">
            <label htmlFor="private-teacher-search" className="sr-only">Search private teachers</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="private-teacher-search"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                setTeacherPage(0)
              }}
              className="lms-input pl-9"
              placeholder="Search teacher..."
            />
          </div>

          {teachersQuery.isLoading ? (
            <LoadingState message="Loading teachers..." />
          ) : teachersQuery.isError ? (
            <div className="lms-alert-error">{getFriendlyApiErrorMessage(teachersQuery.error, 'Failed to load teachers')}</div>
          ) : teachers.length === 0 ? (
            <EmptyState message="No teachers found" description="Try another keyword." />
          ) : (
            <div className="grid gap-3">
              {teachers.map((teacher) => (
                <TeacherOption
                  key={teacher.teacherId}
                  teacher={teacher}
                  selected={teacher.teacherId === selectedTeacherId}
                  onSelect={() => selectTeacher(teacher)}
                />
              ))}
              <PaginationControls
                page={teacherPage}
                totalPages={teachersQuery.data?.totalPages}
                totalElements={teachersQuery.data?.totalElements}
                isFetching={teachersQuery.isFetching}
                onPageChange={setTeacherPage}
              />
            </div>
          )}
        </aside>

        <div className="grid gap-5">
          <section className="lms-surface p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-extrabold text-white">Open private lesson slots</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {selectedTeacher ? `${selectedTeacher.teacherName || 'Selected teacher'} has ${slotsQuery.data?.totalElements ?? 0} open slots.` : 'Select a teacher to load private lesson slots.'}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => void slotsQuery.refetch()} disabled={!selectedTeacherId || slotsQuery.isFetching}>
                <RefreshCw className={`h-4 w-4 ${slotsQuery.isFetching ? 'animate-spin' : ''}`} />
                Refresh slots
              </Button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="private-slot-from" className="text-sm font-bold text-foreground">From</label>
                <input id="private-slot-from" type="datetime-local" value={slotFrom} onChange={(event) => { setSlotFrom(event.target.value); setSlotPage(0) }} className="lms-input mt-1" />
              </div>
              <div>
                <label htmlFor="private-slot-to" className="text-sm font-bold text-foreground">To</label>
                <input id="private-slot-to" type="datetime-local" value={slotTo} onChange={(event) => { setSlotTo(event.target.value); setSlotPage(0) }} className="lms-input mt-1" />
              </div>
            </div>

            {!selectedTeacherId ? (
              <EmptyState message="Choose a teacher" description="Private lesson slots appear after you select a teacher." />
            ) : slotsQuery.isLoading ? (
              <LoadingState message="Loading private lesson slots..." />
            ) : slotsQuery.isError ? (
              <div className="lms-alert-error">{getFriendlyApiErrorMessage(slotsQuery.error, 'Failed to load private lesson slots')}</div>
            ) : slots.length === 0 ? (
              <EmptyState message="No private slots available" description="Try another teacher or date range." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {slots.map((slot) => (
                    <PrivateSlotButton
                      key={`${slot.availabilityId || slot.startAt}-${slot.startAt}`}
                      slot={slot}
                      selected={slot.startAt === selectedSlotStartAt}
                      onSelect={() => setSelectedSlotStartAt(slot.startAt || '')}
                    />
                  ))}
                </div>
                <div className="h-fit rounded-xl border border-border/80 bg-slate-900/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected slot</p>
                  <p className="mt-1 text-sm font-extrabold text-white">
                    {selectedSlot ? formatDateTime(selectedSlot.startAt) : 'No slot selected'}
                  </p>
                  {selectedSlot?.endAt && <p className="mt-1 text-xs text-muted-foreground">Ends: {formatDateTime(selectedSlot.endAt)}</p>}
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">Meet link is shown only after the booking is confirmed.</p>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={!selectedSlot || createBookingMutation.isPending}
                    onClick={() => void bookSelectedSlot()}
                  >
                    <CalendarClock className="h-4 w-4" />
                    {createBookingMutation.isPending ? 'Booking...' : 'Book private lesson'}
                  </Button>
                </div>
                <div className="lg:col-span-2">
                  <PaginationControls
                    page={slotPage}
                    totalPages={slotsQuery.data?.totalPages}
                    totalElements={slotsQuery.data?.totalElements}
                    isFetching={slotsQuery.isFetching}
                    onPageChange={(nextPage) => {
                      setSelectedSlotStartAt('')
                      setSlotPage(nextPage)
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="lms-surface p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-extrabold text-white">My private bookings</h2>
                <p className="mt-1 text-xs text-muted-foreground">{bookingsQuery.data?.totalElements ?? 0} private bookings found.</p>
              </div>
              <div className="w-full lg:w-48">
                <label htmlFor="private-booking-status" className="text-sm font-bold text-foreground">Status</label>
                <select
                  id="private-booking-status"
                  value={bookingStatus}
                  onChange={(event) => {
                    setBookingStatus(event.target.value)
                    setBookingPage(0)
                  }}
                  className="lms-input mt-1"
                >
                  <option value="">All statuses</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {bookingsQuery.isLoading ? (
              <LoadingState message="Loading private bookings..." />
            ) : bookingsQuery.isError ? (
              <div className="lms-alert-error">{getFriendlyApiErrorMessage(bookingsQuery.error, 'Failed to load private bookings')}</div>
            ) : bookings.length === 0 ? (
              <EmptyState message="No private bookings" description="Book a private lesson to see it here." />
            ) : (
              <div className="grid gap-3">
                {bookings.map((booking) => (
                  <PrivateBookingCard
                    key={booking.id}
                    booking={booking}
                    isCancelling={cancelBookingMutation.isPending}
                    onCancel={() => void cancelBooking(booking)}
                  />
                ))}
                <PaginationControls
                  page={bookingPage}
                  totalPages={bookingsQuery.data?.totalPages}
                  totalElements={bookingsQuery.data?.totalElements}
                  isFetching={bookingsQuery.isFetching}
                  onPageChange={setBookingPage}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

function TeacherOption({
  teacher,
  selected,
  onSelect,
}: {
  teacher: PrivateTeacher
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`rounded-xl border p-4 text-left transition-all active:translate-y-px ${
        selected
          ? 'border-primary/50 bg-primary/15 text-white shadow-sm'
          : 'border-border/80 bg-slate-900/70 text-zinc-300 hover:border-primary/40 hover:bg-slate-800 hover:text-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${selected ? 'border-primary/40 bg-primary/20 text-primary' : 'border-border bg-slate-950 text-muted-foreground'}`}>
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-white">{teacher.teacherName || `Teacher #${teacher.teacherId ?? '-'}`}</p>
          {teacher.bio && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{teacher.bio}</p>}
        </div>
      </div>
    </button>
  )
}

function PrivateSlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: TeacherSlot
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`rounded-xl border p-3 text-left transition-all active:translate-y-px ${
        selected
          ? 'border-primary/50 bg-primary/15 text-white shadow-sm'
          : 'border-border/80 bg-slate-900/80 text-zinc-300 hover:border-primary/40 hover:bg-slate-800 hover:text-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <CalendarClock className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        <div>
          <p className="text-xs font-extrabold text-white">{formatDateTime(slot.startAt)}</p>
          {slot.endAt && <p className="mt-1 text-[11px] font-semibold text-zinc-300">Ends {formatDateTime(slot.endAt)}</p>}
          <p className="mt-1 text-[10px] text-muted-foreground">Private lesson</p>
        </div>
      </div>
    </button>
  )
}

function PrivateBookingCard({
  booking,
  isCancelling,
  onCancel,
}: {
  booking: TeacherBooking
  isCancelling: boolean
  onCancel: () => void
}) {
  const canCancel = booking.status === 'BOOKED'
  return (
    <article className="rounded-xl border border-border bg-slate-900/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {booking.bookingType || 'PRIVATE'}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getBookingStatusClassName(booking.status)}`}>
              {booking.status || 'UNKNOWN'}
            </span>
          </div>
          <h3 className="mt-2 font-extrabold text-white">{booking.teacherName || `Teacher #${booking.teacherId ?? '-'}`}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {formatDateTime(booking.startAt)} - {formatDateTime(booking.endAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {booking.meetLink && (
            <Button asChild variant="outline" size="sm" className="border-emerald-500/40 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 hover:text-white text-xs">
              <a href={booking.meetLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Meet
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" disabled={!canCancel || isCancelling} onClick={onCancel}>
            <XCircle className="h-3.5 w-3.5" />
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        </div>
      </div>
    </article>
  )
}

function getBookingStatusClassName(status?: string) {
  if (status === 'BOOKED') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === 'COMPLETED') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'CANCELLED') return 'border-slate-200 bg-slate-50 text-slate-700'
  return 'border-border bg-background text-foreground'
}
