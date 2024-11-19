import {Router} from 'express'
import {generateOtp,verifyOtp} from '../controllers/otp_controller'

const routes:Router = Router()

routes.post('/sentOtp',generateOtp) 
routes.post('/verifyOtp',verifyOtp)

export default routes