const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userModel = require('../User/models/user.model'); // keep your model path


// load .env which is assumed at Backend/.env (adjust if different)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const seedAdmin = async () => {
  try {
    console.log("Connecting to MongoDB for seeding admin...", process.env.DB_CONNECT  );
     await mongoose.connect(process.env.DB_CONNECT, {
                serverSelectionTimeoutMS: 5000,
            });
    console.log("MongoDB connected for seeding admin...");

    const adminExists = await userModel.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists.");
      return;
    }

    const hashedPassword = await userModel.hashPassword(
      process.env.ADMIN_PASSWORD || "Admin@123"
    );

    const admin = new userModel({
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: hashedPassword,
      phone: process.env.ADMIN_PHONE || "0123456789",
      role: "admin",
      emailVerified: true, // Admins are pre-verified
    });

    await admin.save();
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedAdmin();
