import type { Poll, PollOption } from '@shared/types'

export interface StoredPoll {
  poll: Poll
  voteCounts: Map<string, number> // optionId -> count
  voterKeys: Set<string> // `{pollId}-{ip}` or `{pollId}-{voterToken}`
}

const polls = new Map<string, StoredPoll>()

export const db = {
  createPoll(id: string, question: string, options: PollOption[]): StoredPoll {
    const stored: StoredPoll = {
      poll: {
        id,
        question,
        options,
        createdAt: new Date().toISOString(),
      },
      voteCounts: new Map(options.map((o) => [o.id, 0])),
      voterKeys: new Set(),
    }
    polls.set(id, stored)
    return stored
  },

  getPoll(id: string): StoredPoll | undefined {
    return polls.get(id)
  },

  hasVoted(pollId: string, identifiers: string[]): boolean {
    const stored = polls.get(pollId)
    if (!stored) return false
    return identifiers.some((key) => stored.voterKeys.has(key))
  },

  recordVote(pollId: string, optionId: string, identifiers: string[]): void {
    const stored = polls.get(pollId)
    if (!stored) return

    const current = stored.voteCounts.get(optionId) ?? 0
    stored.voteCounts.set(optionId, current + 1)

    for (const key of identifiers) {
      stored.voterKeys.add(key)
    }
  },
}
