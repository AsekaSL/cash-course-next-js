import mongoose from 'mongoose'

// Global cache for the Mongoose connection to prevent creating
// multiple connections during development (hot-reloads) or serverless deploys.
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var mongooseCache: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  } | undefined
}

// Ensure a cache object exists on the global object
const cached = global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null })

// Connection options that are safe for modern Mongoose versions
const MONGO_OPTS: mongoose.ConnectOptions = {
  // Do not buffer commands when disconnected; fail fast instead of queuing
  bufferCommands: false,
}

/**
 * connectToDatabase
 * - Reuses an existing Mongoose connection when available.
 * - Creates and caches a Promise for the initial connection so concurrent
 *   calls reuse the same pending promise.
 * - Throws if `process.env.MONGODB_URI` is not defined.
 */
export async function connectToDatabase(): Promise<mongoose.Mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn
  }

  // Use cached promise if connection is in progress
  if (cached.promise) {
    cached.conn = await cached.promise
    return cached.conn
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  // Start connection and cache the promise immediately to prevent races
  cached.promise = mongoose.connect(uri, MONGO_OPTS).then((m) => m)

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (err) {
    // Clear cached promise on failure so subsequent attempts may retry
    cached.promise = null
    throw err
  }
}

export default connectToDatabase
