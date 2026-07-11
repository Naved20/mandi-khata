import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null, 
    connectionStatus: 'connecting', // 'connecting', 'connected', 'failed'
    lastCheck: 0,
    checkInterval: 30000, // Re-check connection every 30 seconds
  };
}

/**
 * Quick MongoDB connection check with timeout
 * Returns immediately with cached status if recently checked
 */
export async function checkMongoDBConnection() {
  const now = Date.now();
  
  // Return cached status if recently checked
  if (cached.lastCheck && (now - cached.lastCheck) < cached.checkInterval) {
    return cached.connectionStatus === 'connected';
  }
  
  // Try connection with aggressive timeout
  try {
    // Don't wait for full connection - just check if it's reachable
    if (cached.conn?.connection?.readyState === 1) {
      cached.connectionStatus = 'connected';
      cached.lastCheck = now;
      return true;
    }
  } catch (e) {
    // Ignore
  }
  
  return false;
}

export async function connectDB({ skipTimeout = false } = {}) {
  // If already connected, return immediately
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Aggressive timeout settings for fast failure
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: skipTimeout ? 30000 : 3000, // 3s for login, 30s for background
      socketTimeoutMS: 30000,
      connectTimeoutMS: 3000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4, // Use IPv4, skip IPv6
      maxIdleTimeMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        cached.connectionStatus = 'connected';
        cached.lastCheck = Date.now();
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.warn('⚠️ MongoDB connection failed:', error.code, error.message);
        cached.connectionStatus = 'failed';
        cached.lastCheck = Date.now();
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.connectionStatus = 'failed';
    console.warn('⚠️ MongoDB unavailable - using offline mode');
    return null;
  }

  return cached.conn;
}

/**
 * Non-blocking connection check - useful for login
 * Returns true if MongoDB is available, false otherwise
 * Does NOT wait for connection to complete
 */
export function isMongoDBAvailable() {
  try {
    // Quick check without awaiting
    if (cached.conn?.connection?.readyState === 1) {
      return true;
    }
    
    // Check cached status
    if (cached.connectionStatus === 'connected') {
      return true;
    }
    
    // If we haven't checked recently, assume unavailable (fail fast)
    return false;
  } catch (e) {
    return false;
  }
}

export default connectDB;
