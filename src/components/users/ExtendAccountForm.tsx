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
  months: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))) {
        return undefined
      }
      return Number(val)
    },
    z.number({
      required_error: 'Months is required',
      invalid_type_error: 'Months is required',
    })
      .int('Months must be an integer')
      .min(1, 'Months must be at least 1')
  ),
})

type FormFields = z.infer<typeof formSchema>
type FormInput = z.input<typeof formSchema>

export const ExtendAccountForm: React.FC = () => {
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
    },
  })

  const { mutateAsync: extendAccount, isPending, error: submitError } = useMutation({
    mutationFn: async (data: FormFields) => {
      return adminUsersApi.extendAccount(data.userId, data.months)
    },
    onSuccess: (data) => {
      setSuccess(`Account extended successfully. New expiration date: ${data.expiredAt}`)
      reset()
    },
    onError: () => {
      setSuccess(null)
    },
  })

  const onSubmit = async (data: FormFields) => {
    try {
      setSuccess(null)
      await extendAccount(data)
    } catch {
      // Handled by mutation state
    }
  }

  const serverError = axios.isAxiosError(submitError)
    ? submitError.response?.data?.message || 'Failed to extend account'
    : null

  return (
    <div className="lms-surface p-6">
      <h3 className="mb-4 text-lg font-extrabold text-foreground">
        Extend Student Account
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
          <label htmlFor="months" className="block text-sm font-semibold text-foreground">Months</label>
          <input
            id="months"
            type="number"
            step="any"
            data-testid="months-input"
            className="lms-input"
            disabled={isPending}
            {...register('months', { valueAsNumber: true })}
          />
          {errors.months && (
            <p className="mt-1 text-xs text-red-600" data-testid="months-error">
              {errors.months.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          data-testid="submit-button"
          className="w-full"
        >
          {isPending ? 'Extending...' : 'Extend Account'}
        </Button>
      </form>
    </div>
  )
}
