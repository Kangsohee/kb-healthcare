import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  error?: string
  hint?: string
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, type = 'text', error, hint, required = false, className, ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-error">
            *
          </span>
        )}
      </div>

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={required}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors',
            'placeholder:text-text-disabled',
            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            error ? 'border-error' : 'border-border',
            rest.disabled && 'cursor-not-allowed bg-disabled-bg text-text-disabled',
            type === 'password' && 'pr-10',
            className,
          )}
          {...rest}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={16} />
            ) : (
              <Eye aria-hidden="true" size={16} />
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
})
