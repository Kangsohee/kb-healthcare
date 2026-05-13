import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  it('isOpen=false 일 때 렌더링하지 않는다', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="제목">내용</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('isOpen=true 일 때 dialog가 렌더링된다', () => {
    render(<Modal isOpen onClose={vi.fn()} title="제목">내용</Modal>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('aria-labelledby가 title과 연결된다', () => {
    render(<Modal isOpen onClose={vi.fn()} title="확인">내용</Modal>)
    const dialog = screen.getByRole('dialog')
    const labelId = dialog.getAttribute('aria-labelledby')
    expect(document.getElementById(labelId!)).toHaveTextContent('확인')
  })

  it('ESC 키를 누르면 onClose가 호출된다', async () => {
    const handleClose = vi.fn()
    render(<Modal isOpen onClose={handleClose} title="제목">내용</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('닫기 버튼을 클릭하면 onClose가 호출된다', async () => {
    const handleClose = vi.fn()
    render(<Modal isOpen onClose={handleClose} title="제목">내용</Modal>)
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('role="alertdialog"를 지원한다', () => {
    render(<Modal isOpen onClose={vi.fn()} title="경고" role="alertdialog">내용</Modal>)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
