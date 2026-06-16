import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-digital-twin';
    console.log(`[Database] Connecting to: ${connUri}`);
    await mongoose.connect(connUri);
    console.log('[Database] MongoDB Connected successfully.');
  } catch (error) {
    console.error('[Database] Connection Error:', error);
    process.exit(1);
  }
};
