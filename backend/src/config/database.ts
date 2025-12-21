import mongoose from 'mongoose';
import logger from '../utils/logger.js';

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/taggr';

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Add retry logic
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(mongoURI, options);

    logger.info('✅ MongoDB connected successfully');
    retryCount = 0; // Reset on success

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      // Attempt to reconnect
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        logger.info(`Attempting to reconnect to MongoDB (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => connectDB(), RETRY_DELAY);
      } else {
        logger.warn('⚠️  Max reconnection attempts reached. Manual intervention may be required.');
      }
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    
    // Retry connection instead of failing completely
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.warn(`⚠️  Retrying MongoDB connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY/1000}s...`);
      setTimeout(() => connectDB(), RETRY_DELAY);
    } else {
      logger.warn('⚠️  Max retries reached. Server will continue without database.');
      logger.warn('⚠️  Some features may not work until database is connected.');
      // Don't exit - allow server to start for health checks
    }
  }
};

export default connectDB;
