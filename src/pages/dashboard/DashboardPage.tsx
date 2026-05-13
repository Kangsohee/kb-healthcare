import { Layers, CircleEllipsis, CheckCircle2 } from 'lucide-react'
import { useDashboard, DashboardMetricCard } from '@/entities/dashboard'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { usePageTitle } from '@/shared/lib/usePageTitle'

export function DashboardPage() {
  usePageTitle('대시보드')
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">대시보드</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <DashboardMetricCard
          label="일"
          value={data?.numOfTask ?? 0}
          icon={<Layers size={28} className="text-primary" />}
        />
        <DashboardMetricCard
          label="해야할 일"
          value={data?.numOfRestTask ?? 0}
          icon={<CircleEllipsis size={28} className="text-text-secondary" />}
        />
        <DashboardMetricCard
          label="한 일"
          value={data?.numOfDoneTask ?? 0}
          icon={<CheckCircle2 size={28} className="text-success" />}
        />
      </div>
    </div>
  )
}
