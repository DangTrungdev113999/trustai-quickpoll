export interface CreatePollParams {
  question: string
  options: string[]
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
  optionId: string
  voterIp: string
  voterToken?: string
}
