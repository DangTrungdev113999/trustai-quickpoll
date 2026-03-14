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
  const { question, options } = req.body
  const result = pollService.createPoll({ question, options })
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
  const { optionId } = req.body
  const voterIp = getVoterIp(req)
  const voterToken = req.cookies?.['X-Voter-Token'] as string | undefined

  const result = pollService.votePoll({ pollId: id, optionId, voterIp, voterToken })
  res.json(result)
}
