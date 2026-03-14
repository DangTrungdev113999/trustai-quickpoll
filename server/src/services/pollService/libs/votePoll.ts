import type { VoteResponse } from '@shared/types'
import { db } from '../../../lib/db'
import type { VotePollParams } from '../types'
import { getPollResults } from './getPollResults'

export function votePoll(params: VotePollParams): VoteResponse {
  const { pollId, optionIds, voterIp, voterToken } = params
  const stored = db.getPoll(pollId)

  if (!stored) {
    throw new Error('Poll not found code:POLL_NOT_FOUND')
  }

  if (stored.poll.status !== 'active') {
    throw new Error('Poll is closed code:POLL_CLOSED')
  }

  if (!stored.poll.allowMultiple && optionIds.length > 1) {
    throw new Error('Multiple options not allowed code:INVALID_OPTION')
  }

  for (const optionId of optionIds) {
    const validOption = stored.poll.options.some((o) => o.id === optionId)

    if (!validOption) {
      throw new Error('Invalid option code:INVALID_OPTION')
    }
  }

  const identifiers = [`${pollId}-${voterIp}`]
  if (voterToken) {
    identifiers.push(`${pollId}-${voterToken}`)
  }

  if (db.hasVoted(pollId, identifiers)) {
    throw new Error('Already voted code:ALREADY_VOTED')
  }

  for (const optionId of optionIds) {
    db.recordVote(pollId, optionId, identifiers)
  }

  const results = getPollResults({ pollId, voterIp, voterToken })

  return {
    success: true,
    results,
  }
}
