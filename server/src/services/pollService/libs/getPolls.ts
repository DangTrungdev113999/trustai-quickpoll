import type { DashboardPollItem } from '@shared/types'
import { db } from '../../../lib/db'
import type { GetPollsParams } from '../types'

export function getPolls(params: GetPollsParams): DashboardPollItem[] {
  const { status } = params
  const allPolls = db.getAllPolls()

  let filtered = allPolls

  if (status === 'active' || status === 'closed') {
    filtered = allPolls.filter((s) => s.poll.status === status)
  }

  const items: DashboardPollItem[] = filtered.map((stored) => {
    let totalVotes = 0
    for (const count of stored.voteCounts.values()) {
      totalVotes += count
    }

    return {
      id: stored.poll.id,
      question: stored.poll.question,
      totalVotes,
      status: stored.poll.status,
      createdAt: stored.poll.createdAt,
    }
  })

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return items
}
