import { cn } from '@/shared/lib/cn'
import type { TaskItem } from '../model/types'

interface TaskCardProps {
  id: string
  title: string
  memo: string
  status: TaskItem['status']
  onClick: (id: string) => void
}

const statusConfig = {
  DONE: {
    label: '완료',
    badgeClass: 'border-success/30 bg-success/10 text-success',
    titleClass: 'text-success line-through',
  },
  TODO: {
    label: '할 일',
    badgeClass: 'border-border bg-bg-subtle text-text-secondary',
    titleClass: 'text-text-primary',
  },
} as const

export function TaskCard({ id, title, memo, status, onClick }: TaskCardProps) {
  const cfg = statusConfig[status]

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-label={`${title} — ${cfg.label}`}
      className={cn(
        'flex h-24 w-full items-center gap-4 rounded-xl border border-border bg-bg-default px-4 py-3',
        'text-left transition-all duration-150 hover:bg-bg-subtle hover:-translate-y-0.5 hover:shadow-md',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={cn('truncate text-base font-semibold', cfg.titleClass)}>
          {title}
        </span>
        <span className="line-clamp-1 text-sm text-text-secondary">{memo}</span>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full border px-3 py-1 text-sm font-semibold',
          cfg.badgeClass,
        )}
      >
        {cfg.label}
      </span>
    </button>
  )
}
