import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt?: Date;
}

const otpSchema: Schema<IOtp> = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: '2m', default: Date.now }
});

const Otp = mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
