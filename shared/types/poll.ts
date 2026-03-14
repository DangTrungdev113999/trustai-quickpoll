export interface PollOption {
  id: string
  text: string
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  status: 'active' | 'closed'
  ownerId?: string
  createdAt: string // ISO 8601
}

export interface VoteCount {
  optionId: string
  count: number
  percentage: number // 1 decimal, 0 if totalVotes = 0
}

export interface PollResults {
  poll: Poll
  votes: VoteCount[]
  totalVotes: number
  hasVoted: boolean // true if user already voted
}
