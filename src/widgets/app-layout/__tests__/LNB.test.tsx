import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createRouter, createRootRoute, createMemoryHistory } from '@tanstack/react-router'
import { LNB } from '../ui/LNB'

function renderLNB(pathname: string) {
  const history = createMemoryHistory({ initialEntries: [pathname] })
  const rootRoute = createRootRoute({ component: () => <LNB pathname={pathname} /> })
  const router = createRouter({ routeTree: rootRoute, history })
  return render(<RouterProvider router={router} />)
}

describe('LNB', () => {
  it('대시보드와 할 일 링크가 렌더링된다', async () => {
    renderLNB('/')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /대시보드/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /할 일/ })).toBeInTheDocument()
    })
  })

  it('nav에 aria-label="주 메뉴"가 있다', async () => {
    renderLNB('/')
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: '주 메뉴' })).toBeInTheDocument()
    })
  })

  it('/task 경로에서 할 일 링크에 aria-current="page"가 설정된다', async () => {
    renderLNB('/task')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /할 일/ })).toHaveAttribute('aria-current', 'page')
    })
  })

  it('링크 목록이 ul > li 구조로 렌더링된다', async () => {
    renderLNB('/')
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })
})
