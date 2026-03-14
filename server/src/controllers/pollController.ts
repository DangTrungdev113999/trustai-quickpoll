import type { Request, Response } from 'express'
import { pollService } from '../services/pollService'

function getVoterIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.ip ?? '127.0.0.1'
}

export async function createPoll(req: Request, res: Response) {
  const { question, options, allowMultiple } = req.body
  const result = pollService.createPoll({ question, options, allowMultiple, ownerId: req.userId })
  res.status(201).json(result)
}

export async function getPoll(req: Request, res: Response) {
  const { id } = req.params
  const voterIp = getVoterIp(req)

  let voterToken = req.cookies?.['X-Voter-Token'] as string | undefined
  if (!voterToken) {
    const { v4: uuidv4 } = await import('uuid')
    voterToken = uuidv4()
    res.cookie('X-Voter-Token', voterToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    })
  }

  const results = pollService.getPollResults({ pollId: id, voterIp, voterToken })
  res.json(results)
}

export async function votePoll(req: Request, res: Response) {
  const { id } = req.params
  const voterIp = getVoterIp(req)
  const voterToken = req.cookies?.['X-Voter-Token'] as string | undefined

  // Support both optionId (M1 compat) and optionIds (M2)
  let optionIds: string[]
  if (req.body.optionIds) {
    optionIds = req.body.optionIds
  } else if (req.body.optionId) {
    optionIds = [req.body.optionId]
  } else {
    optionIds = []
  }

  const result = pollService.votePoll({ pollId: id, optionIds, voterIp, voterToken })
  res.json(result)
}

export async function listPolls(req: Request, res: Response) {
  const status = req.query.status as string | undefined
  const polls = pollService.getPolls({ status })
  res.json({ polls })
}

export async function closePoll(req: Request, res: Response) {
  const { id } = req.params
  const result = pollService.closePoll({ pollId: id, userId: req.userId })
  res.json(result)
}

export async function deletePoll(req: Request, res: Response) {
  const { id } = req.params
  const result = pollService.deletePoll({ pollId: id, userId: req.userId })
  res.json(result)
}

export async function getQRCode(req: Request, res: Response) {
  const { id } = req.params
  const result = await pollService.getQRCode({ pollId: id })
  res.json(result)
}

export async function migratePolls(req: Request, res: Response) {
  const { pollIds } = req.body
  const result = pollService.migratePolls({ pollIds, userId: req.userId! })
  res.json(result)
}
