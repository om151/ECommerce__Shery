const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/auth.middleware");
const addressController = require("../controllers/address.controller");
const {
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressIdParam,
} = require("../validation/address.validation");

// Create address
router.post(
  "/",
  authMiddleware,
  validateCreateAddress,
  addressController.createAddress
);

// List addresses for logged-in user
router.get("/", authMiddleware, addressController.listAddresses);

// Get single address
router.get(
  "/:id",
  authMiddleware,
  validateAddressIdParam,
  addressController.getAddress
);

// Update address
router.put(
  "/:id",
  authMiddleware,
  validateUpdateAddress,
  addressController.updateAddress
);

// Delete address
router.delete(
  "/:id",
  authMiddleware,
  validateAddressIdParam,
  addressController.deleteAddress
);

module.exports = router;
