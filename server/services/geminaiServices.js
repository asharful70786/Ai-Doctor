
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
  You are an AI Doctor. Help users understand symptoms and guide them with general advice. 
  DO NOT give prescriptions. Encourage them to consult real doctors.
  When replying, break your answer into bullet points using dash (-) or numbered list for clarity. and make that short in simple words. with in few sentences.
`

});

export default model;