import { cn } from '@/shared/lib/cn'

interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function Card({ children, onClick, className }: CardProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full rounded-xl border border-border bg-bg-default p-4 text-left',
          'transition-colors hover:bg-bg-subtle',
          'focus-visible:outline-none',
          className,
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-bg-default p-4', className)}>
      {children}
    </div>
  )
}
