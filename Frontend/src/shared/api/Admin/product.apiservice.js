import httpClient from "../http.js";

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/product", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await httpClient.put(
      `/product/edit/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLowStockProducts = async (threshold = 5) => {
  try {
    const response = await httpClient.get("/product", {
      params: { lowStock: threshold },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Variant APIs ---

// Add new variant to a product
export const addVariantToProduct = async (productId, variantData) => {
  try {
    const form = new FormData();
    if (variantData.name) form.append("name", variantData.name);
    if (variantData.attributes) {
      // Support plain color/size props too
      const attrs = {
        color: variantData.attributes.color || variantData.color || "",
        size: variantData.attributes.size || variantData.size || "",
      };
      form.append("attributes", JSON.stringify(attrs));
    } else {
      form.append(
        "attributes",
        JSON.stringify({
          color: variantData.color || "",
          size: variantData.size || "",
        })
      );
    }
    if (typeof variantData.price !== "undefined")
      form.append("price", variantData.price);
    if (typeof variantData.compareAtPrice !== "undefined")
      form.append("compareAtPrice", variantData.compareAtPrice);
    if (typeof variantData.quantityAvailable !== "undefined")
      form.append("quantityAvailable", variantData.quantityAvailable);
    

    // Images: expect File[] or undefined
    if (Array.isArray(variantData.images)) {
      
      for (const file of variantData.images ) {
        if (file) form.append("images", file);
      }
    }


    const response = await httpClient.post(
      `/product/variant/add/${productId}`,
      form
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit an existing variant
export const editVariant = async (variantId, updateData) => {
  try {
    const form = new FormData();
    if (typeof updateData.name !== "undefined")
      form.append("name", updateData.name);
    if (updateData.attributes || updateData.color || updateData.size) {
      const attrs = updateData.attributes || {};
      if (typeof updateData.color !== "undefined")
        attrs.color = updateData.color;
      if (typeof updateData.size !== "undefined") attrs.size = updateData.size;
      form.append("attributes", JSON.stringify(attrs));
    }
    if (typeof updateData.price !== "undefined")
      form.append("price", updateData.price);
    if (typeof updateData.compareAtPrice !== "undefined")
      form.append("compareAtPrice", updateData.compareAtPrice);

    if (typeof updateData.quantityAvailable !== "undefined")
      form.append("quantityAvailable", updateData.quantityAvailable);

    if (Array.isArray(updateData.images)) {
      for (const file of updateData.images) {
        if (file) form.append("images", file);
      }
    }

    const response = await httpClient.put(
      `/product/variant/edit/${variantId}`,
      form
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a variant
export const deleteVariant = async (variantId) => {
  try {
    const response = await httpClient.delete(`/product/variant/${variantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
