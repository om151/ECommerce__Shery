import React from 'react'

const AddVarientForm = ({ newVariant, setNewVariant, handelVarientAdd }) => {
  return (
    <div className="mt-6 p-4 border rounded-md">
              <h4 className="text-sm font-semibold mb-3">Add Variant</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Name"
                  value={newVariant.name}
                  onChange={(e) =>
                    setNewVariant((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Color"
                  value={newVariant.color}
                  onChange={(e) =>
                    setNewVariant((p) => ({ ...p, color: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Size"
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant((p) => ({ ...p, size: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Price"
                  type="number"
                  value={newVariant.price}
                  onChange={(e) =>
                    setNewVariant((p) => ({ ...p, price: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Compare At Price"
                  type="number"
                  value={newVariant.compareAtPrice}
                  onChange={(e) =>
                    setNewVariant((p) => ({
                      ...p,
                      compareAtPrice: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Quantity Available"
                  type="number"
                  value={newVariant.quantityAvailable}
                  onChange={(e) =>
                    setNewVariant((p) => ({
                      ...p,
                      quantityAvailable: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  type="file"
                  onChange={(e) =>
                    setNewVariant((p) => ({
                      ...p,
                      images: Array.from(e.target.files || []),
                    }))
                  }
                />
              </div>
              <div className="mt-3">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handelVarientAdd}
                >
                  Add Variant
                </button>
              </div>
            </div>
  )
}

export default AddVarientForm
