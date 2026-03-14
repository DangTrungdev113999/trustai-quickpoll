import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Lock, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { usePoll, usePollQR } from '../api/queries'
import { ClosePollModal } from './ClosePollModal'
import { DeletePollModal } from './DeletePollModal'

function PollDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function PollDetailPage() {
  const { pollId } = useParams<{ pollId: string }>()
  const { data, isLoading, error, refetch } = usePoll(pollId!)
  const { data: qrData } = usePollQR(pollId!)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (isLoading) {
    return (
      <>
        <Header />
        <PollDetailSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
          <Card className="w-full text-center">
            <CardContent className="space-y-4 py-8">
              <p className="text-muted-foreground">{error.message}</p>
              <Button onClick={() => refetch()}>Thử lại</Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!data) return null

  const { poll, votes, totalVotes } = data
  const isClosed = poll.status === 'closed'
  const isOwner = !!poll.ownerId

  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl p-4">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <h1 className="text-2xl font-bold">{poll.question}</h1>
              {isClosed && (
                <Badge variant="secondary" className="shrink-0">
                  Đã đóng
                </Badge>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kết quả ({totalVotes} votes)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.options.map((option) => {
                  const vote = votes.find((v) => v.optionId === option.id)
                  const percentage = vote?.percentage ?? 0
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option.text}</span>
                        <span className="text-muted-foreground">
                          {vote?.count ?? 0} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${percentage}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {isClosed && (
              <div className="flex items-center gap-2 rounded-lg border border-muted p-3 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Poll này không nhận vote mới</span>
              </div>
            )}

            {isOwner && (
              <div className="flex gap-3">
                {!isClosed && (
                  <Button variant="outline" onClick={() => setShowCloseModal(true)}>
                    <X className="mr-2 h-4 w-4" />
                    Close poll
                  </Button>
                )}
                <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete poll
                </Button>
              </div>
            )}
          </div>

          {qrData && (
            <div className="flex flex-col items-center gap-3 md:sticky md:top-4">
              <div className="text-center">
                <p className="mb-2 text-sm font-medium">Scan để vote</p>
                <img
                  src={qrData.qrCodeDataUrl}
                  alt="QR code để vote"
                  className="h-[200px] w-[200px] md:h-[300px] md:w-[300px]"
                />
              </div>
              <a href={qrData.qrCodeDataUrl} download={`poll-${pollId}-qr.png`}>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </a>
              <p className="max-w-[200px] truncate text-center text-xs text-muted-foreground md:max-w-[300px]">
                {qrData.shareUrl}
              </p>
            </div>
          )}
        </div>

        <ClosePollModal pollId={pollId!} open={showCloseModal} onClose={() => setShowCloseModal(false)} />
        <DeletePollModal pollId={pollId!} open={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      </div>
    </>
  )
}
