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
          className="h-auto p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
          disabled={isLoggingOut}
          onClick={handleBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Button>
        <Link to="/" className="text-sm font-bold text-primary hover:underline">
          Home
        </Link>
      </div>
      <div className="mb-5 text-center lg:text-left">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-green-soft))] text-[hsl(var(--brand-green))] shadow-[0_12px_28px_rgba(47,143,91,0.14)] lg:mx-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-sm font-extrabold text-[hsl(var(--brand-green))]">Account Security</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-normal text-foreground">Change password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Update your password before entering your learning workspace.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-[0_18px_50px_rgba(27,89,56,0.10)] sm:p-6">
        <div className="mb-4 rounded-lg border border-[hsl(var(--brand-green))]/20 bg-[hsl(var(--brand-green-soft))] p-3">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand-green))]" />
            <div>
              <p className="text-sm font-bold text-foreground">Use a stronger password</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
            <label htmlFor="oldPassword" className="text-sm font-bold text-foreground">Current Password</label>
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
            {errors.oldPassword && <p className="mt-1 text-xs text-red-600" data-testid="old-password-error">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="text-sm font-bold text-foreground">New Password</label>
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
            {errors.newPassword && <p className="mt-1 text-xs text-red-600" data-testid="new-password-error">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">Confirm New Password</label>
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
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600" data-testid="confirm-password-error">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isPending} data-testid="submit-button">
            {isPending ? 'Updating...' : 'Change Password'}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
