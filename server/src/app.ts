import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pollRoutes from './routes/pollRoutes'
import authRoutes from './routes/authRoutes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api', pollRoutes)
app.use('/api', authRoutes)

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err.message || 'Internal server error'
  const codeMatch = message.match(/ code:([A-Z_]+)$/)

  if (codeMatch) {
    const errorMessage = message.replace(/ code:[A-Z_]+$/, '')
    const code = codeMatch[1]

    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400,
      POLL_NOT_FOUND: 404,
      ALREADY_VOTED: 409,
      INVALID_OPTION: 400,
      FORBIDDEN: 403,
      POLL_CLOSED: 400,
      UNAUTHORIZED: 401,
    }

    const status = statusMap[code] ?? 500
    res.status(status).json({ error: errorMessage, code })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
})

export default app
