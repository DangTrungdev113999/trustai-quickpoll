import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/polls/:id/vote', () => {
  async function createPollAndGetOptions() {
    const createRes = await request(app)
      .post('/api/polls')
      .send({
        question: 'Vote test?',
        options: ['Option A', 'Option B', 'Option C'],
      })

    const { pollId } = createRes.body
    const pollRes = await request(app).get(`/api/polls/${pollId}`)
    const options = pollRes.body.poll.options

    return { pollId, options }
  }

  it('should return 200 with updated results on first valid vote', async () => {
    const { pollId, options } = await createPollAndGetOptions()

    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: options[0].id })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.results).toHaveProperty('poll')
    expect(res.body.results).toHaveProperty('votes')
    expect(res.body.results).toHaveProperty('totalVotes')
    expect(res.body.results.totalVotes).toBe(1)
  })

  it('should return 409 ALREADY_VOTED when same IP votes twice', async () => {
    const { pollId, options } = await createPollAndGetOptions()

    // First vote
    await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: options[0].id })

    // Second vote from same IP
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: options[1].id })

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('ALREADY_VOTED')
  })

  it('should return 400 INVALID_OPTION when optionId does not exist', async () => {
    const { pollId } = await createPollAndGetOptions()

    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: 'nonexistent-option-id' })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_OPTION')
  })

  it('should return 404 POLL_NOT_FOUND when poll does not exist', async () => {
    const res = await request(app)
      .post('/api/polls/nonexistent-poll-id/vote')
      .send({ optionId: 'any-option' })

    expect(res.status).toBe(404)
    expect(res.body.code).toBe('POLL_NOT_FOUND')
  })

  it('should increment vote count after a successful vote', async () => {
    const { pollId, options } = await createPollAndGetOptions()

    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: options[0].id })

    const votedOption = res.body.results.votes.find(
      (v: { optionId: string }) => v.optionId === options[0].id,
    )

    expect(votedOption).toBeDefined()
    expect(votedOption.count).toBe(1)
  })

  it('should calculate percentage correctly (1 decimal place)', async () => {
    const { pollId, options } = await createPollAndGetOptions()

    // Vote for option A
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: options[0].id })

    const results = res.body.results

    // With 1 total vote, voted option should be 100.0%
    const votedOption = results.votes.find(
      (v: { optionId: string }) => v.optionId === options[0].id,
    )
    expect(votedOption.percentage).toBe(100.0)

    // Other options should be 0.0%
    const otherOptions = results.votes.filter(
      (v: { optionId: string }) => v.optionId !== options[0].id,
    )
    for (const opt of otherOptions) {
      expect(opt.percentage).toBe(0.0)
    }
  })

  it('should return all percentages as 0 when totalVotes is 0', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .send({
        question: 'Zero votes test?',
        options: ['X', 'Y'],
      })

    const { pollId } = createRes.body
    const pollRes = await request(app).get(`/api/polls/${pollId}`)

    expect(pollRes.body.totalVotes).toBe(0)

    for (const vote of pollRes.body.votes) {
      expect(vote.percentage).toBe(0)
    }
  })
})
