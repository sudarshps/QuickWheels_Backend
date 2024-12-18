


interface OtpValidate {
    validOtp: boolean;
    message?: string;
}

export interface IOtpService{
    generateOtp(email: string): Promise<void>
    verifyOtp(otp:string,emailToVerify:string):Promise<OtpValidate>
}