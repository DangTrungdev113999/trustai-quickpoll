import { Router } from 'express'
import * as pollController from '../controllers/pollController'

const router = Router()

router.post('/polls', pollController.createPoll)
router.get('/polls/:id', pollController.getPoll)
router.post('/polls/:id/vote', pollController.votePoll)

export default router
