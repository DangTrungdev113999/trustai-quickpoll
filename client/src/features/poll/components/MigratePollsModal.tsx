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
import { useMigratePolls } from '../api/queries'

interface MigratePollsModalProps {
  pollIds: string[]
  open: boolean
  onClose: () => void
}

export function MigratePollsModal({ pollIds, open, onClose }: MigratePollsModalProps) {
  const migrate = useMigratePolls()

  function handleMigrate() {
    migrate.mutate(
      { pollIds },
      {
        onSuccess: (res) => {
          toast.success(`Đã chuyển ${res.migrated} polls`)
          localStorage.removeItem('quickpoll_polls')
          onClose()
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Migrate polls của bạn?</DialogTitle>
          <DialogDescription>
            Bạn có {pollIds.length} polls chưa đăng nhập. Migrate để quản lý tập trung?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Bỏ qua
          </Button>
          <Button onClick={handleMigrate} disabled={migrate.isPending}>
            {migrate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Migrate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
