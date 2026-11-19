const mongoose = require('mongoose');
const seedDatabase = require('./seed');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ Database Connection Error: MONGO_URI is not defined in environment variables.');
    console.error('Please configure MONGO_URI in your .env file.');
    process.exit(1);
  }

  // Safely mask credentials for clean console logging
  const maskedUri = mongoUri.replace(/:([^:@]{3,})@/, ':****@');

  try {
    console.log(`Connecting to MongoDB at: ${maskedUri} ...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`======================================================`);
    console.log(`✅ MongoDB ${isAtlas ? 'Atlas ' : ''}Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`======================================================`);

    await seedDatabase();
  } catch (error) {
    console.error(`======================================================`);
    console.error(`❌ MongoDB Connection Failed!`);
    console.error(`Target: ${maskedUri}`);
    console.error(`Error: ${error.message}`);
    console.error(`Please check:`);
    console.error(` 1. Database user credentials in backend/.env`);
    console.error(` 2. MongoDB Atlas Network Access (IP Whitelist: 0.0.0.0/0)`);
    console.error(` 3. Internet connectivity`);
    console.error(`======================================================`);
    // Ensure the server does not silently continue when the database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
