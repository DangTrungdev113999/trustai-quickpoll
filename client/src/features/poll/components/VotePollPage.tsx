import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/Header'
import { usePoll, useVotePoll } from '../api/queries'
import type { PollResults } from '@shared/types/poll'

function PollSkeleton() {
  return (
    <div className="w-full max-w-[600px] space-y-6 animate-pulse">
      <div className="h-8 w-3/4 rounded bg-muted" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="h-5 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function ResultsView({ results, justVoted }: { results: PollResults; justVoted: boolean }) {
  return (
    <div className="space-y-4">
      {justVoted && <div className="rounded-md bg-green-50 p-3 text-green-800 text-sm">Bạn đã vote!</div>}
      {!justVoted && results.hasVoted && (
        <div className="rounded-md bg-blue-50 p-3 text-blue-800 text-sm">Bạn đã vote rồi</div>
      )}
      <div className="space-y-3">
        {results.poll.options.map((opt, i) => {
          const vote = results.votes.find((v) => v.optionId === opt.id)
          const pct = vote?.percentage ?? 0
          const count = vote?.count ?? 0
          return (
            <div key={opt.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{opt.text}</span>
                <span className="text-muted-foreground">
                  {pct}% ({count})
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-400"
                  style={{
                    width: `${pct}%`,
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">Tổng: {results.totalVotes} vote</p>
    </div>
  )
}

export function VotePollPage() {
  const { pollId = '' } = useParams<{ pollId: string }>()
  const { data: results, isLoading, error } = usePoll(pollId)
  const voteMutation = useVotePoll(pollId)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [justVoted, setJustVoted] = useState(false)

  const alreadyVoted = results?.hasVoted || justVoted
  const hasVotedBefore = localStorage.getItem(`voted:${pollId}`)
  const allowMultiple = results?.poll.allowMultiple ?? false

  function toggleOption(optionId: string) {
    if (!allowMultiple) {
      setSelectedOptions([optionId])
      return
    }
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
    )
  }

  async function handleVote() {
    if (selectedOptions.length === 0) return
    try {
      await voteMutation.mutateAsync({ optionIds: selectedOptions })
      localStorage.setItem(`voted:${pollId}`, 'true')
      setJustVoted(true)
      toast.success('Vote thành công!')
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('ALREADY_VOTED')) {
          toast.error('Bạn đã vote rồi!')
        } else if (err.message.includes('POLL_CLOSED')) {
          toast.error('Poll đã đóng, không thể vote!')
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error('Không thể kết nối. Thử lại sau')
      }
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <PollSkeleton />
        </div>
      </>
    )
  }

  if (error || !results) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <SearchX className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Poll không tìm thấy</h1>
            <p className="text-muted-foreground">{error?.message || 'Poll này không tồn tại hoặc đã bị xóa'}</p>
          </div>
        </div>
      </>
    )
  }

  if (alreadyVoted || hasVotedBefore) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-[600px] space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{results.poll.question}</h1>
              {allowMultiple && (
                <p className="mt-1 text-sm text-muted-foreground">
                  (Multiple choice - voters có thể chọn nhiều)
                </p>
              )}
            </div>
            <ResultsView results={results} justVoted={justVoted} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[600px] space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{results.poll.question}</h1>
            {allowMultiple && (
              <p className="mt-1 text-sm text-muted-foreground">
                Bạn có thể chọn nhiều lựa chọn
              </p>
            )}
          </div>

          <div className="space-y-3">
            {!allowMultiple ? (
              <RadioGroup value={selectedOptions[0] || ''} onValueChange={(val) => setSelectedOptions([val])}>
                {results.poll.options.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50">
                    <RadioGroupItem value={opt.id} id={opt.id} />
                    <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {results.poll.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleOption(opt.id)}
                  >
                    <Checkbox
                      id={opt.id}
                      checked={selectedOptions.includes(opt.id)}
                      onCheckedChange={() => toggleOption(opt.id)}
                    />
                    <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || voteMutation.isPending}
            className="w-full"
          >
            {voteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {voteMutation.isPending ? 'Đang gửi...' : 'Vote'}
          </Button>
        </div>
      </div>
    </>
  )
}
