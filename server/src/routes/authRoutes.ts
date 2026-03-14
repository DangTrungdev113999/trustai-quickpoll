import { Router } from 'express'
import * as authController from '../controllers/authController'
import { optionalAuth } from '../middleware/auth'

const router = Router()

router.post('/auth/send-magic-link', authController.sendMagicLink)
router.post('/auth/verify-magic-link', authController.verifyMagicLink)
router.get('/auth/me', optionalAuth, authController.getMe)

export default router
