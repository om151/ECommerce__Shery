const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
