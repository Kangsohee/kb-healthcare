import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Route } from '@/app/router/routes/task/$id'
import { useTaskDetail } from '@/entities/task'
import { DeleteConfirmModal, useDeleteTask } from '@/features/task-delete'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Button } from '@/shared/ui/Button'
import { formatDate } from '@/shared/lib/formatDate'
import { usePageTitle } from '@/shared/lib/usePageTitle'

export function TaskDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data, isLoading, error } = useTaskDetail(id)
  usePageTitle(data?.title ?? '할 일 상세')
  const deleteTask = useDeleteTask()

  const is404 = (error as { response?: { status?: number } })?.response?.status === 404

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (is404 || !data) {
    return (
      <EmptyState
        title="리소스를 찾을 수 없습니다."
        action={{ label: '목록으로 돌아가기', onClick: () => navigate({ to: '/task' }) }}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/task' })}
            aria-label="목록으로"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            목록으로
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            aria-label="삭제"
          >
            <Trash2 aria-hidden="true" size={16} />
            삭제
          </Button>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold text-text-primary">{data.title}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-semibold text-text-primary">메모</span>
            <p className="text-base text-text-secondary">{data.memo || '—'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-semibold text-text-primary">등록일</span>
            <p className="text-base text-text-secondary">{formatDate(data.registerDatetime)}</p>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        taskId={id}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteTask.mutate(id)}
        isDeleting={deleteTask.isPending}
      />
    </>
  )
}
