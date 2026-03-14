import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/polls/migrate', () => {
  it('should migrate anonymous polls to authenticated user', async () => {
    // Create anonymous polls
    const poll1 = await request(app)
      .post('/api/polls')
      .send({ question: 'Migrate 1?', options: ['A', 'B'] })
    const poll2 = await request(app)
      .post('/api/polls')
      .send({ question: 'Migrate 2?', options: ['C', 'D'] })

    const res = await request(app)
      .post('/api/polls/migrate')
      .set('Authorization', 'Bearer valid-session-token')
      .send({ pollIds: [poll1.body.pollId, poll2.body.pollId] })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('migrated', 2)
  })

  it('should return 401 UNAUTHORIZED without token', async () => {
    const res = await request(app)
      .post('/api/polls/migrate')
      .send({ pollIds: ['poll-1'] })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })
})
