import type { Poll, PollOption, User } from '@shared/types'

export interface StoredPoll {
  poll: Poll
  voteCounts: Map<string, number> // optionId -> count
  voterKeys: Set<string> // `{pollId}-{ip}` or `{pollId}-{voterToken}`
}

const polls = new Map<string, StoredPoll>()
const users = new Map<string, User>() // userId -> User
const sessionTokens = new Map<string, string>() // sessionToken -> userId
const magicLinkTokens = new Map<string, string>() // magicToken -> email

export const db = {
  // ============ Poll Methods ============

  createPoll(
    id: string,
    question: string,
    options: PollOption[],
    allowMultiple = false,
    ownerId?: string,
  ): StoredPoll {
    const stored: StoredPoll = {
      poll: {
        id,
        question,
        options,
        allowMultiple,
        status: 'active',
        ownerId,
        createdAt: new Date().toISOString(),
      },
      voteCounts: new Map(options.map((o) => [o.id, 0])),
      voterKeys: new Set(),
    }
    polls.set(id, stored)
    return stored
  },

  getPoll(id: string): StoredPoll | undefined {
    return polls.get(id)
  },

  getAllPolls(): StoredPoll[] {
    return Array.from(polls.values())
  },

  deletePoll(id: string): boolean {
    return polls.delete(id)
  },

  hasVoted(pollId: string, identifiers: string[]): boolean {
    const stored = polls.get(pollId)
    if (!stored) return false
    return identifiers.some((key) => stored.voterKeys.has(key))
  },

  recordVote(pollId: string, optionId: string, identifiers: string[]): void {
    const stored = polls.get(pollId)
    if (!stored) return

    const current = stored.voteCounts.get(optionId) ?? 0
    stored.voteCounts.set(optionId, current + 1)

    for (const key of identifiers) {
      stored.voterKeys.add(key)
    }
  },

  // ============ User Methods ============

  getOrCreateUserForToken(token: string): User {
    const userId = sessionTokens.get(token)
    if (userId) {
      const user = users.get(userId)
      if (user) return user
    }

    const newUserId = generateId()
    const user: User = {
      id: newUserId,
      email: `user-${newUserId.substring(0, 8)}@quickpoll.local`,
      createdAt: new Date().toISOString(),
    }
    users.set(newUserId, user)
    sessionTokens.set(token, newUserId)
    return user
  },

  createUser(email: string): User {
    // Check if user with this email already exists
    for (const user of users.values()) {
      if (user.email === email) return user
    }

    const userId = generateId()
    const user: User = {
      id: userId,
      email,
      createdAt: new Date().toISOString(),
    }
    users.set(userId, user)
    return user
  },

  getUserById(id: string): User | undefined {
    return users.get(id)
  },

  getUserBySession(token: string): User | undefined {
    const userId = sessionTokens.get(token)
    if (!userId) return undefined
    return users.get(userId)
  },

  createSession(userId: string): string {
    const token = generateId()
    sessionTokens.set(token, userId)
    return token
  },

  // ============ Magic Link Methods ============

  storeMagicLinkToken(token: string, email: string): void {
    magicLinkTokens.set(token, email)
  },

  getMagicLinkEmail(token: string): string | undefined {
    return magicLinkTokens.get(token)
  },

  deleteMagicLinkToken(token: string): void {
    magicLinkTokens.delete(token)
  },
}

// Simple ID generator using counter + random for uniqueness
let idCounter = 0
function generateId(): string {
  idCounter++
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 10)}`
}
