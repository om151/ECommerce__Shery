import React from "react";
import { useAdmin } from "../../../store/Hooks/Admin/useAdmin.js";

const genTempId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const emptyVariant = () => ({
  tempId: genTempId(),
  name: "",
  color: "",
  size: "",
  price: "",
  compareAtPrice: "",
  quantityAvailable: "",
  imagesFiles: null,
});

const CreateProductModal = ({ onClose, onCreated }) => {
  const { createProduct } = useAdmin();

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    categoriesInput: "", // comma-separated
    brand: "",
    searchKeywordsInput: "", // comma-separated
    variants: [emptyVariant()],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const updateField = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));
  const updateVariant = (idx, patch) =>
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));
  const addVariant = () =>
    setForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }));
  const removeVariant = (idx) =>
    setForm((p) => ({
      ...p,
      variants: p.variants.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const categories = form.categoriesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const searchKeywords = form.searchKeywordsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!form.title || !form.description || !form.brand) {
        throw new Error("Title, description, and brand are required");
      }
      if (categories.length === 0)
        throw new Error("At least one category is required");
      if (searchKeywords.length === 0)
        throw new Error("At least one search keyword is required");
      if (form.variants.length === 0)
        throw new Error("Add at least one variant");

      const variants = form.variants.map((v) => ({
        tempId: v.tempId,
        name: v.name,
        color: v.color,
        size: v.size,
        price: v.price === "" ? undefined : Number(v.price),
        compareAtPrice:
          v.compareAtPrice === "" ? undefined : Number(v.compareAtPrice),
        quantityAvailable:
          v.quantityAvailable === "" ? undefined : Number(v.quantityAvailable),
        imagesFiles: v.imagesFiles,
      }));

      const payload = {
        title: form.title,
        description: form.description,
        categories,
        brand: form.brand,
        searchKeywords,
        variants,
      };

      const created = await createProduct(payload);
      if (onCreated) onCreated(created);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Product</h2>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
            <button className="px-4 py-2 border rounded" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {error && (
          <div className="m-6 p-3 border border-red-200 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Product fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Product title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Product description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Categories
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.categoriesInput}
                onChange={(e) => updateField("categoriesInput", e.target.value)}
                placeholder="e.g. men, shoes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="e.g. Nike"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Search Keywords
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.searchKeywordsInput}
                onChange={(e) =>
                  updateField("searchKeywordsInput", e.target.value)
                }
                placeholder="e.g. running, sport"
              />
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Variants ({form.variants.length})
              </h3>
              <button className="px-3 py-1 border rounded" onClick={addVariant}>
                Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {form.variants.map((v, idx) => (
                <div key={v.tempId} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">Variant {idx + 1}</h4>
                    {form.variants.length > 1 && (
                      <button
                        className="text-red-600 text-sm"
                        onClick={() => removeVariant(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Name"
                      value={v.name}
                      onChange={(e) =>
                        updateVariant(idx, { name: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Color"
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(idx, { color: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Size"
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(idx, { size: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Price"
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(idx, { price: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Compare At Price"
                      type="number"
                      value={v.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(idx, { compareAtPrice: e.target.value })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Quantity Available"
                      type="number"
                      value={v.quantityAvailable}
                      onChange={(e) =>
                        updateVariant(idx, {
                          quantityAvailable: e.target.value,
                        })
                      }
                    />
                    <input
                      className="border rounded px-2 py-1 md:col-span-3"
                      type="file"
                      
                      onChange={(e) =>
                        updateVariant(idx, {
                          imagesFiles: e.target.files || null,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
