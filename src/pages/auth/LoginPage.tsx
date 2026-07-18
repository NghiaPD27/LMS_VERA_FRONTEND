import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
      setPostLoginError('Đăng nhập thành công nhưng vai trò tài khoản chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.')
      return
    }
    navigate(nextPath)
  }

  return (
    <div className="w-full max-w-md">
      <div className="lms-surface overflow-hidden">
        <div className="relative overflow-hidden border-b bg-[hsl(var(--brand-orange-soft))] px-8 py-7">
          <div
            className="absolute -right-10 -top-10 h-28 w-40 bg-[hsl(var(--brand-green-soft))]"
            style={{ clipPath: 'polygon(8% 18%, 92% 0, 100% 74%, 45% 100%, 0 70%)' }}
          />
          <div className="relative mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            LMS Vera
          </div>
          <h1 className="relative text-3xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
          <p className="relative mt-2 text-sm text-muted-foreground">Sign in to continue your learning dashboard.</p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleSubmit(onSubmit)}>
          {(error || postLoginError) && (
            <div data-testid="error-message" className="lms-alert-error">
              {postLoginError || getApiErrorMessage(error, 'Login failed')}
            </div>
          )}

          <div>
            <label htmlFor="username" className="text-sm font-medium text-foreground">Username</label>
            <input id="username" data-testid="username-input" className="lms-input" disabled={isPending} {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-red-600" data-testid="username-error">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <input id="password" type="password" data-testid="password-input" className="lms-input" disabled={isPending} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-600" data-testid="password-error">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isPending} data-testid="submit-button">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
