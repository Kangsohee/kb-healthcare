import { Link } from '@tanstack/react-router'
import { LayoutDashboard, CheckSquare } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/' as const, label: '대시보드', icon: LayoutDashboard },
  { to: '/task' as const, label: '할 일', icon: CheckSquare },
]

interface BottomNavProps {
  pathname: string
}

export function BottomNav({ pathname }: BottomNavProps) {
  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 border-t border-border bg-bg-default md:hidden"
    >
      {navItems.map((item) => {
        const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Icon aria-hidden="true" size={22} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
