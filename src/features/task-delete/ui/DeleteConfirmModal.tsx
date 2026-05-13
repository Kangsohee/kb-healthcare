import { useState, useId } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

interface DeleteConfirmModalProps {
  isOpen: boolean
  taskId: string
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  taskId,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState('')
  const descId = useId()
  const isConfirmed = inputValue === taskId

  const handleClose = () => {
    setInputValue('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="할 일 삭제"
      role="alertdialog"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isDeleting}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!isConfirmed}
            isLoading={isDeleting}
          >
            제출
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p id={descId} className="text-sm text-text-primary">
          이 작업은 되돌릴 수 없습니다.
        </p>
        <Input
          id="delete-confirm-input"
          label="삭제를 확인하려면 ID를 입력하세요"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-describedby={descId}
          placeholder={taskId}
          autoComplete="off"
        />
      </div>
    </Modal>
  )
}
