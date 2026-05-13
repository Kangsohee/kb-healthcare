import { useUser } from '@/entities/user'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { usePageTitle } from '@/shared/lib/usePageTitle'

export function UserPage() {
  usePageTitle('회원정보')
  const { data, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const initial = data?.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">회원정보</h1>
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-bg-default p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary"
          >
            {initial}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-semibold text-text-primary">{data?.name}</p>
            <span className="text-xs text-text-secondary">회원</span>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-text-primary">메모</span>
            <p className="text-sm text-text-secondary">{data?.memo || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
