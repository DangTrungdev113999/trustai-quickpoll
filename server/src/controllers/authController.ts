import type { Request, Response } from 'express'
import { db } from '../lib/db'

const MOCK_MAGIC_TOKEN = 'valid-magic-link-token'

export async function sendMagicLink(req: Request, res: Response) {
  const { email } = req.body

  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Invalid email', code: 'VALIDATION_ERROR' })
    return
  }

  // Store magic link token (mock: use constant token for testing)
  db.storeMagicLinkToken(MOCK_MAGIC_TOKEN, email.trim())
  console.log(`[MOCK] Magic link for ${email}: /auth/verify?token=${MOCK_MAGIC_TOKEN}`)

  res.json({ success: true, message: 'Magic link sent to your email' })
}

export async function verifyMagicLink(req: Request, res: Response) {
  const { token } = req.body

  const email = db.getMagicLinkEmail(token)
  if (!email) {
    res.status(401).json({ error: 'Invalid or expired magic link', code: 'UNAUTHORIZED' })
    return
  }

  // Create or find user
  const user = db.createUser(email)

  // Create session
  const sessionToken = db.createSession(user.id)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  res.json({
    success: true,
    session: {
      userId: user.id,
      token: sessionToken,
      expiresAt,
    },
    user,
  })
}

export async function getMe(req: Request, res: Response) {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return
  }

  const user = db.getUserById(req.userId)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return
  }

  res.json({ user })
}
