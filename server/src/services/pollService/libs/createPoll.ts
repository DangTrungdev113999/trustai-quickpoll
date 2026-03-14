import { v4 as uuidv4 } from 'uuid'
import { db } from '../../../lib/db'
import type { CreatePollParams, CreatePollResult } from '../types'

export function createPoll(params: CreatePollParams): CreatePollResult {
  const { question, options, allowMultiple = false, ownerId } = params

  if (!question.trim()) {
    throw new Error('Question is required code:VALIDATION_ERROR')
  }

  if (options.length < 2) {
    throw new Error('At least 2 options required code:VALIDATION_ERROR')
  }

  if (options.length > 5) {
    throw new Error('At most 5 options allowed code:VALIDATION_ERROR')
  }

  const uniqueOptions = new Set(options.map((o) => o.trim().toLowerCase()))
  if (uniqueOptions.size !== options.length) {
    throw new Error('Duplicate options not allowed code:VALIDATION_ERROR')
  }

  const pollId = uuidv4()
  const pollOptions = options.map((text) => ({
    id: uuidv4(),
    text,
  }))

  db.createPoll(pollId, question, pollOptions, allowMultiple, ownerId)

  return {
    pollId,
    shareUrl: `/polls/${pollId}`,
  }
}
