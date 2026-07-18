import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export const lessonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lessonNumber: z.coerce.number().int().min(1, 'Lesson number must be >= 1'),
  content: z.string().optional()
})

export type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonFormProps {
  initialValues?: Partial<LessonFormValues>
  onSubmit: (values: LessonFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  serverError?: string | null
}

export const LessonForm: React.FC<LessonFormProps> = ({
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
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: initialValues?.name || '',
      lessonNumber: initialValues?.lessonNumber || 1,
      content: initialValues?.content || ''
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
          Lesson Name
        </label>
        <Input
          id="name"
          type="text"
          data-testid="lesson-name-input"
          disabled={isLoading}
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600" data-testid="lesson-name-error">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="lessonNumber" className="block text-sm font-medium text-gray-700">
          Lesson Number
        </label>
        <Input
          id="lessonNumber"
          type="number"
          data-testid="lesson-number-input"
          disabled={isLoading}
          {...register('lessonNumber')}
        />
        {errors.lessonNumber && (
          <p className="mt-1 text-xs text-red-600" data-testid="lesson-number-error">
            {errors.lessonNumber.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          data-testid="lesson-content-input"
          rows={5}
          className="lms-input"
          disabled={isLoading}
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-600" data-testid="lesson-content-error">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" data-testid="lesson-form-submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
