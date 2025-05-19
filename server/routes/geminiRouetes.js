import express from "express";
const router = express.Router();
import { askGemini } from "../controllers/geminiController.js";

router.post('/ask', askGemini);

export default router;