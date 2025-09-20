import httpClient from "../http.js";

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/product", {
      params: {
        page,
        limit,
        // Admin should see all products, including out-of-stock
        // Don't pass inStock parameter so backend returns all products
      },
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
      for (const file of variantData.images) {
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

// --- Product APIs ---

// Create product with variants and images
export const createProductWithVariants = async (product) => {
  try {
    const form = new FormData();
    if (product.title) form.append("title", product.title);
    if (product.description) form.append("description", product.description);
    if (Array.isArray(product.categories)) {
      form.append("categories", JSON.stringify(product.categories));
    }
    // attributes.brand is required by validation
    if (product.brand) {
      form.append("attributes", JSON.stringify({ brand: product.brand }));
    }
    if (Array.isArray(product.searchKeywords)) {
      form.append("searchKeywords", JSON.stringify(product.searchKeywords));
    }

    // Variants: send minimal info expected by backend + tempId to map images
    const now = Date.now();
    const preparedVariants = (product.variants || []).map((v, idx) => ({
      tempId: v.tempId ?? `tmp_${idx}_${now}`,
      name: v.name,
      attributes: { color: v.color || "", size: v.size || "" },
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      quantityAvailable: v.quantityAvailable,
    }));
    form.append("variants", JSON.stringify(preparedVariants));

    // Images: append under field names images_<tempId> so backend can map reliably
    (product.variants || []).forEach((v, idx) => {
      const tmpId = preparedVariants[idx]?.tempId;
      if (!tmpId) return;
      const filesLike = v.imagesFiles;
      if (!filesLike) return;
      const files = Array.isArray(filesLike)
        ? filesLike
        : typeof filesLike.length === "number"
        ? Array.from(filesLike)
        : [];
      for (const file of files) {
        if (file) form.append(`images_${tmpId}`, file);
      }
    });

    const response = await httpClient.post(`/product/add`, form);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete product by id
export const deleteProduct = async (productId) => {
  try {
    const response = await httpClient.delete(`/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
