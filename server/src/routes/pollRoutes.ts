import { Router } from 'express'
import * as pollController from '../controllers/pollController'
import { optionalAuth, requireAuth } from '../middleware/auth'

const router = Router()

// Dashboard
router.get('/polls', pollController.listPolls)

// Poll CRUD
router.post('/polls', optionalAuth, pollController.createPoll)
router.post('/polls/migrate', requireAuth, pollController.migratePolls)
router.get('/polls/:id', pollController.getPoll)
router.delete('/polls/:id', optionalAuth, pollController.deletePoll)

// Poll actions
router.post('/polls/:id/vote', pollController.votePoll)
router.post('/polls/:id/close', optionalAuth, pollController.closePoll)
router.get('/polls/:id/qr', pollController.getQRCode)

export default router
