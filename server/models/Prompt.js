import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  question: String,
  timestamp: { type: Date, default: Date.now },
});

const Prompt =  mongoose.model('Prompt', promptSchema);

export default Prompt;