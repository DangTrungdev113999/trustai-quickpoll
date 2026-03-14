import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/auth/send-magic-link', () => {
  it('should send magic link for valid email', async () => {
    const res = await request(app)
      .post('/api/auth/send-magic-link')
      .send({ email: 'test@example.com' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('message')
  })

  it('should return 400 VALIDATION_ERROR for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/send-magic-link')
      .send({ email: '' })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /api/auth/verify-magic-link', () => {
  beforeAll(async () => {
    // Pre-create magic link for tests
    await request(app)
      .post('/api/auth/send-magic-link')
      .send({ email: 'verify-test@example.com' })
  })

  it('should return session + user for valid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify-magic-link')
      .send({ token: 'valid-magic-link-token' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('session')
    expect(res.body.session).toHaveProperty('userId')
    expect(res.body.session).toHaveProperty('token')
    expect(res.body.session).toHaveProperty('expiresAt')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user).toHaveProperty('email')
  })

  it('should return 401 UNAUTHORIZED for invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify-magic-link')
      .send({ token: 'invalid-token' })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })
})

describe('GET /api/auth/me', () => {
  let sessionToken: string

  beforeAll(async () => {
    // Create user + session for /me tests
    await request(app)
      .post('/api/auth/send-magic-link')
      .send({ email: 'me-test@example.com' })

    const verifyRes = await request(app)
      .post('/api/auth/verify-magic-link')
      .send({ token: 'valid-magic-link-token' })

    sessionToken = verifyRes.body.session.token
  })

  it('should return user data with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user).toHaveProperty('email')
    expect(res.body.user).toHaveProperty('createdAt')
  })

  it('should return 401 UNAUTHORIZED without token', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })
})
