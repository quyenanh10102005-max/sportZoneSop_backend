require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(' Connected to MongoDB Atlas');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;