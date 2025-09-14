const Address = require("../models/address.model");
const CustomError = require("../../../utils/CustomError");
const User = require("../../User/models/user.model");

async function createAddress(userId, data) {
  // Normalize optional line2 to empty string for uniqueness consistency
  const payload = { ...data, userId, line2: data.line2 || "" };

  // Pre-check to give a cleaner error than duplicate key
  const existing = await Address.findOne({
    userId,
    line1: payload.line1,
    line2: payload.line2,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country,
  });
  if (existing) throw new CustomError("Address already exists", 409);

  try {
    const address = await Address.create(payload);
    User.findByIdAndUpdate(userId, { $push: { addresses: address._id } }).exec();
    return address;
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key from unique index
      throw new CustomError("Address already exists", 409);
    }
    throw err;
  }
}

async function listAddresses(userId) {

  const user = await User.findById(userId).populate({
    path: "addresses",
    select: "-__v",
  }).exec();

  return user ? user.addresses : [];
}

async function getAddress(userId, addressId) {
  return Address.findOne({ _id: addressId, userId });
}

async function updateAddress(userId, addressId, data) {
  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { $set: data },
    { new: true }
  );
  return address;
}

async function deleteAddress(userId, addressId) {
  const address = await Address.findOneAndDelete({ _id: addressId, userId });
  User.findByIdAndUpdate(userId, { $pull: { addresses: addressId } }).exec();
  return address;
}

module.exports = {
  createAddress,
  listAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
};
