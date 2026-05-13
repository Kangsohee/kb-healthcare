import { cn } from '@/shared/lib/cn'

interface ButtonProps {
  variant?: 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  'aria-label'?: string
  className?: string
}

const variantClasses = {
  primary: 'bg-primary text-white enabled:hover:bg-primary-hover enabled:active:bg-primary-hover disabled:opacity-40',
  danger: 'bg-error text-white enabled:hover:opacity-90 enabled:active:opacity-80 disabled:opacity-40',
  ghost: 'text-text-secondary border border-border enabled:hover:bg-bg-subtle enabled:active:bg-border disabled:opacity-40',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  children,
  'aria-label': ariaLabel,
  className,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors enabled:active:scale-[0.97]',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'cursor-default',
        className,
      )}
    >
      {isLoading && (
        <span
          role="img"
          aria-label="로딩 중"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
