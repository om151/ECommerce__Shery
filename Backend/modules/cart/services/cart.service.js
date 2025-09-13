// services/cart.service.js
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/cart.model");
const {
  Product,
  ProductVariant,
} = require("../../Product/models/product.model");

/**
 * Helpers
 */
function ensurePositiveInteger(n) {
  return Number.isFinite(n) && n >= 1 && Math.floor(n) === n;
}

async function calculateItemTotalPrice(variantDoc, quantity) {
  if (!variantDoc) throw new Error("Variant data missing");
  if (typeof variantDoc.price !== "number")
    throw new Error("Variant price is not available or invalid");
  return variantDoc.price * quantity;
}

/**
 * ADD TO CART
 */
async function addToCart(userId, productId, variantId, quantity) {
  if (!ensurePositiveInteger(quantity))
    throw new Error("Quantity must be an integer >= 1");

  if (!variantId) {
    throw new Error("Variant ID is required");
  }
  const [product, variant] = await Promise.all([
    Product.findById(productId).lean(),
    ProductVariant.findById(variantId).lean(),
  ]);

  if (!product) throw new Error("Product not found");
  if (!variant) throw new Error("Variant not found");

  console.log(variant, productId);
  // Ensure the variant belongs to the product
  if (
    variant.productId &&
    variant.productId.toString() !== productId.toString()
  ) {
    throw new Error("Variant does not belong to the specified product");
  }

  const totalPrice = await calculateItemTotalPrice(variant, quantity);

  let cart = await Cart.findOne({ userId });

  // Check if item already exists in cart
  let cartItemId;
  if (cart) {
    let itemIds = !cart.items
      ? []
      : Array.isArray(cart.items)
      ? cart.items
      : [cart.items];

    const cartItems = await CartItem.find({ _id: { $in: itemIds } });
    const existingItem = cartItems.find(
      (ci) =>
        ci.productId.toString() === productId.toString() &&
        ci.variantId.toString() === variantId.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice += totalPrice;
      await existingItem.save();
      // Only update cart total, do not add new item
      cart.total = (cart.total || 0) + totalPrice;
      await cart.save();
      return Cart.findById(cart._id).populate({
        path: "items",
        populate: [
          { path: "productId", model: "Product" },
          { path: "variantId", model: "ProductVariant" },
        ],
      });
    } else {
      const cartItem = await CartItem.create({
        productId,
        variantId,
        quantity,
        totalPrice,
      });
      cartItemId = cartItem._id;
      cart.items.push(cartItemId);
      cart.total = (cart.total || 0) + totalPrice;
      await cart.save();
    }
  } else {
    const cartItem = await CartItem.create({
      productId,
      variantId,
      quantity,
      totalPrice,
    });
    cartItemId = cartItem._id;
    cart = new Cart({
      userId,
      items: [cartItemId],
      total: totalPrice,
      currency: "INR",
    });
    await cart.save();
  }

  return Cart.findById(cart._id).populate({
    path: "items",
    populate: [
      { path: "productId", model: "Product" },
      { path: "variantId", model: "ProductVariant" },
    ],
  });
}

/**
 * EDIT CART
 */
async function editCart(userId, productId, variantId, quantity) {
  if (!ensurePositiveInteger(quantity))
    throw new Error("Quantity must be an integer >= 1");

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  let itemIds = !cart.items
    ? []
    : Array.isArray(cart.items)
    ? cart.items
    : [cart.items];

  const cartItems = await CartItem.find({ _id: { $in: itemIds } });
  const target = cartItems.find(
    (ci) =>
      ci.productId.toString() === productId.toString() &&
      ci.variantId.toString() === variantId.toString()
  );

  if (!target) throw new Error("Product not in cart");

  const variant = await ProductVariant.findById(variantId).lean();
  if (!variant) throw new Error("Variant not found");

  const newTotalPrice = await calculateItemTotalPrice(variant, quantity);

  cart.total = (cart.total || 0) - target.totalPrice + newTotalPrice;

  target.quantity = quantity;
  target.totalPrice = newTotalPrice;
  await target.save();
  await cart.save();

  return Cart.findById(cart._id).populate({
    path: "items",
    populate: [
      { path: "productId", model: "Product" },
      { path: "variantId", model: "ProductVariant" },
    ],
  });
}

/**
 * REMOVE FROM CART
 */
async function removeFromCart(userId, productId, variantId) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  let itemIds = !cart.items
    ? []
    : Array.isArray(cart.items)
    ? cart.items.map(String)
    : [cart.items.toString()];

  const cartItems = await CartItem.find({ _id: { $in: itemIds } });
  const target = cartItems.find(
    (ci) =>
      ci.productId.toString() === productId.toString() &&
      ci.variantId.toString() === variantId.toString()
  );

  if (!target) throw new Error("Product not in cart");

  cart.total = Math.max(0, (cart.total || 0) - target.totalPrice);

  if (Array.isArray(cart.items)) {
    cart.items = cart.items.filter(
      (id) => id.toString() !== target._id.toString()
    );
  } else {
    cart.items = undefined;
  }

  await cart.save();
  await CartItem.deleteOne({ _id: target._id });

  return Cart.findById(cart._id).populate({
    path: "items",
    populate: [
      { path: "productId", model: "Product" },
      { path: "variantId", model: "ProductVariant" },
    ],
  });
}

/**
 * GET CART
 */
async function getCart(userId) {
  const cart = await Cart.findOne({ userId }).populate({
    path: "items",
    populate: [
      { path: "productId", model: "Product" },
      { path: "variantId", model: "ProductVariant" },
    ],
  });

  if (!cart) return { items: [], total: 0, currency: "INR" };

  const items = !cart.items
    ? []
    : Array.isArray(cart.items)
    ? cart.items
    : [cart.items];

  return {
    _id: cart._id,
    userId: cart.userId,
    items,
    total: cart.total || 0,
    currency: cart.currency || "INR",
    updatedAt: cart.updatedAt,
    createdAt: cart.createdAt,
  };
}

module.exports = {
  addToCart,
  editCart,
  removeFromCart,
  getCart,
};
