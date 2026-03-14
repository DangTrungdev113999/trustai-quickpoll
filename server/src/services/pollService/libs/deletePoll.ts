import { db } from '../../../lib/db'
import type { DeletePollParams } from '../types'

export function deletePoll(params: DeletePollParams): { success: true } {
  const { pollId, userId } = params
  const stored = db.getPoll(pollId)

  if (!stored) {
    throw new Error('Poll not found code:POLL_NOT_FOUND')
  }

  if (stored.poll.ownerId && stored.poll.ownerId !== userId) {
    throw new Error('Forbidden code:FORBIDDEN')
  }

  db.deletePoll(pollId)

  return { success: true }
}
