import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { authApi } from '../../api/authApi'
import { useChangePassword, useLogout } from '../../hooks/useAuth'
import { getRoleHomePath } from '../../utils/constants'
import { getApiErrorMessage } from '../../utils/errorMessage'

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: changePassword, isPending, error } = useChangePassword()
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (values: ChangePasswordFormValues) => {
    await changePassword({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    })
    const user = await queryClient.fetchQuery({
      queryKey: ['currentUser'],
      queryFn: authApi.getCurrentUser,
    })
    navigate(getRoleHomePath(user.role))
  }

  const handleBackToLogin = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-white"
          disabled={isLoggingOut}
          onClick={handleBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Button>
        <Link to="/" className="text-xs font-bold text-primary hover:underline">
          Home
        </Link>
      </div>

      <div className="mb-6 text-center lg:text-left">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-[0_0_20px_rgba(244,106,37,0.2)] lg:mx-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Account Security</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Change password</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Update your password before entering your learning workspace.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-[hsl(220_14%_12%)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-3.5">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold text-white">Use a stronger password</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Your new password must have at least 8 characters and should be different from your current password.
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div data-testid="error-message" className="lms-alert-error">
              {getApiErrorMessage(error, 'Change password failed')}
            </div>
          )}

          <div>
            <label htmlFor="oldPassword" className="text-xs font-bold text-white">Current password</label>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="oldPassword"
                type="password"
                data-testid="old-password-input"
                className="lms-input pl-10"
                autoComplete="current-password"
                disabled={isPending}
                {...register('oldPassword')}
              />
            </div>
            {errors.oldPassword && <p className="mt-1 text-xs text-rose-400" data-testid="old-password-error">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="text-xs font-bold text-white">New password</label>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="newPassword"
                type="password"
                data-testid="new-password-input"
                className="lms-input pl-10"
                autoComplete="new-password"
                disabled={isPending}
                {...register('newPassword')}
              />
            </div>
            {errors.newPassword && <p className="mt-1 text-xs text-rose-400" data-testid="new-password-error">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-xs font-bold text-white">Confirm new password</label>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                data-testid="confirm-password-input"
                className="lms-input pl-10"
                autoComplete="new-password"
                disabled={isPending}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400" data-testid="confirm-password-error">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="h-11 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)]" disabled={isPending} data-testid="submit-button">
            {isPending ? 'Updating...' : 'Update password'}
            {!isPending && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
