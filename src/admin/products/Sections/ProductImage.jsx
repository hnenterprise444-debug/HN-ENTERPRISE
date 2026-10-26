import React, { useState } from "react";
import { FaCloudUploadAlt, FaTrash, FaCheck, FaImages } from "react-icons/fa";
import MediaLibraryModal from "../../../components/modal/MediaLibraryModal.jsx";

function ProductImages({
    products,
    setProducts,
    uploading,
    uploadProgress,
    handleImageUpload,
    handleImageDelete
}) {
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const handleSelectFromLibrary = (selectedUrls) => {
        if (!selectedUrls) return;
        const urls = (Array.isArray(selectedUrls) ? selectedUrls : [selectedUrls])
            .flat(Infinity)
            .filter(u => typeof u === 'string' && u.trim() !== '');
        if (urls.length === 0) return;

        const currentImages = (Array.isArray(products.images) ? products.images : [])
            .flat(Infinity)
            .filter(u => typeof u === 'string' && u.trim() !== '');

        const newImages = Array.from(new Set([...currentImages, ...urls]));
        setProducts({
            ...products,
            imageUrl: products.imageUrl || newImages[0] || '',
            images: newImages
        });
    };

    return (
        <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">

            {/* Section 1 Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-base/30">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-compli font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                        1
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base">
                            Product Media
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Upload high resolution product gallery images or choose from previously uploaded media.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-3 py-1 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer active:scale-95"
                    >
                        <FaImages size={12} />
                        Select from Media Library
                    </button>

                    {products.images?.length > 0 && (
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                            {products.images.length} Images
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 flex flex-col md:flex-row gap-6">

                {/* Upload Area */}
                <div className="flex-1 relative border-2 border-dashed border-border-subtle hover:border-primary transition-all duration-300 rounded-xl bg-bg-base hover:bg-primary/5 flex items-center justify-center p-4">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                        <FaCloudUploadAlt
                            className="text-primary mb-2"
                            size={32}
                        />
                        <h3 className="font-bold text-text-base text-xs">
                            Drag & Drop Images
                        </h3>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            or click anywhere to browse local files
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="px-3 py-1 rounded bg-primary text-compli text-[10px] font-semibold">
                                Browse Disk
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMediaModalOpen(true);
                                }}
                                className="px-3 py-1 rounded bg-bg-surface border border-border-subtle hover:border-primary text-text-base text-[10px] font-bold flex items-center gap-1 cursor-pointer pointer-events-auto relative z-20"
                            >
                                <FaImages size={10} /> Library
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Preview and Gallery */}
                <div className="flex-[2] flex flex-col justify-between gap-4">

                    {/* Upload Progress */}
                    {uploading && (
                        <div>
                            <div className="flex justify-between mb-1 text-[10px]">
                                <span className="font-semibold text-primary">Uploading...</span>
                                <span className="font-bold">{uploadProgress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-start">

                        {/* Primary Image preview */}
                        {products.imageUrl && (
                            <div>
                                <h4 className="font-bold mb-1 text-[10px] uppercase text-text-muted">Primary Image</h4>
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-primary bg-bg-base flex items-center justify-center">
                                    <img
                                        src={products.imageUrl}
                                        alt="Primary"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Gallery List */}
                        {products.images?.length > 0 && (
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="font-bold mb-1 text-[10px] uppercase text-text-muted">Gallery (Click to set primary)</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {products.images.map((url, index) => {
                                        const isPrimary = products.imageUrl === url;
                                        return (
                                            <div
                                                key={index}
                                                className="relative group rounded-lg overflow-hidden border border-border-subtle bg-bg-base aspect-square flex items-center justify-center"
                                            >
                                                <img
                                                    src={url}
                                                    alt=""
                                                    onClick={() =>
                                                        setProducts(prev => ({
                                                            ...prev,
                                                            imageUrl: url
                                                        }))
                                                    }
                                                    className={`w-full h-full object-cover cursor-pointer transition-all duration-300
                                                    ${isPrimary ? "ring-2 ring-primary" : "hover:scale-105"}`}
                                                />
                                                {isPrimary && (
                                                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary text-compli flex items-center justify-center text-[8px]">
                                                        <FaCheck />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageDelete(index)}
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 text-white rounded p-0.5 text-[8px]"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectImages={handleSelectFromLibrary}
                multiple={true}
            />
        </div>
    );
}

export default ProductImages;