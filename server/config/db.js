import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
    process.exit(1); // Exit process with failure
  }
}
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log("✅ MongoDB Connection Closed");
  process.exit(0);
});


export default connectDB;