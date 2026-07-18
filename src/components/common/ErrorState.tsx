import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry
}) => {
  return (
    <div className="flex min-h-48 items-center justify-center p-6">
      <div className="lms-surface max-w-md space-y-4 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-red-700">{message}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
