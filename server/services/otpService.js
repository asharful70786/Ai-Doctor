import nodemailer from "nodemailer";
import OTP from "../model/otpModel.js";


console.log( process.env.GMAIL_PASSWORD , "process.env.GMAIL_PASSWORD")
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
 
  auth: {
    user: "ashrafulmomin2@gmail.com",
    pass: process.env.GMAIL_PASSWORD, // Use App Passwords
  },
});

"tpca xhhn fvky vwmf"

export async function sendOtp(email) {
  const otp = Math.floor(1000 + Math.random() * 9999);

  await OTP.findOneAndUpdate(
    { email },
    { otp, timestamp: Date.now() },
    { upsert: true, }
  );

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #16a34a;">🔐 OTP Verification</h2>
        <p style="font-size: 16px; color: #374151;">Hello,</p>
        <p style="font-size: 16px; color: #374151;">Your One-Time Password (OTP) for verification is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; padding: 14px 30px; background-color: #16a34a; color: white; font-size: 24px; letter-spacing: 4px; border-radius: 6px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This OTP is valid for the next 5 minutes. Do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you,<br/>AI Doctor Team</p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: '"AI Doctor" <ashrafulmomin2@gmail.com>',
    to: email,
    subject: "Your OTP for Verification",
    html: htmlTemplate,
  });

  console.log("✅ OTP Email Sent:", info.messageId);
}


