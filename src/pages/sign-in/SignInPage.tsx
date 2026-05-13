import { useNavigate } from '@tanstack/react-router'
import { HeartPulse } from 'lucide-react'
import { SignInForm } from '@/features/auth'
import { useAuthStore } from '@/shared/store/authStore'
import { useEffect } from 'react'
import { Route } from '@/app/router/routes/sign-in'
import { usePageTitle } from '@/shared/lib/usePageTitle'

export function SignInPage() {
  usePageTitle('로그인')
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const { redirect } = Route.useSearch()

  useEffect(() => {
    if (accessToken) {
      navigate({ to: redirect ?? '/' })
    }
  }, [accessToken, navigate, redirect])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
          <HeartPulse aria-hidden="true" size={28} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-text-primary">KB헬스케어</p>
          <p className="mt-0.5 text-sm text-text-secondary">건강한 하루를 관리하세요</p>
        </div>
      </div>
      <div className="w-full rounded-2xl border border-border bg-bg-default p-8 shadow-lg">
        <h1 className="mb-1.5 text-2xl font-bold text-text-primary">로그인</h1>
        <p className="mb-6 text-sm text-text-secondary">서비스를 이용하려면 로그인하세요.</p>
        <SignInForm redirectTo={redirect} />
      </div>
    </div>
  )
}
