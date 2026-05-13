import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'

interface ErrorModalProps {
  isOpen: boolean
  message: string
  onClose: () => void
}

export function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="오류"
      role="alertdialog"
      footer={
        <Button onClick={onClose} variant="primary">
          확인
        </Button>
      }
    >
      <p className="text-sm text-text-primary">{message}</p>
    </Modal>
  )
}
