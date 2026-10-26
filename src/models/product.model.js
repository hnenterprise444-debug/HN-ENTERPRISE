/**
 * Product Data Model Schema
 * Represents single & multi-variant products in the `products` collection.
 */
export const productModel = {
  productId: "",
  title: "",
  description: "",
  category: "",
  brand: "",
  tags: [],

  // Media
  imageUrl: "",
  images: [],

  // Standalone Product Pricing & Stock (hasVariants === false)
  price: 0,
  originalPrice: 0,
  inStock: 0,

  // Multi-Variant Product Configuration (hasVariants === true)
  hasVariants: false,
  variantTypes: [
    // { name: "Color", values: ["White", "Black"] },
    // { name: "Size", values: ["S", "M", "L", "XL"] }
  ],
  variants: [
    // {
    //   variantId: "VAR_001",
    //   sku: "TSH-WHT-L",
    //   title: "White / L",
    //   attributes: { Color: "White", Size: "L" },
    //   price: 499,
    //   originalPrice: 699,
    //   inStock: 20,
    //   isActive: true,
    //   images: ["url1.jpg"]
    // }
  ],

  // Ratings & Counters
  averageRating: 0,
  ratingsCount: 0,
  totalSold: 0,

  // Visibility & State
  isActive: true,
  featured: false,

  // Timestamps
  createdAt: null,
  updatedAt: null,
};

export default productModel;