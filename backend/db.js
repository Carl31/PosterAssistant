const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection.');
    return;
  }
  
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@presets.niu4k.mongodb.net/?retryWrites=true&w=majority&appName=presets`
    );
    isConnected = conn.connections[0].readyState;
    
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
