import {Router} from 'express'
import OtpController from '../controllers/otp_controller'

const routes:Router = Router()

routes.post('/sentOtp',OtpController.generateOtp.bind(OtpController)) 
routes.post('/verifyOtp',OtpController.verifyOtp.bind(OtpController))

export default routes