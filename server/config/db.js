const mongoose = require('mongoose');

let isConnectedInMemory = false;

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whiteboard';
  try {
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 3000 // Fast fail if local mongo isn't active
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${err.message}).`);
    console.warn(`[MongoDB Notice] Server will run with high-performance In-Memory state persistence mode.`);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect error
    }
    isConnectedInMemory = true;
  }
};

const getIsInMemoryMode = () => isConnectedInMemory;

module.exports = { connectDB, getIsInMemoryMode };
