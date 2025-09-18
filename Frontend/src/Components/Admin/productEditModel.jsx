import React, { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const { updateProduct } = useAdmin();
  const [editedProduct, setEditedProduct] = React.useState({
    title: product.title || "",
    description: product.description || "",
    categories: product.categories || [],
    variants: product.variants || [],
  });
  const [activeVariantIndex, setActiveVariantIndex] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleProductChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantChange = (variantIndex, field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === variantIndex ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleInventoryChange = (variantIndex, field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              inventoryId: {
                ...variant.inventoryId,
                [field]: value,
              },
            }
          : variant
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log("Saving product with data:", editedProduct);
      await updateProduct(product._id, editedProduct);
      console.log("Product saved successfully");
      onSave();
    } catch (error) {
      console.error("Failed to save product:", error);
      setSaveError(error.message || "Failed to save product changes");
    } finally {
      setIsSaving(false);
    }
  };

  const addNewVariant = () => {
    const newVariant = {
      _id: Date.now().toString(),
      // sku: `NEW-${Date.now()}`,
      price: 0,
      discountedPrice: 0,
      attributes: {},
      images: [],
      inventory: {
        quantityAvailable: 0,
        reserved: 0,
        sold: 0,
      },
    };
    setEditedProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setActiveVariantIndex(editedProduct.variants.length);
  };

  const removeVariant = (variantIndex) => {
    if (editedProduct.variants.length <= 1) {
      alert("Product must have at least one variant");
      return;
    }
    setEditedProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== variantIndex),
    }));
    if (activeVariantIndex >= editedProduct.variants.length - 1) {
      setActiveVariantIndex(Math.max(0, editedProduct.variants.length - 2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-sm text-gray-600">ID: {product._id}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Save Error Display */}
        {saveError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-700 text-sm">
                <span className="font-medium">Error saving product:</span>{" "}
                {saveError}
              </p>
              <button
                onClick={() => setSaveError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Product Basic Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editedProduct.title}
                  onChange={(e) => handleProductChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <input
                  type="text"
                  value={editedProduct.categories.join(", ")}
                  onChange={(e) =>
                    handleProductChange(
                      "categories",
                      e.target.value.split(", ").filter(Boolean)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter categories (comma-separated)"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>
              <textarea
                value={editedProduct.description}
                onChange={(e) =>
                  handleProductChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>
          </div>

          {/* Variants Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Variants ({editedProduct.variants.length})
              </h3>
              <button
                onClick={addNewVariant}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Variant</span>
              </button>
            </div>

            {editedProduct.variants.length > 0 ? (
              <div className="border border-gray-200 rounded-lg">
                {/* Variant Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                  {editedProduct.variants.map((variant, index) => (
                    <button
                      key={variant._id || index}
                      onClick={() => setActiveVariantIndex(index)}
                      className={`px-4 py-3 text-sm font-medium border-r border-gray-200 whitespace-nowrap flex-shrink-0 ${
                        activeVariantIndex === index
                          ? "bg-white text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Variant {index + 1}
                      {variant.sku && ` (${variant.sku})`}
                    </button>
                  ))}
                </div>

                {/* Active Variant Details */}
                {editedProduct.variants[activeVariantIndex] && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Variant {activeVariantIndex + 1} Details
                      </h4>
                      {editedProduct.variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(activeVariantIndex)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                        >
                          Remove Variant
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={
                            editedProduct.variants[activeVariantIndex].sku || ""
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              activeVariantIndex,
                              "sku",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter SKU"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={
                            editedProduct.variants[activeVariantIndex].price ||
                            0
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              activeVariantIndex,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Discounted Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compare At Price (₹)
                        </label>
                        <input
                          type="number"
                          value={
                            editedProduct.variants[activeVariantIndex]
                              .compareAtPrice || 0
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              activeVariantIndex,
                              "discountedPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Inventory - Quantity Available */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity Available
                        </label>
                        <input
                          type="number"
                          value={
                            editedProduct.variants[activeVariantIndex].inventoryId
                              ?.quantityAvailable || 0
                          }
                          onChange={(e) =>
                            handleInventoryChange(
                              activeVariantIndex,
                              "quantityAvailable",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      {/* Inventory - Reserved */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reserved Quantity
                        </label>
                        <input
                          type="number"
                          value={
                            editedProduct.variants[activeVariantIndex].inventoryId
                              ?.reservedQuantity || 0
                          }
                          onChange={(e) =>
                            handleInventoryChange(
                              activeVariantIndex,
                              "reservedQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          placeholder="0"
                          min="0"
                          // readOnly
                        />
                      </div>

                      {/* Inventory - Sold */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sold Quantity
                        </label>
                        <input
                          type="number"
                          value={
                            editedProduct.variants[activeVariantIndex].inventory
                              ?.sold || 0
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          placeholder="0"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Variant Attributes */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Attributes (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(
                          editedProduct.variants[activeVariantIndex]
                            .attributes || {},
                          null,
                          2
                        )}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handleVariantChange(
                              activeVariantIndex,
                              "attributes",
                              parsed
                            );
                          } catch (error) {
                            // Invalid JSON, don't update
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder='{"color": "red", "size": "M"}'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter variant attributes as JSON (e.g., color, size,
                        material)
                      </p>
                    </div>

                    {/* Variant Images */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Images
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {editedProduct.variants[activeVariantIndex].images?.map(
                          (imageUrl, imageIndex) => (
                            <div key={imageIndex} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Variant ${activeVariantIndex + 1} Image ${
                                  imageIndex + 1
                                }`}
                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                              />
                              <button
                                onClick={() => {
                                  const newImages = editedProduct.variants[
                                    activeVariantIndex
                                  ].images.filter((_, i) => i !== imageIndex);
                                  handleVariantChange(
                                    activeVariantIndex,
                                    "images",
                                    newImages
                                  );
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        )}
                        <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:border-gray-400 cursor-pointer">
                          <span className="text-sm">+ Add Image</span>
                        </div>
                      </div>
                    </div>

                    {/* Variant Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Variant Summary
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(
                              editedProduct.variants[activeVariantIndex]
                                .price || 0
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Discounted:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(
                              editedProduct.variants[activeVariantIndex]
                                .compareAtPrice || 0
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Available:</span>
                          <span className="ml-2 font-medium">
                            {editedProduct.variants[activeVariantIndex]
                              .inventoryId?.quantityAvailable || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Images:</span>
                          <span className="ml-2 font-medium">
                            {editedProduct.variants[activeVariantIndex].images
                              ?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-4">No variants available</p>
                <button
                  onClick={addNewVariant}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add First Variant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default ProductEditModal;