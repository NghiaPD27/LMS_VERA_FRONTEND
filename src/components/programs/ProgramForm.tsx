import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
        return undefined
      }
      return Number(value)
    },
    z.number().min(0, 'Price must be at least 0').optional()
  ),
  currency: z.string().optional(),
  salesStatus: z.string().optional(),
})

export type ProgramFormValues = z.infer<typeof programSchema>
type ProgramFormInput = z.input<typeof programSchema>

interface ProgramFormProps {
  initialValues?: Partial<ProgramFormValues>
  onSubmit: (values: ProgramFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  serverError?: string | null
}

export const ProgramForm: React.FC<ProgramFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  serverError
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProgramFormInput, unknown, ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      price: initialValues?.price,
      currency: initialValues?.currency || 'VND',
      salesStatus: initialValues?.salesStatus || 'DRAFT',
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div data-testid="error-message" className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Program Name
        </label>
        <Input
          id="name"
          type="text"
          data-testid="program-name-input"
          disabled={isLoading}
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600" data-testid="program-name-error">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          data-testid="program-description-input"
          rows={3}
          className="lms-input"
          disabled={isLoading}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600" data-testid="program-description-error">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1000"
            data-testid="program-price-input"
            disabled={isLoading}
            {...register('price')}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600" data-testid="program-price-error">
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <Input
            id="currency"
            type="text"
            data-testid="program-currency-input"
            disabled={isLoading}
            {...register('currency')}
          />
          {errors.currency && (
            <p className="mt-1 text-xs text-red-600" data-testid="program-currency-error">
              {errors.currency.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="salesStatus" className="block text-sm font-medium text-gray-700">
            Sales Status
          </label>
          <select
            id="salesStatus"
            data-testid="program-sales-status-select"
            className="lms-input"
            disabled={isLoading}
            {...register('salesStatus')}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">On Sale</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {errors.salesStatus && (
            <p className="mt-1 text-xs text-red-600" data-testid="program-sales-status-error">
              {errors.salesStatus.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" data-testid="program-form-submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
