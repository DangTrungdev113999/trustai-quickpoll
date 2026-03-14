import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('GET /api/polls/:id/qr', () => {
  it('should return QR code data URL for a valid poll', async () => {
    const createRes = await request(app)
      .post('/api/polls')
      .send({ question: 'QR test?', options: ['Yes', 'No'] })

    const pollId = createRes.body.pollId

    const res = await request(app).get(`/api/polls/${pollId}/qr`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('pollId', pollId)
    expect(res.body).toHaveProperty('shareUrl')
    expect(res.body).toHaveProperty('qrCodeDataUrl')
    expect(res.body.qrCodeDataUrl).toMatch(/^data:image\//)
  })

  it('should return 404 for non-existent poll', async () => {
    const res = await request(app).get('/api/polls/non-existent-id/qr')

    expect(res.status).toBe(404)
    expect(res.body.code).toBe('POLL_NOT_FOUND')
  })
})
