import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, GraduationCap, LockKeyhole, UserRound } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { Button } from '../../components/common/Button'
import { useLogin } from '../../hooks/useAuth'
import { getRoleHomePath } from '../../utils/constants'
import { getApiErrorMessage } from '../../utils/errorMessage'
import { useState } from 'react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { mutateAsync: login, isPending, error } = useLogin()
  const [postLoginError, setPostLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setPostLoginError(null)
    const loginResponse = await login(values)
    if (loginResponse.mustChangePassword) {
      navigate('/change-password')
      return
    }

    const user = await queryClient.fetchQuery({
      queryKey: ['currentUser'],
      queryFn: authApi.getCurrentUser,
      staleTime: 0,
    })
    const nextPath = user.accountAccess?.mustChangePassword ? '/change-password' : getRoleHomePath(user.role)
    if (nextPath === '/login') {
      setPostLoginError('Sign-in succeeded, but this account role is not supported yet. Please contact an administrator.')
      return
    }

    const redirect = searchParams.get('redirect')
    const safeRedirect = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null
    navigate(safeRedirect || nextPath)
  }

  return (
    <div className="w-full max-w-md">
      <Button asChild variant="ghost" className="mb-4 h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-white">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="mb-6 text-center lg:text-left">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-[0_0_20px_rgba(244,106,37,0.2)] lg:mx-0">
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">LMS Vera</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Sign in to access your courses, lessons, and learning workspace.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-[hsl(220_14%_12%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {searchParams.get('registered') === '1' && (
            <div className="lms-alert-success">
              Registration successful. You can sign in to continue.
            </div>
          )}

          {(error || postLoginError) && (
            <div data-testid="error-message" className="lms-alert-error">
              {postLoginError || getApiErrorMessage(error, 'Login failed')}
            </div>
          )}

          <div>
            <label htmlFor="username" className="text-xs font-bold text-white">Username</label>
            <div className="relative mt-1">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="username"
                data-testid="username-input"
                className="lms-input pl-10"
                autoComplete="username"
                disabled={isPending}
                {...register('username')}
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-rose-400" data-testid="username-error">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-bold text-white">Password</label>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                data-testid="password-input"
                className="lms-input pl-10"
                autoComplete="current-password"
                disabled={isPending}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-400" data-testid="password-error">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="h-11 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)]" disabled={isPending} data-testid="submit-button">
            {isPending ? 'Signing in...' : 'Sign in'}
            {!isPending && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Do not have an account?{' '}
        <Link
          to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`}
          className="font-bold text-primary hover:underline"
        >
          Create a learner account
        </Link>
      </p>
    </div>
  )
}
