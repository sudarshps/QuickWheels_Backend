import {IOtp} from '../../models/otp_model'

export interface IOtpRepository{
    createOtp(otpData:Partial<IOtp>):Promise<IOtp>
    validateOtp(otp:string,emailToVerify:string):Promise<IOtp|null>
}