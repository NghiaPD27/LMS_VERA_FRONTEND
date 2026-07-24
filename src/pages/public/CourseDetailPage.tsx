import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Seo } from '../../components/common/Seo'
import { siteUrl } from '../../utils/seo'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { SalesStatusBadge } from '../../components/programs/SalesStatusBadge'
import { PurchaseStatusBadge } from '../../components/purchases/PurchaseStatusBadge'
import { useGetPublicProgram } from '../../hooks/usePrograms'
import { useCurrentUser } from '../../hooks/useAuth'
import { useCreateStudentPurchase, useGetStudentPurchases } from '../../hooks/usePurchases'
import { useGetMyEnrollments } from '../../hooks/useEnrollments'
import { getAccessToken } from '../../utils/tokenStorage'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import { hasActiveCourseAccess, isEnrollmentExpired } from '../../utils/enrollmentAccess'
import { formatCurrency } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'

interface CourseDetailPageProps {
  embedded?: boolean
  courseBasePath?: string
}

export function CourseDetailPage({ embedded = false, courseBasePath = '/courses' }: CourseDetailPageProps) {
  const { programId } = useParams<{ programId: string }>()
  const id = Number(programId)
  const navigate = useNavigate()
  const { data: program, isLoading, isError, error, refetch } = useGetPublicProgram(id)
  const { data: user } = useCurrentUser()
  const token = getAccessToken()
  const isStudent = user?.role === ROLES.STUDENT
  const isAdmin = user?.role === ROLES.ADMIN
  const createPurchaseMutation = useCreateStudentPurchase()
  const studentPurchasesQuery = useGetStudentPurchases({ enabled: !!token && isStudent })
  const enrollmentsQuery = useGetMyEnrollments({ enabled: !!token && isStudent })

  const currentPath = `${courseBasePath}/${id}`
  const loginPath = `/login?redirect=${encodeURIComponent(currentPath)}`
  const registerPath = `/register?redirect=${encodeURIComponent(currentPath)}`
  const purchase = createPurchaseMutation.data

  const handlePurchase = async () => {
    if (!program?.id) return
    const createdPurchase = await createPurchaseMutation.mutateAsync({ programId: program.id })
    if (createdPurchase.id) {
      navigate(`/student/purchases/${createdPurchase.id}`)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading course..." />
  }

  if (isError || !program) {
    return (
      <main className={embedded ? 'p-0' : 'vera-public-bg min-h-screen p-6'}>
        <ErrorState message={getFriendlyApiErrorMessage(error, 'Failed to load course')} onRetry={refetch} />
      </main>
    )
  }

  const purchaseError = createPurchaseMutation.error
  const programEnrollment = enrollmentsQuery.data?.find((enrollment) => enrollment.programId === program.id)
  const currentEnrollment = hasActiveCourseAccess(programEnrollment) ? programEnrollment : undefined
  const expiredEnrollment = programEnrollment && isEnrollmentExpired(programEnrollment) ? programEnrollment : undefined
  const relatedPurchases = studentPurchasesQuery.data?.filter((item) => item.programId === program.id) ?? []
  const pendingPurchase = relatedPurchases.find((item) => item.status === 'PENDING')
  const paidPurchase = relatedPurchases.find((item) => item.status === 'PAID')
  const paidEnrollmentId = currentEnrollment?.id
  const isAvailableForPurchase = !program.salesStatus || program.salesStatus === 'PUBLISHED'

  return (
    <main className={embedded ? 'text-foreground' : 'vera-public-bg min-h-screen text-foreground'}>
      <Seo
        title={embedded ? `LMS Vera | ${program.name}` : `${program.name} | Khóa học online trên LMS Vera`}
        description={
          program.description ||
          'Khóa học online trên LMS Vera với lộ trình rõ ràng, video bài học, quiz và giáo viên hỗ trợ.'
        }
        path={`/courses/${program.id}`}
        noindex={embedded}
        type="article"
        jsonLd={
          embedded
            ? undefined
            : {
                '@context': 'https://schema.org',
                '@type': 'Course',
                name: program.name,
                description:
                  program.description ||
                  'Khóa học online trên LMS Vera với lộ trình rõ ràng, video bài học, quiz và giáo viên hỗ trợ.',
                url: `${siteUrl}/courses/${program.id}`,
                provider: {
                  '@type': 'EducationalOrganization',
                  name: 'LMS Vera',
                  sameAs: siteUrl,
                },
                offers: {
                  '@type': 'Offer',
                  price: program.price || 0,
                  priceCurrency: program.currency || 'VND',
                  availability: program.salesStatus === 'PUBLISHED' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
                },
              }
        }
      />
      <section className={embedded ? 'lms-page-shell' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'}>
        <Button asChild variant="ghost" className="mb-5">
          <Link to={courseBasePath}>
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="lms-surface overflow-hidden">
            <div className="relative border-b bg-[hsl(var(--brand-green))] p-8 text-white">
              <div
                className="absolute -right-10 -top-10 h-36 w-52 bg-[hsl(var(--brand-green-soft))]/70"
                style={{ clipPath: 'polygon(8% 18%, 92% 0, 100% 74%, 45% 100%, 0 70%)' }}
              />
              <div className="relative">
                <SalesStatusBadge status={program.salesStatus} />
                <h1 className="mt-5 text-4xl font-extrabold tracking-normal">{program.name}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                  {program.description || 'Vera is updating the detailed course description.'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              {['Clear learning path', 'Flexible online study', 'Practical speaking practice'].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-white p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-[hsl(var(--brand-green))]" />
                  <p className="font-bold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="lms-surface h-fit p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Tuition</p>
            <p className="mt-1 text-3xl font-extrabold text-primary">
              {formatCurrency(program.price, program.currency || 'VND')}
            </p>

            {purchase && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <PurchaseStatusBadge status={purchase.status} />
                <p className="mt-3 text-sm leading-6 text-amber-800">
                  Your purchase request has been created. Open the payment page to scan the QR code and complete the transfer.
                </p>
                <Button asChild variant="outline" className="mt-4 w-full bg-white">
                  <Link to={purchase.id ? `/student/purchases/${purchase.id}` : '/student/purchases'}>View payment</Link>
                </Button>
              </div>
            )}

            {purchaseError && (
              <div className="mt-5 lms-alert-error">
                <p>{getFriendlyApiErrorMessage(purchaseError, 'Failed to create purchase request')}</p>
                <Button asChild variant="outline" className="mt-3 bg-white">
                  <Link to="/student/purchases">View my purchases</Link>
                </Button>
              </div>
            )}

            {!token ? (
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full">
                  <Link to={loginPath}>
                    Sign in to buy
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={registerPath}>Create learner account</Link>
                </Button>
              </div>
            ) : isStudent ? (
              <div className="mt-6 space-y-3">
                {currentEnrollment || paidEnrollmentId ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/student/lessons/${program.id}`}>Start learning</Link>
                  </Button>
                ) : expiredEnrollment ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
                    This course access has expired. Contact Vera to extend your enrollment.
                  </div>
                ) : pendingPurchase?.id ? (
                  <Button asChild className="w-full">
                    <Link to={`/student/purchases/${pendingPurchase.id}`}>
                      View payment
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : paidPurchase ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                    Payment confirmed. Vera is preparing your course enrollment.
                  </p>
                ) : isAvailableForPurchase ? (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={createPurchaseMutation.isPending || !!purchase}
                    onClick={handlePurchase}
                    data-testid="buy-course-button"
                  >
                    {createPurchaseMutation.isPending ? 'Creating request...' : 'Buy course'}
                  </Button>
                ) : (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    This course is not open for purchase right now.
                  </p>
                )}
              </div>
            ) : isAdmin ? (
              <Button asChild className="mt-6 w-full">
                <Link to={`/admin/programs/${program.id}`}>Manage course</Link>
              </Button>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">This account role does not support course purchases yet.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
