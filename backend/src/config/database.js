const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      });
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.warn(`MongoDB connection attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000 * (i + 1))); // increase backoff
    }
  }
  throw new Error('MongoDB connection failed after all retries');
};

module.exports = { connectDB };
