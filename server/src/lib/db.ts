import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import type { Poll, PollOption, User } from '@shared/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../../data/quickpoll.db')

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    allow_multiple INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    owner_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    voter_key TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    UNIQUE(poll_id, voter_key, option_id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS magic_link_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
  CREATE INDEX IF NOT EXISTS idx_votes_voter_key ON votes(voter_key);
`)

export interface StoredPoll {
  poll: Poll
  voteCounts: Map<string, number>
  voterKeys: Set<string>
}

function deserializePoll(row: any): Poll {
  return {
    id: row.id,
    question: row.question,
    options: JSON.parse(row.options) as PollOption[],
    allowMultiple: Boolean(row.allow_multiple),
    status: row.status as 'active' | 'closed',
    ownerId: row.owner_id || undefined,
    createdAt: row.created_at,
  }
}

function getStoredPoll(pollId: string): StoredPoll | undefined {
  const row = db.prepare('SELECT * FROM polls WHERE id = ?').get(pollId)
  if (!row) return undefined

  const poll = deserializePoll(row)
  
  const voteRows = db.prepare('SELECT option_id, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY option_id').all(pollId) as Array<{ option_id: string; count: number }>
  const voteCounts = new Map(voteRows.map(v => [v.option_id, v.count]))
  
  const voterRows = db.prepare('SELECT DISTINCT voter_key FROM votes WHERE poll_id = ?').all(pollId) as Array<{ voter_key: string }>
  const voterKeys = new Set(voterRows.map(v => v.voter_key))

  return { poll, voteCounts, voterKeys }
}

export const dbAPI = {
  createPoll(
    id: string,
    question: string,
    options: PollOption[],
    allowMultiple = false,
    ownerId?: string,
  ): StoredPoll {
    const createdAt = new Date().toISOString()
    
    db.prepare(`
      INSERT INTO polls (id, question, options, allow_multiple, owner_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, question, JSON.stringify(options), allowMultiple ? 1 : 0, ownerId || null, createdAt)

    return getStoredPoll(id)!
  },

  getPoll(id: string): StoredPoll | undefined {
    return getStoredPoll(id)
  },

  getAllPolls(): StoredPoll[] {
    const rows = db.prepare('SELECT * FROM polls ORDER BY created_at DESC').all()
    return rows.map((row: any) => getStoredPoll(row.id)!)
  },

  deletePoll(id: string): boolean {
    const result = db.prepare('DELETE FROM polls WHERE id = ?').run(id)
    return result.changes > 0
  },

  closePoll(id: string): boolean {
    const result = db.prepare("UPDATE polls SET status = 'closed' WHERE id = ?").run(id)
    return result.changes > 0
  },

  addVote(pollId: string, optionId: string, voterKey: string): void {
    db.prepare(`
      INSERT INTO votes (poll_id, option_id, voter_key)
      VALUES (?, ?, ?)
      ON CONFLICT DO NOTHING
    `).run(pollId, optionId, voterKey)
  },

  hasVoted(pollId: string, voterKeys: string[]): boolean {
    const placeholders = voterKeys.map(() => '?').join(',')
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM votes
      WHERE poll_id = ? AND voter_key IN (${placeholders})
    `).get(pollId, ...voterKeys) as { count: number }
    return result.count > 0
  },

  migratePoll(pollId: string, newOwnerId: string): boolean {
    const result = db.prepare('UPDATE polls SET owner_id = ? WHERE id = ?').run(newOwnerId, pollId)
    return result.changes > 0
  },

  // User methods
  createUser(id: string, email: string): User {
    const createdAt = new Date().toISOString()
    db.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)').run(id, email, createdAt)
    return { id, email, createdAt }
  },

  getUserByEmail(email: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
    if (!row) return undefined
    return {
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    }
  },

  getUserById(id: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
    if (!row) return undefined
    return {
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    }
  },

  // Session methods
  createSession(token: string, userId: string): void {
    db.prepare('INSERT INTO session_tokens (token, user_id) VALUES (?, ?)').run(token, userId)
  },

  getUserIdBySession(token: string): string | undefined {
    const row = db.prepare('SELECT user_id FROM session_tokens WHERE token = ?').get(token) as any
    return row?.user_id
  },

  deleteSession(token: string): void {
    db.prepare('DELETE FROM session_tokens WHERE token = ?').run(token)
  },

  // Magic link methods
  createMagicLink(token: string, email: string, expiresAt: string): void {
    db.prepare('INSERT INTO magic_link_tokens (token, email, expires_at) VALUES (?, ?, ?)').run(token, email, expiresAt)
  },

  getMagicLinkEmail(token: string): { email: string; expiresAt: string } | undefined {
    const row = db.prepare('SELECT email, expires_at FROM magic_link_tokens WHERE token = ?').get(token) as any
    if (!row) return undefined
    return {
      email: row.email,
      expiresAt: row.expires_at,
    }
  },

  deleteMagicLink(token: string): void {
    db.prepare('DELETE FROM magic_link_tokens WHERE token = ?').run(token)
  },
}

export { dbAPI as db }
