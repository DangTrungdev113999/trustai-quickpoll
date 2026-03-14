import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  const [selectedOption, setSelectedOption] = useState('')
  const [justVoted, setJustVoted] = useState(false)

  const alreadyVoted = results?.hasVoted || justVoted
  const hasVotedBefore = localStorage.getItem(`voted:${pollId}`)

  async function handleVote() {
    if (!selectedOption) return
    try {
      await voteMutation.mutateAsync({ optionId: selectedOption })
      localStorage.setItem(`voted:${pollId}`, 'true')
      setJustVoted(true)
      toast.success('Vote thành công!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể kết nối. Thử lại sau')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <PollSkeleton />
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <SearchX className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Poll không tồn tại</h1>
        <Button onClick={() => (window.location.href = '/')}>Tạo poll mới</Button>
      </div>
    )
  }

  const showResults = alreadyVoted || !!hasVotedBefore

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[600px] space-y-6">
        <h1 className="text-3xl font-bold">{results.poll.question}</h1>

        {showResults ? (
          <ResultsView results={results} justVoted={justVoted} />
        ) : (
          <>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {results.poll.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3 rounded-md border p-3">
                  <RadioGroupItem value={opt.id} id={`vote-${opt.id}`} />
                  <Label htmlFor={`vote-${opt.id}`} className="flex-1 cursor-pointer">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              className="w-full"
              disabled={!selectedOption || voteMutation.isPending}
              onClick={handleVote}
            >
              {voteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {voteMutation.isPending ? 'Đang gửi...' : 'Vote'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
