import React from 'react'

const VarientList = ({setEditingVariantId, setEditingVariant, handelVariantDelete, variants}) => {
  return (
    <div className="space-y-3">
              {variants?.length ? (
                variants.map((v) => (
                  <div
                    key={v._id}
                    className="p-3 border rounded-md flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {v.name || v.sku || `Variant ${v._id?.slice(-4)}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {v.attributes?.color || "-"} /{" "}
                        {v.attributes?.size || "-"} · ₹{v.price ?? "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        onClick={() => {
                          console.log(v);
                          setEditingVariantId(v._id);
                          setEditingVariant({
                            name: v.name || "",
                            color: v.attributes?.color || "",
                            size: v.attributes?.size || "",
                            price: v.price ?? "",
                            compareAtPrice: v.compareAtPrice ?? "",
                            images: [],
                            quantityAvailable: v.inventoryId.quantityAvailable ?? "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={() => handelVariantDelete(v)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No variants yet.</p>
              )}
            </div>
  )
}

export default VarientList
