import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router'
import { TaskVirtualList } from '../ui/TaskVirtualList'
import type { TaskItem } from '@/entities/task'

const mockItems: TaskItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: `task-${i + 1}`,
  title: `할 일 ${i + 1}`,
  memo: `메모 ${i + 1}`,
  status: i % 2 === 0 ? 'DONE' : 'TODO',
}))

function renderVirtualList(props: Partial<Parameters<typeof TaskVirtualList>[0]> = {}) {
  const defaults = {
    items: mockItems,
    hasNextPage: false,
    isFetchingNextPage: false,
    onLoadMore: vi.fn(),
  }
  const merged = { ...defaults, ...props }
  const rootRoute = createRootRoute({ component: () => <TaskVirtualList {...merged} /> })
  const router = createRouter({ routeTree: rootRoute })
  return render(<RouterProvider router={router} />)
}

describe('TaskVirtualList', () => {
  it('role="list" 컨테이너가 렌더링된다', async () => {
    renderVirtualList()
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  it('isFetchingNextPage=true이면 로딩 스피너가 표시된다', async () => {
    renderVirtualList({ isFetchingNextPage: true, hasNextPage: true })
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  it('isFetchingNextPage=false이면 로딩 스피너가 없다', async () => {
    renderVirtualList({ isFetchingNextPage: false })
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('items가 비어있어도 크래시 없이 렌더링된다', async () => {
    renderVirtualList({ items: [] })
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })
})
