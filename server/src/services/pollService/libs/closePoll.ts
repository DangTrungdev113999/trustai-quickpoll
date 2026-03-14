import type { Poll } from '@shared/types'
import { db } from '../../../lib/db'
import type { ClosePollParams } from '../types'

export function closePoll(params: ClosePollParams): { success: true; poll: Poll } {
  const { pollId, userId } = params
  const stored = db.getPoll(pollId)

  if (!stored) {
    throw new Error('Poll not found code:POLL_NOT_FOUND')
  }

  if (stored.poll.ownerId && stored.poll.ownerId !== userId) {
    throw new Error('Forbidden code:FORBIDDEN')
  }

  db.closePoll(pollId)
  const updated = db.getPoll(pollId)!

  return {
    success: true,
    poll: updated.poll,
  }
}
