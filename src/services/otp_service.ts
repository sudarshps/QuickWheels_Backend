import OtpRepository from '../repositories/otp_repository'
import otpGenerator from 'otp-generator'
import nodemailer from 'nodemailer'
import { IOtpRepository } from '../interface/otp/IOtpRepository'
import {IOtpService} from '../interface/otp/IOtpService'

interface OtpValidate {
    validOtp: boolean;
    message?: string;
}

class OTPService implements IOtpService{
  constructor(private _otpRepository:IOtpRepository){}
    async generateOtp(email: string): Promise<void> {
        const otp = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,  
          upperCaseAlphabets: false,  
          specialChars: false,        
        });
  
      await this._otpRepository.createOtp({email, otp});
  
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
		port: 587,
		secure: false,
		requireTLS: true,
        auth: {
          user: process.env.OTP_MAIL_USER,
          pass: process.env.OTP_MAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: process.env.OTP_MAIL_USER,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}`,
      });
    }

    async verifyOtp(otp:string,emailToVerify:string):Promise<OtpValidate> {
        const otpResponse = await this._otpRepository.validateOtp(otp,emailToVerify)
        
        if(otpResponse){
            return{
                validOtp:true,
                message:'otp is valid'
            }
        }
        return{
            validOtp:false,
            message:'otp is invalid'
        }
    }
  }
  
  export default new OTPService(OtpRepository);