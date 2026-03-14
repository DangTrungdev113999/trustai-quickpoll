import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('GET /api/polls/:id', () => {
  it('should return 200 with poll and results when poll exists', async () => {
    // Create a poll first
    const createRes = await request(app)
      .post('/api/polls')
      .send({
        question: 'Favorite fruit?',
        options: ['Apple', 'Banana'],
      })

    const { pollId } = createRes.body

    const res = await request(app).get(`/api/polls/${pollId}`)

    expect(res.status).toBe(200)
    expect(res.body.poll).toHaveProperty('id', pollId)
    expect(res.body.poll).toHaveProperty('question', 'Favorite fruit?')
    expect(res.body.poll.options).toHaveLength(2)
    expect(res.body.votes).toHaveLength(2)
    expect(res.body.totalVotes).toBe(0)
    expect(res.body.hasVoted).toBe(false)

    // All vote counts should be 0 initially
    for (const vote of res.body.votes) {
      expect(vote.count).toBe(0)
      expect(vote.percentage).toBe(0)
    }
  })

  it('should return 404 POLL_NOT_FOUND when poll does not exist', async () => {
    const res = await request(app).get('/api/polls/nonexistent-id')

    expect(res.status).toBe(404)
    expect(res.body.code).toBe('POLL_NOT_FOUND')
    expect(res.body).toHaveProperty('error')
  })

  it('should return hasVoted = true after user has voted', async () => {
    // Create a poll
    const createRes = await request(app)
      .post('/api/polls')
      .send({
        question: 'Favorite season?',
        options: ['Summer', 'Winter'],
      })

    const { pollId } = createRes.body

    // Get poll to obtain option IDs
    const pollRes = await request(app).get(`/api/polls/${pollId}`)
    const optionId = pollRes.body.poll.options[0].id

    // Vote
    await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId })

    // Get poll again — should show hasVoted = true
    const afterVoteRes = await request(app).get(`/api/polls/${pollId}`)

    expect(afterVoteRes.status).toBe(200)
    expect(afterVoteRes.body.hasVoted).toBe(true)
  })

  it('should set X-Voter-Token cookie on first GET', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .send({
        question: 'Cookie test?',
        options: ['Yes', 'No'],
      })

    const { pollId } = createRes.body
    const res = await request(app).get(`/api/polls/${pollId}`)

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()

    const voterTokenCookie = Array.isArray(cookies)
      ? cookies.find((c: string) => c.includes('X-Voter-Token'))
      : typeof cookies === 'string' && cookies.includes('X-Voter-Token')
        ? cookies
        : undefined

    expect(voterTokenCookie).toBeDefined()
  })
})
