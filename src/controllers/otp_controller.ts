import {Response,Request} from 'express'
import OtpService from '../services/otp_service'
import OtpRepository from '../repositories/otp_repository';

const otpRepository = new OtpRepository()
const otpService = new OtpService(otpRepository)


export const generateOtp = async (req:Request,res:Response):Promise<void> => {

    const {email}= req.body

    try {
        const otpSent = await otpService.generateOtp(email)
        res.status(200).json({otpSent:true,message:'OTP sent successfully'})
    } catch (error) {
        console.error(error)
        res.status(500).send('Error sending otp')
    }
}

export const verifyOtp = async (req:Request,res:Response):Promise<void> => {

    const {otp,emailToVerify} = req.body
    
    try {
       const response = await otpService.verifyOtp(otp,emailToVerify)       
       res.json(response)
   
    } catch (error) {
        console.error(error)
        res.status(500).send('Error validating otp')
    }
}