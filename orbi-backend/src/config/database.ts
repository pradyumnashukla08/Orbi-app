import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export const connectDatabase = async (): Promise<void> => {
  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[db] MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

export const isDatabaseConnected = (): boolean =>
  mongoose.connection.readyState === mongoose.ConnectionStates.connected;
