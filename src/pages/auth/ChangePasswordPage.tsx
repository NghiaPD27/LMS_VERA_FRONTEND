import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/common/Button'
import { authApi } from '../../api/authApi'
import { useChangePassword } from '../../hooks/useAuth'
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

  return (
    <div className="w-full max-w-md">
      <div className="lms-surface overflow-hidden">
        <div className="border-b bg-[hsl(var(--brand-green-soft))] p-8">
          <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-green))] shadow-sm">
            Security
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Change Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">You must update your password before continuing.</p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div data-testid="error-message" className="lms-alert-error">
              {getApiErrorMessage(error, 'Change password failed')}
            </div>
          )}

          <div>
            <label htmlFor="oldPassword" className="text-sm font-medium text-foreground">Current Password</label>
            <input id="oldPassword" type="password" data-testid="old-password-input" className="lms-input" disabled={isPending} {...register('oldPassword')} />
            {errors.oldPassword && <p className="mt-1 text-xs text-red-600" data-testid="old-password-error">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</label>
            <input id="newPassword" type="password" data-testid="new-password-input" className="lms-input" disabled={isPending} {...register('newPassword')} />
            {errors.newPassword && <p className="mt-1 text-xs text-red-600" data-testid="new-password-error">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</label>
            <input id="confirmPassword" type="password" data-testid="confirm-password-input" className="lms-input" disabled={isPending} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600" data-testid="confirm-password-error">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isPending} data-testid="submit-button">
            {isPending ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
