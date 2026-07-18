import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { useRegisterStudent } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../utils/errorMessage'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email address').max(100, 'Email cannot exceed 100 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  phoneNumber: z.string().regex(/^\d*$/, 'Phone number can only contain digits').max(20, 'Phone number cannot exceed 20 characters').optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mutateAsync: registerStudent, isPending, error } = useRegisterStudent()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    await registerStudent({
      ...values,
      phoneNumber: values.phoneNumber || undefined,
    })

    const redirect = searchParams.get('redirect')
    const query = new URLSearchParams({ registered: '1' })
    if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
      query.set('redirect', redirect)
    }
    navigate(`/login?${query.toString()}`)
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="lms-surface overflow-hidden">
        <div className="relative overflow-hidden border-b bg-[hsl(var(--brand-green-soft))] px-8 py-7">
          <div
            className="absolute -right-10 -top-10 h-28 w-40 bg-[hsl(var(--brand-orange-soft))]"
            style={{ clipPath: 'polygon(8% 18%, 92% 0, 100% 74%, 45% 100%, 0 70%)' }}
          />
          <div className="relative mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-green))] shadow-sm">
            LMS Vera
          </div>
          <h1 className="relative text-3xl font-extrabold tracking-tight text-foreground">Create a learner account</h1>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Create an account to purchase a course and start the path that fits your goals.
          </p>
        </div>

        <form className="grid gap-5 p-8 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div data-testid="register-error-message" className="lms-alert-error sm:col-span-2">
              {getApiErrorMessage(error, 'Registration failed. Please check your information.')}
            </div>
          )}

          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
            <input id="firstName" className="lms-input" disabled={isPending} {...register('firstName')} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
            <input id="lastName" className="lms-input" disabled={isPending} {...register('lastName')} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-medium text-foreground">Username</label>
            <input id="username" className="lms-input" disabled={isPending} {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" className="lms-input" disabled={isPending} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <input id="password" type="password" className="lms-input" disabled={isPending} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">Phone Number</label>
            <input id="phoneNumber" className="lms-input" disabled={isPending} {...register('phoneNumber')} />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" disabled={isPending} data-testid="register-submit-button">
              {isPending ? 'Creating account...' : 'Create learner account'}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
