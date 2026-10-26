import React from "react";
import { FaBoxOpen, FaSave } from "react-icons/fa";
import StatusBadge from "../../Components/common/StatusBadge.jsx";
import ToggleButton from "../../../components/Common/ToggleButton.jsx";

function ProductHeader({
    title = "Add Product",
    description = "Create a new product for your catalog with images, pricing and variants.",
    uploading,
    handleCancel,
    addProduct,
    products,
    setProducts
}) {
    const isLive = products ? products.isActive !== false : true;

    return (
        <div className="">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* Left */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FaBoxOpen
                            size={24}
                            className="text-primary"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base font-black text-text-base">
                                {title}
                            </h1>

                            {/* Live / Draft Badge Indicator */}
                            {products && (
                                <StatusBadge status={isLive ? "LIVE" : "DRAFT"} size="sm" />
                            )}
                        </div>

                        <p className="text-text-muted text-xs mt-0.5">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {/* Top Status Switch Button */}
                    {products && setProducts && (
                        <div className="flex items-center justify-center px-2 pr-3 border-r border-border-subtle">
                            <ToggleButton
                                checked={isLive}
                                onChange={(checked) => setProducts({ ...products, isActive: checked })}
                                label={isLive ? "Live" : "Draft"}
                                labelPosition="side"
                                size="md"
                                color="success"
                            />
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        disabled={uploading}
                        onClick={addProduct}
                        className="px-4 py-2 text-xs rounded-xl bg-primary hover:bg-primary-hover text-compli font-extrabold shadow-md disabled:opacity-50 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                        <FaSave size={12} />
                        <span>{uploading ? "Uploading..." : "Save Product"}</span>
                    </button>
                </div>

            </div>

        </div>
    );
}

export default ProductHeader;