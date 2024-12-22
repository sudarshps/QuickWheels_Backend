import Otp,{IOtp} from '../models/otp_model'
import {IOtpRepository} from '../interface/otp/IOtpRepository'
import BaseRepository from '../repositories/base_repository'

class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository{

    constructor(){
        super(Otp)
    }
    async createOtp(otpData:Partial<IOtp>):Promise<IOtp>{

        return await this.create(otpData)
    }

    async validateOtp(otp:string,emailToVerify:string):Promise<IOtp|null> {
        const otpValidate = await this.findOne({otp,email:emailToVerify})
        
        if(!otpValidate){
            return null;
        }

        return otpValidate
    }
}


export default new OtpRepository()