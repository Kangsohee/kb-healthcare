import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('label이 input과 연결된다', () => {
    render(<Input id="email" label="이메일" />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
  })

  it('error가 있을 때 aria-invalid="true"가 설정된다', () => {
    render(<Input id="email" label="이메일" error="올바른 이메일을 입력하세요" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('에러 메시지가 role="alert"로 렌더링된다', () => {
    render(<Input id="email" label="이메일" error="올바른 이메일을 입력하세요" />)
    expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일을 입력하세요')
  })

  it('hint가 있을 때 aria-describedby가 hint id를 포함한다', () => {
    render(<Input id="pw" label="비밀번호" hint="8자 이상 입력하세요" />)
    const input = screen.getByLabelText('비밀번호')
    expect(input).toHaveAttribute('aria-describedby', 'pw-hint')
  })

  it('password 타입에서 비밀번호 표시 토글이 동작한다', async () => {
    render(<Input id="pw" label="비밀번호" type="password" />)
    const input = screen.getByLabelText('비밀번호')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: '비밀번호 표시' }))
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: '비밀번호 숨기기' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
