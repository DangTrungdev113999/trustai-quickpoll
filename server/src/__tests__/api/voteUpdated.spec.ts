import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/polls/:id/vote (M2 updates)', () => {
  it('should reject vote on a closed poll → 400 POLL_CLOSED', async () => {
    // Create poll, close it, then try to vote
    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', 'Bearer valid-owner-token')
      .send({ question: 'Closed poll?', options: ['A', 'B'] })

    const pollId = createRes.body.pollId

    // Close the poll
    await request(app)
      .post(`/api/polls/${pollId}/close`)
      .set('Authorization', 'Bearer valid-owner-token')

    // Try to vote
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionIds: [createRes.body.pollId] })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('POLL_CLOSED')
  })

  it('should accept multiple optionIds for allowMultiple poll → success', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .send({ question: 'Multi choice?', options: ['A', 'B', 'C'], allowMultiple: true })

    const pollId = createRes.body.pollId

    // Get poll to find option IDs
    const pollRes = await request(app).get(`/api/polls/${pollId}`)
    const optionIds = pollRes.body.poll.options.map((o: { id: string }) => o.id)

    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionIds: [optionIds[0], optionIds[1]] })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('results')
  })

  it('should reject multiple optionIds for single-choice poll → 400 INVALID_OPTION', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .send({ question: 'Single choice?', options: ['A', 'B', 'C'] })

    const pollId = createRes.body.pollId

    // Get poll to find option IDs
    const pollRes = await request(app).get(`/api/polls/${pollId}`)
    const optionIds = pollRes.body.poll.options.map((o: { id: string }) => o.id)

    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionIds: [optionIds[0], optionIds[1]] })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_OPTION')
  })
})
