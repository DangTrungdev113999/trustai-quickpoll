export * from './types'

import { createPoll } from './libs/createPoll'
import { getPollResults } from './libs/getPollResults'
import { votePoll } from './libs/votePoll'
import { getPolls } from './libs/getPolls'
import { closePoll } from './libs/closePoll'
import { deletePoll } from './libs/deletePoll'
import { getQRCode } from './libs/getQRCode'
import { migratePolls } from './libs/migratePolls'

export const pollService = {
  createPoll,
  getPollResults,
  votePoll,
  getPolls,
  closePoll,
  deletePoll,
  getQRCode,
  migratePolls,
}
