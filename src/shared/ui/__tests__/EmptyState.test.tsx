import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('title을 렌더링한다', () => {
    render(<EmptyState title="데이터가 없습니다" />)
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument()
  })

  it('role="status"를 갖는다', () => {
    render(<EmptyState title="비어 있음" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('action이 있으면 버튼이 렌더링된다', async () => {
    const handleClick = vi.fn()
    render(<EmptyState title="없음" action={{ label: '새로 만들기', onClick: handleClick }} />)
    await userEvent.click(screen.getByRole('button', { name: '새로 만들기' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
