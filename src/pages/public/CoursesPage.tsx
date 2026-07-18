import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { SalesStatusBadge } from '../../components/programs/SalesStatusBadge'
import { useGetPublicPrograms } from '../../hooks/usePrograms'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { formatCurrency } from '../../utils/formatters'

interface CoursesPageProps {
  embedded?: boolean
  courseBasePath?: string
}

export function CoursesPage({ embedded = false, courseBasePath = '/courses' }: CoursesPageProps) {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error, refetch } = useGetPublicPrograms({
    keyword: keyword || undefined,
    page,
    size: 9,
  })

  const programs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <main className={embedded ? 'text-foreground' : 'vera-public-bg min-h-screen text-foreground'}>
      {!embedded && (
      <header className="border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-extrabold">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            LMS Vera
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      )}

      <section className={embedded ? 'lms-page-shell' : 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'}>
        <div className="lms-page-hero">
          <div className="lms-page-hero-inner">
            <p className="text-sm font-bold text-primary">Vera Courses</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-normal text-foreground">
              Choose the right learning path for your goals
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Explore English and Vietnamese courses that are currently open for registration.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-lg flex-1">
            <label htmlFor="course-search" className="sr-only">Search courses</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="course-search"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                setPage(0)
              }}
              className="lms-input pl-9"
              placeholder="Search courses"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
              Previous
            </Button>
            <span>
              Page {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <Button type="button" variant="outline" size="sm" disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <LoadingState message="Loading courses..." />
          ) : isError ? (
            <ErrorState message={getFriendlyApiErrorMessage(error, 'Failed to load courses')} onRetry={refetch} />
          ) : programs.length === 0 ? (
            <EmptyState message="No courses found" description="Please check back later or try another keyword." />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {programs.map((program) => (
                <article key={program.id} className="lms-surface flex flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))]">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <SalesStatusBadge status={program.salesStatus} />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground">{program.name}</h2>
                  <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                    {program.description || 'Vera is updating the detailed course description.'}
                  </p>
                  <div className="mt-5 text-2xl font-extrabold text-primary">
                    {formatCurrency(program.price, program.currency || 'VND')}
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link to={`${courseBasePath}/${program.id}`}>
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
