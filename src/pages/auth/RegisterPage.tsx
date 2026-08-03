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
      <div className="lms-surface overflow-hidden border-border bg-[hsl(220_14%_10%)]">
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-slate-900 to-[hsl(220_14%_11%)] px-8 py-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
            Vera Language
          </div>
          <h1 className="relative text-3xl font-extrabold tracking-tight text-white">Create a learner account</h1>
          <p className="relative mt-1 text-xs text-muted-foreground">
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
            <label htmlFor="firstName" className="text-xs font-bold text-white">First Name</label>
            <input id="firstName" className="lms-input" disabled={isPending} {...register('firstName')} />
            {errors.firstName && <p className="mt-1 text-xs text-rose-400">{errors.firstName.message}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="text-xs font-bold text-white">Last Name</label>
            <input id="lastName" className="lms-input" disabled={isPending} {...register('lastName')} />
            {errors.lastName && <p className="mt-1 text-xs text-rose-400">{errors.lastName.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="text-xs font-bold text-white">Username</label>
            <input id="username" className="lms-input" disabled={isPending} {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-bold text-white">Email</label>
            <input id="email" type="email" className="lms-input" disabled={isPending} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-bold text-white">Password</label>
            <input id="password" type="password" className="lms-input" disabled={isPending} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="text-xs font-bold text-white">Phone Number</label>
            <input id="phoneNumber" className="lms-input" disabled={isPending} {...register('phoneNumber')} />
            {errors.phoneNumber && <p className="mt-1 text-xs text-rose-400">{errors.phoneNumber.message}</p>}
          </div>

          <div className="sm:col-span-2 pt-2">
            <Button type="submit" className="h-11 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)]" disabled={isPending} data-testid="register-submit-button">
              {isPending ? 'Creating account...' : 'Create learner account'}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
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
