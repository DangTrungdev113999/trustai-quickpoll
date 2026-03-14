import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../app'

describe('POST /api/polls', () => {
  it('should create a poll with valid question and 2-5 options → 201', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('pollId')
    expect(res.body).toHaveProperty('shareUrl')
    expect(typeof res.body.pollId).toBe('string')
    expect(typeof res.body.shareUrl).toBe('string')
  })

  it('should return 400 VALIDATION_ERROR when question is empty', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: '',
        options: ['Red', 'Blue'],
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(res.body).toHaveProperty('error')
  })

  it('should return 400 VALIDATION_ERROR when fewer than 2 options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: 'Pick one?',
        options: ['Only one'],
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 VALIDATION_ERROR when more than 5 options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: 'Pick one?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 VALIDATION_ERROR when options contain duplicates', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({
        question: 'Pick one?',
        options: ['Red', 'Red', 'Blue'],
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})
