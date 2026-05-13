interface DashboardMetricCardProps {
  label: string
  value: number
  icon: React.ReactNode
}

export function DashboardMetricCard({ label, value, icon }: DashboardMetricCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-default p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`${label}: ${value}건`}
    >
      <span aria-hidden="true">{icon}</span>
      <strong className="text-3xl font-bold text-primary">{value}</strong>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
  )
}
