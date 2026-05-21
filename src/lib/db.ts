import mongoose from 'mongoose';

declare global {
  var mongooseCache: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

const databaseUri = process.env.MONGODB_URI;
if (!databaseUri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const cached = global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(databaseUri!, opts).then((mongooseInstance) => mongooseInstance);
  }

  const conn = await cached.promise;

  if (!cached.conn) {
    cached.conn = conn;
    (async () => {
      try {
        const { seedDatabase } = await import('./seed');
        await seedDatabase();
      } catch (seedErr) {
        console.error('Database auto-seeding failed:', seedErr);
      }
    })();
  }

  return cached.conn;
}

export default dbConnect;
