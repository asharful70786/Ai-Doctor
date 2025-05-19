import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import geminiRouter from './routes/geminiRouetes.js';


connectDB();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.salt));
app.use(express.json());

app.use("/", geminiRouter);
// app.use("/" , userRouter);//just by now off all log-in logic i will apply google implicit login 
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
