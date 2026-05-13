import { useCallback } from 'react'
import { useTasks } from '@/entities/task'
import { TaskVirtualList } from '@/widgets/task-virtual-list'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePageTitle } from '@/shared/lib/usePageTitle'

export function TaskListPage() {
  usePageTitle('할 일')
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useTasks()

  const handleLoadMore = useCallback(() => {
    fetchNextPage()
  }, [fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const allItems = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="text-2xl font-bold text-text-primary">할 일</h1>
      {allItems.length === 0 ? (
        <EmptyState title="등록된 할 일이 없습니다." />
      ) : (
        <div className="flex-1 overflow-hidden">
          <TaskVirtualList
            items={allItems}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={handleLoadMore}
          />
        </div>
      )}
    </div>
  )
}
