const asyncHandler = require("../../../utils/asyncHandler");
const addressService = require("../services/address.service");
const CustomError = require("../../../utils/CustomError");

exports.createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const address = await addressService.createAddress(userId, req.body);
  res.status(201).json({ message: "Address created", address });
});

exports.listAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await addressService.listAddresses(userId);
  res.status(200).json({ addresses });
});

exports.getAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const address = await addressService.getAddress(userId, id);
  if (!address) throw new CustomError("Address not found", 404);
  res.status(200).json({ address });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const address = await addressService.updateAddress(userId, id, req.body);
  if (!address) throw new CustomError("Address not found", 404);
  res.status(200).json({ message: "Address updated", address });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const address = await addressService.deleteAddress(userId, id);
  if (!address) throw new CustomError("Address not found", 404);
  res.status(200).json({ message: "Address deleted" });
});
