import { useRef, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useNavigate } from '@tanstack/react-router'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import type { TaskItem } from '@/entities/task'

interface TaskVirtualListProps {
  items: TaskItem[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function TaskVirtualList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: TaskVirtualListProps) {
  const navigate = useNavigate()
  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 104,
    overscan: 3,
  })

  const handleCardClick = useCallback(
    (id: string) => {
      navigate({ to: '/task/$id', params: { id } })
    },
    [navigate],
  )

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        role="list"
        className="relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index]
          if (!item) return null
          return (
            <div
              key={virtualRow.key}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '8px',
              }}
            >
              <TaskCard
                id={item.id}
                title={item.title}
                memo={item.memo}
                status={item.status}
                onClick={handleCardClick}
              />
            </div>
          )
        })}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <LoadingSpinner label="다음 항목 불러오는 중" size="sm" />
        )}
      </div>
    </div>
  )
}
