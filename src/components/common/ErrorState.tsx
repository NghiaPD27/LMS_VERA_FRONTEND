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
      <div className="lms-surface max-w-md space-y-4 p-6 text-center border-rose-900/40 bg-rose-950/20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-900/30 text-rose-400 border border-rose-800/40">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-rose-300">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-rose-800/60 text-rose-300 hover:bg-rose-900/40">
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
