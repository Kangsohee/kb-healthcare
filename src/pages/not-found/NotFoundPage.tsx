import { useNavigate } from '@tanstack/react-router'
import { EmptyState } from '@/shared/ui/EmptyState'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <EmptyState
      title="페이지를 찾을 수 없습니다."
      action={{ label: '홈으로', onClick: () => navigate({ to: '/' }) }}
    />
  )
}
