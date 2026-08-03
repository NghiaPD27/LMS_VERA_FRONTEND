import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="lms-surface flex min-h-48 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">{message}</p>
            <p className="text-xs text-muted-foreground">Preparing latest data</p>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="vera-skeleton h-3 w-full" />
          <div className="vera-skeleton h-3 w-4/5" />
          <div className="vera-skeleton h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}
