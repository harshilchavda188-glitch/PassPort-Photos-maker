import mongoose from 'mongoose';
import { config } from './env';

const connectDB = async (): Promise<void> => {
  if (!config.mongodbUri) {
    console.warn('⚠️ MONGODB_URI not set — running without database. Auth & user features disabled.');
    return;
  }
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable — running without database. Auth & user features disabled.');
  }
};

export default connectDB;
