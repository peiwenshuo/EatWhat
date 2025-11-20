import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
  text?: string
}

export function Loading({ size = 'md', className, fullScreen = false, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  }

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('flex items-center', gapClasses[size])}>
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full bg-primary animate-bounce',
            '[animation-delay:-0.3s]'
          )}
        />
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full bg-primary animate-bounce',
            '[animation-delay:-0.15s]'
          )}
        />
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full bg-primary animate-bounce'
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    )
  }

  return content
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
