import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: String,
    timestamp: {
      type: Date, default:
        Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '5m' // OTP will expire after 5 minutes
    }
  }
);


const OTP = mongoose.model('OTP', otpSchema);
export default OTP;