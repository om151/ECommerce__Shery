const { body, param, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateCreateAddress = [
  body("label").notEmpty().withMessage("label is required"),
  body("line1").notEmpty().withMessage("line1 is required"),
  body("line2").optional().isString(),
  body("city").notEmpty().withMessage("city is required"),
  body("state").notEmpty().withMessage("state is required"),
  body("postalCode")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("postalCode must be 6 characters"),
  body("country").notEmpty().withMessage("country is required"),
  handleValidation,
];

exports.validateUpdateAddress = [
  param("id").isMongoId().withMessage("Valid address id required"),
  body("label").optional().isString(),
  body("line1").optional().isString(),
  body("line2").optional().isString(),
  body("city").optional().isString(),
  body("state").optional().isString(),
  body("postalCode").optional().isLength({ min: 6, max: 6 }),
  body("country").optional().isString(),
  handleValidation,
];

exports.validateAddressIdParam = [
  param("id").isMongoId().withMessage("Valid address id required"),
  handleValidation,
];
