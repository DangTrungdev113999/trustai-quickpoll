import type { Request, Response, NextFunction } from 'express'
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
 * Auto-creates user for any valid Bearer token (mock auth for M2).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.slice(7)
  const user = db.getOrCreateUserForToken(token)
  req.userId = user.id
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
  const user = db.getOrCreateUserForToken(token)
  req.userId = user.id
  next()
}
