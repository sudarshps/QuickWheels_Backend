import Otp,{IOtp} from '../models/otp_model'


class OtpRepository {
    async createOtp(otpData:Partial<IOtp>):Promise<IOtp>{

        const otp = new Otp(otpData)

        return await otp.save()
    }

    async validateOtp(otp:string,emailToVerify:string):Promise<IOtp|null> {
        const otpValidate = await Otp.findOne({otp,email:emailToVerify});
        
        if(!otpValidate){
            return null;
        }

        return otpValidate
    }
}


export default OtpRepository