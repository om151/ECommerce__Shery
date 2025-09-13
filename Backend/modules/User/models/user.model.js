const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
      maxlength: [100, "Email must be at most 100 characters long"],
      minlength: [5, "Email must be at least 5 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [100, "Password must be at most 100 characters long"],
      // match: [
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/,
      //   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      // ],
    },
    name: { type: String, required: [true, "Name is required"], minlength: [2, "Name must be at least 2 characters long"], maxlength: [50, "Name must be at most 50 characters long"] },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      minlength: [10, "Phone number must be at least 10 digits"],
      maxlength: [10, "Phone number must be at most 10 digits"],
    },
    role: { type: String, enum: ["user", "admin"], default: "user"  },
    addresses: {
      type:[
      {
        label: { type: String, required: [true, "Address label is required"] },
        line1: { type: String, required: [true, "Address line 1 is required"] },
        line2: { type: String },
        city: { type: String, required: [true, "City is required"] },
        state: { type: String, required: [true, "State is required"] },
        postalCode: {
          type: String,
          required: [true, "Postal code is required"],
          minlength: [6, "Postal code must be at least 6 characters long"],
          maxlength: [6, "Postal code must be at most 6 characters long"],
        },
        country: { type: String, required: [true, "Country is required"] },
      },
    ],
    select: false,
  },
    wishlistItems:{
      type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    select:false
    },
    orderHistory: {
      type: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: [true, "Order ID is required"],
          select: false,
        },
        orderedAt: { type: Date, default: Date.now },
        
      },
    ],
    select:false
      }
    ,
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastPasswordResetDone: { type: Date },
    lastPasswordResetRequest: { type: Date },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    resetRequestCount: { type: Number, default: 0 },
    resetRequestDate: { type: Date },
  },

  { timestamps: true }
);

userSchema.methods.generateAuthToken = async function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
