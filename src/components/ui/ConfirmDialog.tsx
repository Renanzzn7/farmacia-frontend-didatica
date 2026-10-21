import Modal from './Modal'
import Button from './Button'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Excluir', loading, onConfirm, onCancel }: Props) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-ink-muted">{message}</p>
    </Modal>
  )
}
