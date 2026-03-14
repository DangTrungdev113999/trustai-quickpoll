import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('GET /api/polls (dashboard)', () => {
  it('should return list of polls sorted newest first', async () => {
    // Create 2 polls
    await request(app).post('/api/polls').send({ question: 'First poll?', options: ['A', 'B'] })
    await request(app).post('/api/polls').send({ question: 'Second poll?', options: ['C', 'D'] })

    const res = await request(app).get('/api/polls')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('polls')
    expect(Array.isArray(res.body.polls)).toBe(true)
    expect(res.body.polls.length).toBeGreaterThanOrEqual(2)

    // Verify sorted newest first
    const dates = res.body.polls.map((p: { createdAt: string }) => new Date(p.createdAt).getTime())
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1])
    }
  })

  it('should filter active polls only when status=active', async () => {
    const res = await request(app).get('/api/polls?status=active')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('polls')
    res.body.polls.forEach((poll: { status: string }) => {
      expect(poll.status).toBe('active')
    })
  })

  it('should filter closed polls only when status=closed', async () => {
    const res = await request(app).get('/api/polls?status=closed')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('polls')
    res.body.polls.forEach((poll: { status: string }) => {
      expect(poll.status).toBe('closed')
    })
  })
})
