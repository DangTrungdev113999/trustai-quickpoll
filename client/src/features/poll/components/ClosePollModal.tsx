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
import { useClosePoll } from '../api/queries'

interface ClosePollModalProps {
  pollId: string
  open: boolean
  onClose: () => void
}

export function ClosePollModal({ pollId, open, onClose }: ClosePollModalProps) {
  const closePoll = useClosePoll(pollId)

  function handleConfirm() {
    closePoll.mutate(undefined, {
      onSuccess: () => {
        toast.success('Đã đóng poll')
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
          <DialogTitle>Đóng poll này?</DialogTitle>
          <DialogDescription>
            Poll sẽ không nhận vote mới. Bạn vẫn có thể xem kết quả và xóa poll sau.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={closePoll.isPending}>
            {closePoll.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đóng poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
