import { Link } from '@tanstack/react-router'
import { LayoutDashboard, CheckSquare } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/' as const, label: '대시보드', icon: LayoutDashboard },
  { to: '/task' as const, label: '할 일', icon: CheckSquare },
]

interface LNBItemProps {
  to: string
  label: string
  icon: React.ElementType
  isActive: boolean
}

function LNBItem({ to, label, icon: Icon, isActive }: LNBItemProps) {
  return (
    <li>
      <Link
        to={to}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg font-semibold transition-colors duration-150',
          isActive
            ? 'border-l-2 border-primary bg-primary/10 text-primary font-semibold'
            : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary',
        )}
      >
        <Icon aria-hidden="true" size={22} />
        <span className="hidden lg:block">{label}</span>
      </Link>
    </li>
  )
}

interface LNBProps {
  pathname: string
}

export function LNB({ pathname }: LNBProps) {
  return (
    <nav aria-label="주 메뉴" className="hidden w-12 shrink-0 border-r border-border bg-bg-default md:flex md:flex-col lg:w-60">
      <ul className="flex flex-col gap-1 p-2 pt-4">
        {navItems.map((item) => (
          <LNBItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            isActive={item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)}
          />
        ))}
      </ul>
    </nav>
  )
}
