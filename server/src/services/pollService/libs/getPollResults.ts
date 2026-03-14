import type { PollResults, VoteCount } from '@shared/types'
import { db } from '../../../lib/db'
import type { GetPollResultsParams } from '../types'

export function getPollResults(params: GetPollResultsParams): PollResults {
  const { pollId, voterIp, voterToken } = params
  const stored = db.getPoll(pollId)

  if (!stored) {
    throw new Error('Poll not found code:POLL_NOT_FOUND')
  }

  const identifiers = [`${pollId}-${voterIp}`]
  if (voterToken) {
    identifiers.push(`${pollId}-${voterToken}`)
  }

  const hasVoted = db.hasVoted(pollId, identifiers)

  let totalVotes = 0
  for (const count of stored.voteCounts.values()) {
    totalVotes += count
  }

  const votes: VoteCount[] = stored.poll.options.map((option) => {
    const count = stored.voteCounts.get(option.id) ?? 0
    const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 1000) / 10
    return {
      optionId: option.id,
      count,
      percentage,
    }
  })

  return {
    poll: stored.poll,
    votes,
    totalVotes,
    hasVoted,
  }
}
