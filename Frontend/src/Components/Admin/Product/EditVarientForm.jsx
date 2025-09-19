import React from 'react'

const EditVarientForm = ({setEditingVariantId, setEditingVariant, editingVariant, handelEditVarient}) => {
  return (
    
              <div className="mt-4 p-4 border rounded-md">
                <h4 className="text-sm font-semibold mb-3">Edit Variant</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Name"
                    value={editingVariant.name}
                    onChange={(e) =>
                      setEditingVariant((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Color"
                    value={editingVariant.color}
                    onChange={(e) =>
                      setEditingVariant((p) => ({
                        ...p,
                        color: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Size"
                    value={editingVariant.size}
                    onChange={(e) =>
                      setEditingVariant((p) => ({ ...p, size: e.target.value }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Price"
                    type="number"
                    value={editingVariant.price}
                    onChange={(e) =>
                      setEditingVariant((p) => ({
                        ...p,
                        price: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Compare At Price"
                    type="number"
                    value={editingVariant.compareAtPrice}
                    onChange={(e) =>
                      setEditingVariant((p) => ({
                        ...p,
                        compareAtPrice: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Quantity Available"
                    type="number"
                    value={editingVariant.quantityAvailable}
                    onChange={(e) =>
                      setEditingVariant((p) => ({
                        ...p,
                        quantityAvailable: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1"
                    type="file"
                    multiple
                    onChange={(e) =>
                      setEditingVariant((p) => ({
                        ...p,
                        images: Array.from(e.target.files || []),
                      }))
                    }
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handelEditVarient}
                  >
                    Save Variant
                  </button>
                  <button
                    className="px-4 py-2 border rounded"
                    onClick={() => {
                      setEditingVariantId(null);
                      setEditingVariant({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
  )
}

export default EditVarientForm
