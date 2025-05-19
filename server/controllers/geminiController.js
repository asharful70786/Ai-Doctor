import Prompt from "../models/Prompt.js";
import model  from "../services/geminaiServices.js";

export const askGemini =  async (req, res) => {
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
}