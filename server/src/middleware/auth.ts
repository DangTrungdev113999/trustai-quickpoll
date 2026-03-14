import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { db } from '../lib/db'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/**
 * Optional auth middleware - extracts userId from Bearer token if present.
 * Auto-creates user + session for unknown tokens (M2 mock behavior).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.slice(7)
  let userId = db.getUserIdBySession(token)
  
  if (!userId) {
    // Mock auth: auto-create user + session for any Bearer token (M2 simplicity)
    const email = `${token}@mock.local`
    let user = db.getUserByEmail(email)
    if (!user) {
      user = db.createUser(randomUUID(), email)
    }
    db.createSession(token, user.id)
    userId = user.id
  }

  req.userId = userId
  next()
}

/**
 * Required auth middleware - returns 401 if no Bearer token.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return
  }

  const token = authHeader.slice(7)
  let userId = db.getUserIdBySession(token)

  if (!userId) {
    // Mock auth: auto-create user + session for any Bearer token (M2 simplicity)
    const email = `${token}@mock.local`
    let user = db.getUserByEmail(email)
    if (!user) {
      user = db.createUser(randomUUID(), email)
    }
    db.createSession(token, user.id)
    userId = user.id
  }

  req.userId = userId
  next()
}
