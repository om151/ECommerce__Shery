const mongoose = require("mongoose");

let isConnected = false;

const connectToDb = async () => {
  if (isConnected) {
    console.log("Using existing database connection.");
    return;
  }
  try {
     await mongoose.connect(process.env.DB_CONNECT, {
            serverSelectionTimeoutMS: 5000,
        });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Database Connection Error:", err);
    process.exit(1);
  }
};

module.exports = { connectToDb };
