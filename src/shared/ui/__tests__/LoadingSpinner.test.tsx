import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('role="status"를 갖는다', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('기본 aria-label이 "로딩 중"이다', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '로딩 중')
  })

  it('커스텀 label이 적용된다', () => {
    render(<LoadingSpinner label="데이터 불러오는 중" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '데이터 불러오는 중')
  })

  it('sr-only 텍스트가 포함된다', () => {
    render(<LoadingSpinner label="로딩" />)
    expect(screen.getByText('로딩')).toHaveClass('sr-only')
  })
})
