import React from "react";
import ProductHeader from "./Sections/ProductHeader";
import ProductImages from "./Sections/ProductImage";
import { 
    ProductBasicInfo, 
    ProductModeSection, 
    ProductPricingSection, 
    ProductContentSection 
} from "./Sections/ProductInfo";
import ProductVariants from "./Sections/ProductVariants";
import VariantTable from "./Sections/VariantTable";
import ProductActions from "./Sections/ProductAction";
import DraftRecoveryDialog from "../Components/common/DraftRecoveryDialog";

function ProductForm(props) {
    const {
        title,
        description,

        products,
        setProducts,

        uploading,
        uploadProgress,

        handleCancel,
        addProduct,

        // Draft recovery
        hasDraft,
        draftMeta,
        restoreDraft,
        discardDraft,

        handleImageUpload,
        handleImageDelete,

        handleTagsChange,

        addVariantType,
        deleteVariantType,

        handleVariantTypeNameChange,
        handleVariantTypeValuesChange,

        generateCombinations,
        addManualVariant,

        deleteVariant,
        deleteAllVariants,
        handleVariantChange,
        handleVariantImageUpload,
        handleVariantImageDelete,
        variantUploadingIndex,
    } = props;

    // Only show the draft banner when: a draft exists AND this is not an edit (no id)
    const showDraftBanner = hasDraft && !products?.id;

    return (
        <div className="space-y-6">
            {/* Top Header Action Bar & Live/Draft Status Switch */}
            <ProductHeader
                title={title || "Product Configuration"}
                description={description || "Manage product info, media, pricing, variants, and structured description content."}
                uploading={uploading}
                handleCancel={handleCancel}
                addProduct={addProduct}
                products={products}
                setProducts={setProducts}
            />

            {/* Draft Recovery Banner */}
            {showDraftBanner && (
                <DraftRecoveryDialog
                    formName="Product"
                    draftMeta={draftMeta}
                    onRestore={restoreDraft}
                    onDiscard={discardDraft}
                />
            )}

            {/* SECTION 1: Product Media */}
            <div id="section-media">
                <ProductImages
                    products={products}
                    setProducts={setProducts}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    handleImageUpload={handleImageUpload}
                    handleImageDelete={handleImageDelete}
                />
            </div>

            {/* SECTION 2: Basic Information */}
            <div id="section-basic-info">
                <ProductBasicInfo
                    products={products}
                    setProducts={setProducts}
                    handleTagsChange={handleTagsChange}
                />
            </div>

            {/* SECTION 3: Variants or Single Product */}
            <div id="section-variants-mode" className="space-y-6">
                <ProductModeSection
                    products={products}
                    setProducts={setProducts}
                />

                {products.hasVariants && (
                    <ProductVariants
                        products={products}
                        setProducts={setProducts}
                        addVariantType={addVariantType}
                        deleteVariantType={deleteVariantType}
                        handleVariantTypeNameChange={handleVariantTypeNameChange}
                        handleVariantTypeValuesChange={handleVariantTypeValuesChange}
                        generateCombinations={generateCombinations}
                        addManualVariant={addManualVariant}
                        deleteAllVariants={deleteAllVariants}
                    />
                )}
            </div>

            {/* SECTION 4: Pricing and Inventory */}
            <div id="section-pricing-inventory" className="space-y-6">
                <ProductPricingSection
                    products={products}
                    setProducts={setProducts}
                />

                {products.hasVariants && (
                    <VariantTable
                        products={products}
                        setProducts={setProducts}
                        deleteVariant={deleteVariant}
                        deleteAllVariants={deleteAllVariants}
                        handleVariantChange={handleVariantChange}
                        handleVariantImageUpload={handleVariantImageUpload}
                        handleVariantImageDelete={handleVariantImageDelete}
                        variantUploadingIndex={variantUploadingIndex}
                    />
                )}
            </div>

            {/* SECTION 5: Description / Content */}
            <div id="section-description-content">
                <ProductContentSection
                    products={products}
                    setProducts={setProducts}
                />
            </div>

            {/* Sticky Save Footer Actions */}
            <ProductActions
                uploading={uploading}
                addProduct={addProduct}
                handleCancel={handleCancel}
            />
        </div>
    );
}

export default ProductForm;