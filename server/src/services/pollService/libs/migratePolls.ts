import { db } from '../../../lib/db'
import type { MigratePollsParams } from '../types'

export function migratePolls(params: MigratePollsParams): { migrated: number } {
  const { pollIds, userId } = params
  let migrated = 0

  for (const pollId of pollIds) {
    const stored = db.getPoll(pollId)

    if (stored && !stored.poll.ownerId) {
      stored.poll.ownerId = userId
      migrated++
    }
  }

  return { migrated }
}
