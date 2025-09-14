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

// Prevent the same exact address (ignoring label) being added multiple times by the same user
// We index the combination of user + address location fields. line2 is optional so we coalesce to empty string at write time (handled in service layer too)
AddressSchema.index(
  {
    userId: 1,
    line1: 1,
    line2: 1,
    city: 1,
    state: 1,
    postalCode: 1,
    country: 1,
  },
  { unique: true, name: "uniq_user_address_components" }
);

module.exports = mongoose.model("Address", AddressSchema);
