export interface CreatePollParams {
  question: string
  options: string[]
  allowMultiple?: boolean
  ownerId?: string
}

export interface CreatePollResult {
  pollId: string
  shareUrl: string
}

export interface GetPollResultsParams {
  pollId: string
  voterIp: string
  voterToken?: string
}

export interface VotePollParams {
  pollId: string
  optionIds: string[]
  voterIp: string
  voterToken?: string
}

export interface GetPollsParams {
  status?: string
}

export interface ClosePollParams {
  pollId: string
  userId?: string
}

export interface DeletePollParams {
  pollId: string
  userId?: string
}

export interface GetQRCodeParams {
  pollId: string
}

export interface MigratePollsParams {
  pollIds: string[]
  userId: string
}
