import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import { sendOtp } from './services/otpService.js';
import Prompt from './model/Prompt.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OTP from './model/otpModel.js';
import cookieParser from 'cookie-parser';
import User from './model/userModel.js';
import checkAuth from './middlewares/check_Auth_MiddleWare.js';

connectDB(); // Connect to MongoDB
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.salt));
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
  You are an AI Doctor. Help users understand symptoms and guide them with general advice. 
  DO NOT give prescriptions. Encourage them to consult real doctors.
  When replying, break your answer into bullet points using dash (-) or numbered list for clarity. and make that short in simple words. with in few sentences.
`

});

// ✅ Protected Route
app.post('/ask', checkAuth, async (req, res) => {
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
      }, 40000);
    } else {
      console.error("Gemini Error:", err);
      res.status(500).json({ error: "Something went wrong." });
    }
  }
});

app.get('/count', checkAuth, async (req, res) => {
  try {
    const count = await Prompt.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get count." });
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.insertOne({ email, password });
    let p1 = await User.findOne({ email });
    console.log(p1)
    if (!user) return res.status(400).json({ error: "failed to create user" });
    res.cookie("token", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      signed: true
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

app.post('/send-otp', async (req, res) => {
  const { email, password } = req.body;

  try {

    sendOtp(email); // Send OTP to the email
    return res.json({ success: "user created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp, password, type } = req.body;

  if (!email || !otp || !type) return res.status(400).json({ error: "Missing fields." });
  const user = await User.findOne({ email });
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP." });

    if (type === "register") {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ error: "User already exists." });

      await User.create({ email, password }); // use create instead of insertOne
    } else if (type === "login") {

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
    }

    res.cookie("token", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      signed: true
    });


    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

   const user = await User.findOne({ email, password, });
  try {
    res.cookie("token", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      signed: true
    });


    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});


app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Logged out" });
});



app.post('/otp-login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    await sendOtp(email); // Send OTP
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// ✅ Verify OTP and log in the user (no password)
app.post('/verify-otp-login', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required." });

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    res.cookie("token", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      signed: true
    });


    await OTP.deleteOne({ email, otp }); // Invalidate OTP
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP login failed." });
  }
});
app.get("/auth-check", (req, res) => {
  const token = req.signedCookies.token;
  if (!token) {
    return res.status(401).json({ auth: false });
  }

  // You can add further verification (like checking if email exists in DB)
  res.json({ auth: true, email: token });
});





app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
