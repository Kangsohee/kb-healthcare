import { Link } from '@tanstack/react-router'
import { UserCircle, LogIn, HeartPulse } from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'

export function GNB() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-default px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <HeartPulse aria-hidden="true" size={24} className="text-primary" />
        <span className="text-xl font-bold text-primary">KB헬스케어</span>
      </div>
      {accessToken ? (
        <Link to="/user" aria-label="회원정보" className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary">
          <UserCircle aria-hidden="true" size={24} />
        </Link>
      ) : (
        <Link to="/sign-in" aria-label="로그인" className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary">
          <LogIn aria-hidden="true" size={24} />
        </Link>
      )}
    </header>
  )
}
