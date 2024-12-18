import {Response,Request} from 'express'
import OtpService from '../services/otp_service'
import { IOtpService } from '../interface/otp/IOtpService'

class OtpController {
    constructor(private _otpService:IOtpService){}
    async generateOtp(req:Request,res:Response):Promise<void> {
        const {email}= req.body

        try {
            const otpSent = await this._otpService.generateOtp(email)
            res.status(200).json({otpSent:true,message:'OTP sent successfully'})
        } catch (error) {
            console.error(error)
            res.status(500).send('Error sending otp')
        }
    }

    async verifyOtp(req:Request,res:Response):Promise<void>{
        const {otp,emailToVerify} = req.body
    
        try {
           const response = await this._otpService.verifyOtp(otp,emailToVerify)       
           res.json(response)
       
        } catch (error) {
            console.error(error)
            res.status(500).send('Error validating otp')
        }
    }
}
export default new OtpController(OtpService)