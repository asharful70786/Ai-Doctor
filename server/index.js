import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import the database connection
import { sendOtp } from './services/otpService.js';
import Prompt from './model/Prompt.js'; // ES6-style import
import { GoogleGenerativeAI } from '@google/generative-ai';
import OTP from './model/otpModel.js';

dotenv.config();
connectDB(); // Connect to MongoDB
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are an AI Doctor. Help users understand symptoms and guide them with general advice. 
    DO NOT give prescriptions. Encourage them to consult real doctors.
  `
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided." });

  try {
    const result = await model.generateContent(question);
    const answer = result.response.text();

    await Prompt.create({ question });

    const total = await Prompt.countDocuments();

    res.json({ answer, total });
  } catch (err) {
    if (err.status === 429) {
      console.log("Rate limit hit. Retrying in 40 seconds...");
      setTimeout(() => {
        // retry logic here
      }, 40000); // 40s delay
    } else {
      console.error("Gemini Error:", err);
    }
  }

});

app.get('/count', async (req, res) => {
  try {
    const count = await Prompt.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get count." });
  }
});


app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  sendOtp(email);
  try {
    console.log(`Sending OTP to ${email}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp} = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP." });
    res.json({ success: true });
    //expire the OTP after successful verification
    await OTP.deleteOne({ email, otp });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify OTP." });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
