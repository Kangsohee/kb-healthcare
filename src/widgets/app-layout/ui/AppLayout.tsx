import { useRouterState } from '@tanstack/react-router'
import { GNB } from './GNB'
import { LNB } from './LNB'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isSignIn = pathname === '/sign-in'

  if (isSignIn) {
    return (
      <div className="flex h-dvh flex-col">
        <GNB />
        <main className="flex flex-1 items-center justify-center px-4 py-8">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col">
      <GNB />
      <div className="flex flex-1 overflow-hidden">
        <LNB pathname={pathname} />
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">{children}</main>
      </div>
      <BottomNav pathname={pathname} />
    </div>
  )
}
