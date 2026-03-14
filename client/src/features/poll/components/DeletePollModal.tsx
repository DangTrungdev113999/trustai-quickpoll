import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeletePoll } from '../api/queries'

interface DeletePollModalProps {
  pollId: string
  open: boolean
  onClose: () => void
}

export function DeletePollModal({ pollId, open, onClose }: DeletePollModalProps) {
  const deletePoll = useDeletePoll()

  function handleConfirm() {
    deletePoll.mutate(pollId, {
      onSuccess: () => {
        toast.success('Đã xóa poll')
        onClose()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Xóa poll này?</DialogTitle>
          <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deletePoll.isPending}>
            {deletePoll.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
