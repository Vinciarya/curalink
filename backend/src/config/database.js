const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        family: 4, // Force IPv4 to avoid common Atlas TLS/SSL IPV6 failures
        tls: true, // Explicitly enforce TLS
        // If you are behind a corporate proxy, uncomment the next line:
        // tlsAllowInvalidCertificates: true,
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
