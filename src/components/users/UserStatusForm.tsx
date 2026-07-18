import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import axios from 'axios'
import { adminUsersApi } from '../../api/adminUsersApi'
import { Button } from '../common/Button'

const formSchema = z.object({
  userId: z.string().min(1, 'User code is required'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .or(z.literal(''))
    .optional()
    .nullable(),
  enabled: z.boolean().optional(),
  status: z.string().optional().nullable(),
})

type FormFields = z.infer<typeof formSchema>

export const UserStatusForm: React.FC = () => {
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      email: '',
      enabled: true,
      status: 'active',
    },
  })

  const { mutateAsync: updateStatus, isPending, error: submitError } = useMutation({
    mutationFn: async (data: FormFields) => {
      const payload: Record<string, string | boolean> = {}
      if (data.email !== '' && data.email !== null && data.email !== undefined) {
        payload.email = data.email
      }
      if (data.enabled !== undefined) {
        payload.enabled = data.enabled
      }
      if (data.status !== '' && data.status !== null && data.status !== undefined) {
        payload.status = data.status
      }

      return adminUsersApi.updateUser(data.userId, payload)
    },
    onSuccess: (data) => {
      setSuccess(`User updated successfully: ${data.username ?? 'user'}`)
      reset()
    },
    onError: () => {
      setSuccess(null)
    },
  })

  const onSubmit = async (data: FormFields) => {
    try {
      setSuccess(null)
      await updateStatus(data)
    } catch {
      // Handled by mutation state
    }
  }

  const serverError = axios.isAxiosError(submitError)
    ? submitError.response?.data?.message || 'Failed to update user status'
    : null

  return (
    <div className="lms-surface p-6">
      <h3 className="mb-4 text-lg font-extrabold text-foreground">
        Update User Status & Details
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <div data-testid="success-message" className="lms-alert-success">
            {success}
          </div>
        )}
        {serverError && (
          <div data-testid="error-message" className="lms-alert-error">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="userId" className="block text-sm font-semibold text-foreground">User Code</label>
          <input
            id="userId"
            type="text"
            data-testid="user-id-input"
            className="lms-input"
            disabled={isPending}
            {...register('userId')}
          />
          {errors.userId && (
            <p className="mt-1 text-xs text-red-600" data-testid="user-id-error">
              {errors.userId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground">Email (Optional)</label>
          <input
            id="email"
            type="text"
            data-testid="email-input"
            className="lms-input"
            disabled={isPending}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600" data-testid="email-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="enabled"
            type="checkbox"
            data-testid="enabled-checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            disabled={isPending}
            {...register('enabled')}
          />
          <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-foreground">
            Account Enabled
          </label>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-foreground">Status</label>
          <select
            id="status"
            data-testid="status-select"
            className="lms-input"
            disabled={isPending}
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="expired">Expired</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600" data-testid="status-error">
              {errors.status.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          data-testid="submit-button"
          className="w-full"
        >
          {isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </form>
    </div>
  )
}
