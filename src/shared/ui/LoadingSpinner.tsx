import { cn } from '@/shared/lib/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

export function LoadingSpinner({ size = 'md', label = '로딩 중' }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center">
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size],
        )}
      />
    </div>
  )
}
