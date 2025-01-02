import Otp, { IOtp } from "../models/otp_model";
import { IOtpRepository } from "../interface/otp/IOtpRepository";
import BaseRepository from "../repositories/base_repository";

class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {
  constructor() {
    super(Otp);
  }
  async createOtp(otpData: Partial<IOtp>): Promise<IOtp> {
    try {
      return await this.create(otpData);
    } catch (error) {
      console.error("error in creating otp:", error);
      throw error;
    }
  }

  async validateOtp(otp: string, emailToVerify: string): Promise<IOtp | null> {
    try {
      const otpValidate = await this.findOne({ otp, email: emailToVerify });

      if (!otpValidate) {
        return null;
      }

      return otpValidate;
    } catch (error) {
      console.error("error in validating otp:", error);
      throw error;
    }
  }
}

export default new OtpRepository();
