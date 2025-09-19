import React from "react";

const defaultCoupon = {
  code: "",
  name: "",
  description: "",
  discountType: "percentage", // percentage | fixed | free_shipping
  maxDiscount: 0,
  minOrderValue: 0,
  usageLimit: 0,
  validFrom: "",
  validTo: "",
  isActive: true,
};

const CouponFormModal = ({ open, onClose, onSubmit, initial = {} }) => {
  const [form, setForm] = React.useState({ ...defaultCoupon, ...initial });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setForm({ ...defaultCoupon, ...initial });
  }, []);

  if (!open) return null;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (!form.code || !form.name || !form.discountType) {
        throw new Error("Code, name, and discount type are required");
      }
      const payload = {
        ...form,
        maxDiscount:
          form.discountType === "free_shipping"
            ? 0
            : Number(form.maxDiscount || 0),
        minOrderValue: Number(form.minOrderValue || 0),
        usageLimit: Number(form.usageLimit || 0),
        validFrom: form.validFrom
          ? new Date(form.validFrom).toISOString()
          : undefined,
        validTo: form.validTo
          ? new Date(form.validTo).toISOString()
          : undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">
            {initial?._id ? "Edit Coupon" : "Create Coupon"}
          </h3>
          <button className="px-3 py-1 border rounded" onClick={onClose}>
            Close
          </button>
        </div>
        {error && (
          <div className="m-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="Code"
            value={form.code}
            onChange={(e) => update("code", e.target.value)}
            disabled={!!initial?._id}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <select
            className="border rounded px-2 py-1"
            value={form.discountType}
            onChange={(e) => update("discountType", e.target.value)}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
          {form.discountType !== "free_shipping" && (
            <input
              className="border rounded px-2 py-1"
              type="number"
              placeholder="Max Discount"
              value={form.maxDiscount}
              onChange={(e) => update("maxDiscount", e.target.value)}
            />
          )}
          <input
            className="border rounded px-2 py-1"
            type="number"
            placeholder="Min Order Value"
            value={form.minOrderValue}
            onChange={(e) => update("minOrderValue", e.target.value)}
          />
          <input
            className="border rounded px-2 py-1"
            type="number"
            placeholder="Usage Limit"
            value={form.usageLimit}
            onChange={(e) => update("usageLimit", e.target.value)}
          />
          <input
            className="border rounded px-2 py-1"
            type="datetime-local"
            placeholder="Valid From"
            value={form.validFrom}
            onChange={(e) => update("validFrom", e.target.value)}
          />
          <input
            className="border rounded px-2 py-1"
            type="datetime-local"
            placeholder="Valid To"
            value={form.validTo}
            onChange={(e) => update("validTo", e.target.value)}
          />
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            Active
          </label>
        </div>
        <div className="border-t px-4 py-3 flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleSubmit}
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponFormModal;
