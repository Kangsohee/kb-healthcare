import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>제출</Button>)
    expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument()
  })

  it('disabled 상태일 때 클릭 핸들러가 호출되지 않는다', async () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>제출</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('isLoading 상태일 때 aria-busy="true"를 갖는다', () => {
    render(<Button isLoading>제출</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('isLoading 상태일 때 로딩 스피너가 표시된다', () => {
    render(<Button isLoading>제출</Button>)
    expect(screen.getByRole('img', { name: '로딩 중' })).toBeInTheDocument()
  })

  it('aria-label prop이 버튼에 적용된다', () => {
    render(<Button aria-label="닫기"><span>X</span></Button>)
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument()
  })
})
