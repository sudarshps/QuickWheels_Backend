import {Router} from 'express'
import authController from '../controllers/auth_controller'

const router:Router = Router()

router.get('/auth',authController.authenticateUser)
router.get('/auth/callback',authController.handleCallback)
router.get('/auth/failure',authController.handleFailure)

export default router;