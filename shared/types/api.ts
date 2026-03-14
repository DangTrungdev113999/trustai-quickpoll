import type { Poll, PollResults } from './poll'

export interface CreatePollRequest {
  question: string
  options: string[] // 2-5 items
}

export interface CreatePollResponse {
  pollId: string
  shareUrl: string
}

export interface VoteRequest {
  optionIds: string[]
}

export interface VoteResponse {
  success: boolean
  results: PollResults
}

export type ErrorCode =
  | 'POLL_NOT_FOUND'
  | 'ALREADY_VOTED'
  | 'INVALID_OPTION'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'AUTH_REQUIRED'
  | 'POLL_CLOSED'

export interface ErrorResponse {
  error: string
  code: ErrorCode
}

// ============ M2: Auth Types ============

export interface User {
  id: string
  email: string
  createdAt: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

export interface SendMagicLinkRequest {
  email: string
}

export interface SendMagicLinkResponse {
  success: boolean
  message: string
}

export interface VerifyMagicLinkRequest {
  token: string
}

export interface VerifyMagicLinkResponse {
  success: boolean
  session: AuthSession
  user: User
}

export interface MeResponse {
  user: User
}

// ============ M2: Dashboard Types ============

export interface DashboardPollItem {
  id: string
  question: string
  totalVotes: number
  status: 'active' | 'closed'
  createdAt: string
}

export interface DashboardResponse {
  polls: DashboardPollItem[]
}

// ============ M2: Poll Management Types ============

export interface QRCodeData {
  pollId: string
  shareUrl: string
  qrCodeDataUrl: string // base64 data URL
}

export interface ClosePollResponse {
  success: boolean
  poll: Poll
}

export interface MigratePollsRequest {
  pollIds: string[]
}

export interface MigratePollsResponse {
  migrated: number
}
