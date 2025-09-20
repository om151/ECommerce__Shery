import React from "react";
import { useAdmin } from "../../../store/Hooks/Admin/useAdmin.js";
import VarientList from "./VarientList.jsx";
import AddVarientForm from "./AddVarientForm.jsx";
import EditProductInfo from "./EditProductInfo.jsx";
import EditVarientForm from "./EditVarientForm.jsx";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const { updateProduct, addVariantToProduct, editVariant, deleteVariant } =
    useAdmin();
  const [editedProduct, setEditedProduct] = React.useState({
    title: product.title || "",
    description: product.description || "",
    categories: product.categories || [],
    brand: product.attributes.brand || "",
    searchKeywords: product.searchKeywords || "",
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [variantOpLoading, setVariantOpLoading] = React.useState(false);
  const [variantOpError, setVariantOpError] = React.useState(null);
  const [variants, setVariants] = React.useState(product.variants || []);
  const [newVariant, setNewVariant] = React.useState({
    name: "",
    color: "",
    size: "",
    price: "",
    compareAtPrice: "",
    quantityAvailable: "",
    images: [],
  });
  const [editingVariantId, setEditingVariantId] = React.useState(null);
  const [editingVariant, setEditingVariant] = React.useState({});

  const handleProductChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handelVariantDelete = async (v) => {
    setVariantOpError(null);
    setVariantOpLoading(true);
    try {
      await deleteVariant(v._id);
      setVariants((prev) => prev.filter((x) => x._id !== v._id));
    } catch (e) {
      setVariantOpError(e.message || "Failed to delete variant");
    } finally {
      setVariantOpLoading(false);
    }
  };

  const handelEditVarient = async () => {
    setVariantOpError(null);
    setVariantOpLoading(true);
    try {
      const payload = {
        name: editingVariant.name,
        price:
          editingVariant.price === ""
            ? undefined
            : Number(editingVariant.price),
        compareAtPrice:
          editingVariant.compareAtPrice === ""
            ? undefined
            : Number(editingVariant.compareAtPrice),
        color: editingVariant.color,
        size: editingVariant.size,
        images: editingVariant.images,
        quantityAvailable:
          editingVariant.quantityAvailable === ""
            ? undefined
            : Number(editingVariant.quantityAvailable),
      };
      const updated = await editVariant(editingVariantId, payload);
      // optimistic local update; backend may return full variant
      setVariants((prev) =>
        prev.map((x) =>
          x._id === editingVariantId
            ? {
                ...x,
                name: payload.name ?? x.name,
                price: payload.price ?? x.price,
                compareAtPrice: payload.compareAtPrice ?? x.compareAtPrice,
                attributes: {
                  ...(x.attributes || {}),
                  color: payload.color,
                  size: payload.size,
                },
              }
            : x
        )
      );
      setEditingVariantId(null);
      setEditingVariant({});
    } catch (e) {
      setVariantOpError(e.message || "Failed to edit variant");
    } finally {
      setVariantOpLoading(false);
    }
  };

  const handelVarientAdd = async () => {
    setVariantOpError(null);
    setVariantOpLoading(true);
    try {
      const payload = {
        name: newVariant.name,
        price: newVariant.price === "" ? undefined : Number(newVariant.price),
        compareAtPrice:
          newVariant.compareAtPrice === ""
            ? undefined
            : Number(newVariant.compareAtPrice),
        color: newVariant.color,
        size: newVariant.size,
        quantityAvailable:
          newVariant.quantityAvailable === ""
            ? undefined
            : Number(newVariant.quantityAvailable),
        images: newVariant.images,
      };
      const created = await addVariantToProduct(product._id, payload);
      // optimistic add; backend returns created variant
      setVariants((prev) => [
        created?.payload?.variant || created || payload,
        ...prev,
      ]);
      setNewVariant({
        name: "",
        color: "",
        size: "",
        price: "",
        compareAtPrice: "",
        quantityAvailable: "",
        images: [],
      });
    } catch (e) {
      setVariantOpError(e.message || "Failed to add variant");
    } finally {
      setVariantOpLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        title: editedProduct.title,
        description: editedProduct.description,
        categories: editedProduct.categories,
       attributes:{
         brand: editedProduct.brand,
       },
        searchKeywords: editedProduct.searchKeywords,
      };
      await updateProduct(product._id, payload);
      onSave();
    } catch (error) {
      console.error("Failed to save product:", error);
      setSaveError(error.message || "Failed to save product changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}

        {/* Product Edit Start */}
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
          <EditProductInfo
            editedProduct={editedProduct}
            handleProductChange={handleProductChange}
          />
          {/* Variants Management */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Variants</h3>
              {variantOpLoading && (
                <span className="text-sm text-gray-500">Processing…</span>
              )}
            </div>
            {variantOpError && (
              <div className="mb-3 p-3 border border-red-200 bg-red-50 rounded text-sm text-red-700">
                {variantOpError}
              </div>
            )}

            {/* Existing Variants List */}
            <VarientList
              setEditingVariantId={setEditingVariantId}
              setEditingVariant={setEditingVariant}
              handelVariantDelete={handelVariantDelete}
              variants={variants}
            />

            {/* Edit Variant Inline Form */}
            {editingVariantId && (
              <EditVarientForm
                setEditingVariantId={setEditingVariantId}
                setEditingVariant={setEditingVariant}
                editingVariant={editingVariant}
                handelEditVarient={handelEditVarient}
              />
            )}

            {/* Add Variant Form */}
            <AddVarientForm
              newVariant={newVariant}
              setNewVariant={setNewVariant}
              handelVarientAdd={handelVarientAdd}
            />
          </div>
          <div className="h-16"></div>
          {/* Spacer to avoid content being hidden behind footer */}
        </div>
        {/* Product Edit End */}
      </div>
    </div>
  );
};

export default ProductEditModal;
