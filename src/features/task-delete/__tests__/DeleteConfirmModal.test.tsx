import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal'

function renderModal(props: Partial<Parameters<typeof DeleteConfirmModal>[0]> = {}) {
  const defaults = {
    isOpen: true,
    taskId: 'task-42',
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }
  return render(<DeleteConfirmModal {...defaults} {...props} />)
}

describe('DeleteConfirmModal', () => {
  it('isOpen=false 이면 렌더링하지 않는다', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('isOpen=true 이면 alertdialog가 렌더링된다', () => {
    renderModal()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('초기에 제출 버튼이 비활성화 상태다', () => {
    renderModal()
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled()
  })

  it('taskId와 동일한 값 입력 시 제출 버튼이 활성화된다', async () => {
    renderModal()
    await userEvent.type(screen.getByRole('textbox'), 'task-42')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '제출' })).not.toBeDisabled()
    })
  })

  it('다른 값 입력 시 제출 버튼이 비활성화 상태다', async () => {
    renderModal()
    await userEvent.type(screen.getByRole('textbox'), 'wrong-id')
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled()
  })

  it('제출 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })
    await userEvent.type(screen.getByRole('textbox'), 'task-42')
    await userEvent.click(screen.getByRole('button', { name: '제출' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ESC 키 → onClose가 호출된다', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
