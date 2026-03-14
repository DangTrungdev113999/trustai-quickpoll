import type { PollResults } from './poll'

export interface CreatePollRequest {
  question: string
  options: string[] // 2-5 items
}

export interface CreatePollResponse {
  pollId: string
  shareUrl: string
}

export interface VoteRequest {
  optionId: string
}

export interface VoteResponse {
  success: boolean
  results: PollResults
}

export type ErrorCode = 'POLL_NOT_FOUND' | 'ALREADY_VOTED' | 'INVALID_OPTION' | 'VALIDATION_ERROR'

export interface ErrorResponse {
  error: string
  code: ErrorCode
}
