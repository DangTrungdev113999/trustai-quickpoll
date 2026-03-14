import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('DELETE /api/polls/:id', () => {
  it('should delete a poll when requested by owner', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', 'Bearer valid-owner-token')
      .send({ question: 'Delete me?', options: ['Yes', 'No'] })

    const pollId = createRes.body.pollId

    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set('Authorization', 'Bearer valid-owner-token')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)

    // Verify poll is actually deleted
    const getRes = await request(app).get(`/api/polls/${pollId}`)
    expect(getRes.status).toBe(404)
  })

  it('should return 403 FORBIDDEN when non-owner tries to delete poll', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', 'Bearer owner-token')
      .send({ question: 'Cannot delete?', options: ['A', 'B'] })

    const pollId = createRes.body.pollId

    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set('Authorization', 'Bearer different-user-token')

    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('should return 404 POLL_NOT_FOUND for non-existent poll', async () => {
    const res = await request(app)
      .delete('/api/polls/non-existent-id')
      .set('Authorization', 'Bearer valid-owner-token')

    expect(res.status).toBe(404)
    expect(res.body.code).toBe('POLL_NOT_FOUND')
  })
})
