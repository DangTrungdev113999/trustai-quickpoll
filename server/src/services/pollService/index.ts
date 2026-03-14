export * from './types'

import { createPoll } from './libs/createPoll'
import { getPollResults } from './libs/getPollResults'
import { votePoll } from './libs/votePoll'

export const pollService = {
  createPoll,
  getPollResults,
  votePoll,
}
