const mongoose = require('mongoose');
const seedDatabase = require('./seed');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogverse';

  try {
    // Attempt connecting to the configured MongoDB instance (Local or Atlas)
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{3,})@/, ':****@')} ...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
  } catch (error) {
    console.warn(`⚠️ Could not reach MongoDB at ${mongoUri} (${error.message}).`);
    console.log(`🚀 Starting high-performance embedded in-memory MongoDB server...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { dbName: 'blogverse' }
      });
      const inMemoryUri = mongod.getUri();
      const conn = await mongoose.connect(inMemoryUri);

      console.log(`✅ Embedded In-Memory MongoDB Connected: ${inMemoryUri}`);
      await seedDatabase();
    } catch (inMemErr) {
      console.error(`❌ Fatal Database Connection Error: ${inMemErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
