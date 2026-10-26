import React from "react";
import ProductBasicInfo from "./productInfo/ProductBasicInfo";
import ProductModeSection from "./productInfo/ProductModeSection";
import ProductPricingSection from "./productInfo/ProductPricingSection";
import ProductContentSection from "./productInfo/ProductContentSection";
export { ProductBasicInfo, ProductModeSection, ProductPricingSection, ProductContentSection };

export function ProductInfo({ products, setProducts, handleTagsChange }) {
    return (
        <div className="space-y-6 ">
            <ProductBasicInfo
                products={products}
                setProducts={setProducts}
                handleTagsChange={handleTagsChange}
            />
            <ProductModeSection
                products={products}
                setProducts={setProducts}
            />
            <ProductPricingSection
                products={products}
                setProducts={setProducts}
            />
            <ProductContentSection
                products={products}
                setProducts={setProducts}
            />
        </div>
    );
}

export default ProductInfo;