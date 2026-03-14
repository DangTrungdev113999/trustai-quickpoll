import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/polls/:id/close', () => {
  it('should close a poll when requested by owner → status = "closed"', async () => {
    // Create poll as authenticated user
    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', 'Bearer valid-owner-token')
      .send({ question: 'Close me?', options: ['Yes', 'No'] })

    const pollId = createRes.body.pollId

    const res = await request(app)
      .post(`/api/polls/${pollId}/close`)
      .set('Authorization', 'Bearer valid-owner-token')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('poll')
    expect(res.body.poll.status).toBe('closed')
  })

  it('should return 403 FORBIDDEN when non-owner tries to close poll', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', 'Bearer owner-token')
      .send({ question: 'Cannot close?', options: ['A', 'B'] })

    const pollId = createRes.body.pollId

    const res = await request(app)
      .post(`/api/polls/${pollId}/close`)
      .set('Authorization', 'Bearer different-user-token')

    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('should return 404 POLL_NOT_FOUND for non-existent poll', async () => {
    const res = await request(app)
      .post('/api/polls/non-existent-id/close')
      .set('Authorization', 'Bearer valid-owner-token')

    expect(res.status).toBe(404)
    expect(res.body.code).toBe('POLL_NOT_FOUND')
  })
})
