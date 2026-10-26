import { useState, useEffect } from "react";
import { configureService } from "../../../services/configure/configureService";
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../../../firebase/FirebaseConfig";
import { 
    FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, 
    FaChevronUp, FaChevronDown, FaArrowUp, FaArrowDown, 
    FaLayerGroup, FaImage, FaBoxOpen, FaSearch, FaExternalLinkAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import StatusBadge from "../../Components/common/StatusBadge";
import { getProductStockCount, getStockBadgeProps } from "../../products/utils/productTableUtils";

function CollectionEditor({ col, products, onSave, onCancel, saving }) {
    const [form, setForm] = useState({
        title: col?.title || "",
        subtitle: col?.subtitle || "",
        productIds: col?.productIds || [],
        isActive: col?.isActive ?? true,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterMode, setFilterMode] = useState("all"); // "all" | "selected"

    const toggleProduct = (id) => {
        setForm((prev) => ({
            ...prev,
            productIds: prev.productIds.includes(id)
                ? prev.productIds.filter((p) => p !== id)
                : [...prev.productIds, id],
        }));
    };

    const removeProduct = (id) => {
        setForm((prev) => ({
            ...prev,
            productIds: prev.productIds.filter((p) => p !== id),
        }));
    };

    const moveProductInCollection = (index, direction) => {
        setForm((prev) => {
            const newIds = [...prev.productIds];
            const targetIdx = index + direction;
            if (targetIdx < 0 || targetIdx >= newIds.length) return prev;
            const temp = newIds[index];
            newIds[index] = newIds[targetIdx];
            newIds[targetIdx] = temp;
            return { ...prev, productIds: newIds };
        });
    };

    const productMap = new Map(products.map((p) => [p.id, p]));
    const selectedProductsList = form.productIds.map((id) => productMap.get(id)).filter(Boolean);
    const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()];

    const filteredProducts = products.filter((p) => {
        if (filterMode === "selected" && !form.productIds.includes(p.id)) return false;
        if (filterCategory !== "ALL" && p.category !== filterCategory) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="font-extrabold text-sm text-text-base flex items-center gap-2">
                    <FaLayerGroup className="text-primary" size={14} />
                    {col ? `Edit Collection: ${col.title}` : "Create New Collection Section"}
                </h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {form.productIds.length} Products Selected
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Form Column */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="space-y-3 bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">
                                Collection Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Section title e.g. Trending Now"
                                className="w-full h-10 px-3.5 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs sm:text-sm font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">
                                Subheading (Optional)
                            </label>
                            <input
                                value={form.subtitle}
                                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                                placeholder="e.g. Handcrafted with love"
                                className="w-full h-10 px-3.5 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs sm:text-sm font-medium transition-all"
                            />
                        </div>

                        <div className="pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-base">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                                />
                                <span>Active on Storefront</span>
                            </label>
                        </div>
                    </div>

                    {/* Added Items Sequencing */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <label className="block text-[10px] font-extrabold text-text-base uppercase tracking-wider">
                                Added Products Order ({selectedProductsList.length})
                            </label>
                            {selectedProductsList.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setForm((p) => ({ ...p, productIds: [] }))}
                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {selectedProductsList.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-border-subtle bg-bg-base/40 text-center">
                                <p className="text-xs text-text-muted font-medium">
                                    No products selected. Check items in the catalog on the right.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5 border border-border-subtle rounded-xl bg-bg-base/30 p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border-subtle [&::-webkit-scrollbar-thumb]:rounded-full">
                                {selectedProductsList.map((p, idx) => {
                                    const img = p.imageUrl || p.images?.[0] || "";
                                    return (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between gap-2 p-2 bg-card rounded-lg border border-border-subtle shadow-2xs text-xs"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[10px] font-mono font-bold text-text-muted w-4 shrink-0 text-center">
                                                    #{idx + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-md bg-bg-base border border-border-subtle/50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                                    {img ? (
                                                        <img src={img} alt={p.title} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <FaImage size={12} className="text-text-subtle" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-text-base truncate max-w-[130px] sm:max-w-[180px]">{p.title}</p>
                                                    <p className="text-[10px] text-text-muted font-medium">₹{p.price || p.minPrice || 0}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => moveProductInCollection(idx, -1)}
                                                    disabled={idx === 0}
                                                    className="w-5 h-5 flex items-center justify-center rounded border border-border-subtle bg-bg-base hover:bg-card-hover disabled:opacity-25 cursor-pointer text-text-muted hover:text-primary transition"
                                                    title="Move Up"
                                                >
                                                    <FaArrowUp size={8} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveProductInCollection(idx, 1)}
                                                    disabled={idx === selectedProductsList.length - 1}
                                                    className="w-5 h-5 flex items-center justify-center rounded border border-border-subtle bg-bg-base hover:bg-card-hover disabled:opacity-25 cursor-pointer text-text-muted hover:text-primary transition"
                                                    title="Move Down"
                                                >
                                                    <FaArrowDown size={8} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(p.id)}
                                                    className="w-5 h-5 flex items-center justify-center rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer ml-0.5 transition"
                                                    title="Remove"
                                                >
                                                    <FaTimes size={9} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Catalog Picker Column */}
                <div className="lg:col-span-7 space-y-3 bg-bg-base/30 p-3.5 rounded-xl border border-border-subtle">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">
                            Catalog Product Picker
                        </label>

                        {/* Filter Mode Tabs */}
                        <div className="flex gap-1 bg-bg-base border border-border-subtle rounded-lg p-0.5 self-stretch sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setFilterMode("all")}
                                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    filterMode === "all"
                                        ? "bg-primary text-compli font-bold shadow-xs"
                                        : "text-text-muted hover:text-text-base"
                                }`}
                            >
                                All ({products.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode("selected")}
                                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    filterMode === "selected"
                                        ? "bg-primary text-compli font-bold shadow-xs"
                                        : "text-text-muted hover:text-text-base"
                                }`}
                            >
                                Selected ({form.productIds.length})
                            </button>
                        </div>
                    </div>

                    {/* Search & Category Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[11px]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, brand, or category..."
                                className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="h-9 px-3 rounded-xl border border-border-subtle bg-bg-base text-xs font-semibold text-text-base focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c} className="bg-card text-text-base">{c === "ALL" ? "All Categories" : c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Products Checklist */}
                    <div className="max-h-[360px] overflow-y-auto border border-border-subtle rounded-xl bg-card divide-y divide-border-subtle/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border-subtle [&::-webkit-scrollbar-thumb]:rounded-full">
                        {filteredProducts.map((p) => {
                            const isChecked = form.productIds.includes(p.id);
                            const img = p.imageUrl || p.images?.[0] || "";
                            return (
                                <label
                                    key={p.id}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 hover:bg-card-hover cursor-pointer transition-colors ${
                                        isChecked ? "bg-primary/10 border-l-3 border-l-primary" : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleProduct(p.id)}
                                        className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                                    />
                                    <div className="w-9 h-9 rounded-lg bg-bg-base border border-border-subtle/50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                        {img ? (
                                            <img src={img} alt={p.title} className="w-full h-full object-contain" />
                                        ) : (
                                            <FaImage size={12} className="text-text-subtle" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-text-base truncate block">{p.title}</span>
                                        <span className="text-[10px] text-text-muted font-medium">
                                            ₹{p.price || p.minPrice || 0} {p.brand ? `• ${p.brand}` : ""}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted bg-bg-surface border border-border-subtle/50 px-2 py-0.5 rounded-full font-bold shrink-0">
                                        {p.category || "General"}
                                    </span>
                                </label>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <p className="p-6 text-xs text-text-muted text-center font-semibold">
                                {searchQuery ? "No products matching your search." : "No products available."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-border-subtle/50">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-9 px-4 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-muted font-bold text-xs transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onSave(form)}
                    disabled={saving || !form.title.trim()}
                    className="h-9 px-4 rounded-xl bg-primary text-compli font-bold text-xs hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                    <FaCheck size={11} />
                    <span>{saving ? "Saving..." : "Save Collection"}</span>
                </button>
            </div>
        </div>
    );
}

export default function CollectionsTab() {
    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [productSearch, setProductSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [editing, setEditing] = useState(null); // collectionId | "new"
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        Promise.all([
            configureService.getCollections(),
            getDocs(collection(fireDB, "products")).then((snap) =>
                snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            ),
        ]).then(([cols, prods]) => {
            const sortedCols = [...cols].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
            setCollections(sortedCols);
            setProducts(prods);
            if (sortedCols.length > 0) {
                setSelectedCollectionId(sortedCols[0].collectionId || sortedCols[0].id);
            }
        }).catch(() => toast.error("Failed to load collections"))
          .finally(() => setLoading(false));
    }, []);

    const productMap = new Map(products.map((p) => [p.id, p]));

    const activeSelectedCollection = collections.find(
        (c) => (c.collectionId || c.id) === selectedCollectionId
    ) || collections[0] || null;

    const activeCollectionProducts = (activeSelectedCollection?.productIds || [])
        .map((id) => productMap.get(id))
        .filter(Boolean);

    const filteredActiveProducts = activeCollectionProducts.filter((p) => {
        if (!productSearch.trim()) return true;
        const q = productSearch.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    });

    const handleSaveNew = async (form) => {
        setSaving(true);
        try {
            const created = await configureService.addCollection({ ...form, order: collections.length });
            setCollections((prev) => [...prev, created]);
            setSelectedCollectionId(created.collectionId || created.id);
            setEditing(null);
            toast.success("Collection created successfully!");
        } catch (err) {
            toast.error("Failed to create collection");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async (collectionId, form) => {
        setSaving(true);
        try {
            await configureService.updateCollection(collectionId, form);
            setCollections((prev) =>
                prev.map((c) => ((c.collectionId || c.id) === collectionId ? { ...c, ...form } : c))
            );
            setEditing(null);
            toast.success("Collection updated successfully!");
        } catch (err) {
            toast.error("Failed to update collection");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (col) => {
        const id = col.collectionId || col.id;
        if (!window.confirm(`Are you sure you want to delete collection "${col.title}"?`)) return;
        setDeleting(id);
        try {
            await configureService.deleteCollection(id);
            const remaining = collections.filter((c) => (c.collectionId || c.id) !== id);
            setCollections(remaining);
            if (selectedCollectionId === id) {
                setSelectedCollectionId(remaining[0] ? (remaining[0].collectionId || remaining[0].id) : null);
            }
            toast.success("Collection deleted");
        } catch (err) {
            toast.error("Failed to delete collection");
        } finally {
            setDeleting(null);
        }
    };

    const handleRemoveProductFromCollection = async (productId) => {
        if (!activeSelectedCollection) return;
        const colId = activeSelectedCollection.collectionId || activeSelectedCollection.id;
        const updatedProductIds = (activeSelectedCollection.productIds || []).filter((id) => id !== productId);
        try {
            await configureService.updateCollection(colId, {
                productIds: updatedProductIds,
            });
            setCollections((prev) =>
                prev.map((c) =>
                    (c.collectionId || c.id) === colId
                        ? { ...c, productIds: updatedProductIds }
                        : c
                )
            );
            toast.success("Product removed from collection");
        } catch (err) {
            toast.error("Failed to remove product");
        }
    };

    const handleMoveCollection = async (index, direction) => {
        const targetIdx = index + direction;
        if (targetIdx < 0 || targetIdx >= collections.length || reordering) return;

        const newCollections = [...collections];
        const [movedCol] = newCollections.splice(index, 1);
        newCollections.splice(targetIdx, 0, movedCol);

        setCollections(newCollections);
        setReordering(true);

        try {
            await configureService.updateCollectionOrders(newCollections);
            toast.success(`Moved "${movedCol.title}" ${direction === -1 ? 'up' : 'down'}`);
        } catch (err) {
            console.error("Failed to reorder collections:", err);
            toast.error("Failed to save collection order");
            setCollections(collections);
        } finally {
            setReordering(false);
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-text-muted text-xs font-bold">Loading collections...</div>;
    }

    return (
        <div className="space-y-5">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                    <h3 className="font-extrabold text-base text-text-base flex items-center gap-2">
                        <FaLayerGroup className="text-primary" size={16} />
                        Home Page Collections Management
                    </h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                        Each collection displays as an interactive showcase section on the customer storefront.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-muted bg-bg-base px-3 py-1 rounded-full border border-border-subtle">
                        {collections.length} Section{collections.length !== 1 ? "s" : ""} Configured
                    </span>
                </div>
            </div>

            {/* Active Editor Mode */}
            {editing !== null ? (
                <CollectionEditor
                    col={editing === "new" ? null : collections.find((c) => (c.collectionId || c.id) === editing)}
                    products={products}
                    onSave={(form) => (editing === "new" ? handleSaveNew(form) : handleSaveEdit(editing, form))}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                />
            ) : (
                /* Master-Detail 2-Column Responsive Layout */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Collections List */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-extrabold text-text-base uppercase tracking-wider">
                                Collections
                            </span>
                            <span className="text-[10px] text-text-muted font-semibold">
                                Select to inspect
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {collections.map((col, idx) => {
                                const colId = col.collectionId || col.id;
                                const isSelected = colId === (activeSelectedCollection?.collectionId || activeSelectedCollection?.id);
                                const colProducts = (col.productIds || []).map((id) => productMap.get(id)).filter(Boolean);
                                const previewThumbnails = colProducts.slice(0, 4);
                                const remainingCount = colProducts.length - previewThumbnails.length;

                                return (
                                    <div
                                        key={colId || idx}
                                        onClick={() => setSelectedCollectionId(colId)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                                            isSelected
                                                ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                                                : "bg-bg-surface border-border-subtle hover:border-primary/40 shadow-2xs"
                                        }`}
                                    >
                                        {/* Header Row: Reorder + Title + Status + Action Buttons */}
                                        <div className="flex items-center justify-between gap-2.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {/* Reorder Buttons */}
                                                <div
                                                    className="flex flex-col gap-0.5 shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveCollection(idx, -1)}
                                                        disabled={idx === 0 || reordering}
                                                        className="w-5 h-4 rounded bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-card-hover disabled:opacity-25 cursor-pointer transition"
                                                        title="Move Up"
                                                    >
                                                        <FaChevronUp size={7} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveCollection(idx, 1)}
                                                        disabled={idx === collections.length - 1 || reordering}
                                                        className="w-5 h-4 rounded bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-card-hover disabled:opacity-25 cursor-pointer transition"
                                                        title="Move Down"
                                                    >
                                                        <FaChevronDown size={7} />
                                                    </button>
                                                </div>

                                                {/* Order Badge & Title */}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                            #{idx + 1}
                                                        </span>
                                                        <p className="font-extrabold text-text-base text-xs sm:text-sm truncate">{col.title}</p>
                                                    </div>
                                                    {col.subtitle && (
                                                        <p className="text-[10px] text-text-muted truncate mt-0.5">{col.subtitle}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8.5px] font-bold border ${
                                                    col.isActive
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-bg-base text-text-muted border-border-subtle"
                                                }`}>
                                                    {col.isActive ? "Active" : "Hidden"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(colId)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-card border border-border-subtle hover:bg-card-hover text-primary transition shadow-2xs cursor-pointer"
                                                    title="Edit Collection"
                                                >
                                                    <FaEdit size={10} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(col)}
                                                    disabled={deleting === colId}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-card border border-border-subtle hover:bg-rose-500/20 text-rose-400 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                                                    title="Delete Collection"
                                                >
                                                    <FaTrash size={9} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Thumbnail Mini Preview Stack */}
                                        <div className="pt-1.5 border-t border-border-subtle/50 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-text-muted">
                                                    {colProducts.length} item{colProducts.length !== 1 ? "s" : ""}:
                                                </span>
                                                <div className="flex items-center -space-x-1 overflow-hidden">
                                                    {previewThumbnails.map((p, pIdx) => {
                                                        const img = p.imageUrl || p.images?.[0] || "";
                                                        return (
                                                            <div
                                                                key={p.id || pIdx}
                                                                className="w-6 h-6 rounded-md bg-card border border-border-subtle p-0.5 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center"
                                                                title={p.title}
                                                            >
                                                                {img ? (
                                                                    <img src={img} alt={p.title} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-bg-base flex items-center justify-center">
                                                                        <FaImage size={8} className="text-text-subtle" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {remainingCount > 0 && (
                                                        <span className="h-6 px-1.5 rounded-md bg-bg-base border border-border-subtle text-[9px] font-bold text-text-muted flex items-center justify-center shrink-0">
                                                            +{remainingCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <span className="text-[9.5px] font-bold text-primary">
                                                    ● Selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Button */}
                        <button
                            type="button"
                            onClick={() => setEditing("new")}
                            className="w-full py-3 border-2 border-dashed border-border-subtle rounded-2xl text-xs font-extrabold text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <FaPlus size={11} /> Add New Collection Section
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Table View of Products in Selected Collection */}
                    <div className="lg:col-span-8 bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                        {activeSelectedCollection ? (
                            <>
                                {/* Header Details */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-sm sm:text-base text-text-base truncate">
                                                {activeSelectedCollection.title}
                                            </h4>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                {activeCollectionProducts.length} Products
                                            </span>
                                        </div>
                                        {activeSelectedCollection.subtitle && (
                                            <p className="text-xs text-text-muted mt-0.5 truncate">
                                                {activeSelectedCollection.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setEditing(activeSelectedCollection.collectionId || activeSelectedCollection.id)}
                                            className="h-8 px-3 rounded-xl bg-primary text-compli text-xs font-bold hover:bg-primary-hover transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <FaEdit size={11} />
                                            <span>Edit Collection</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Search within this collection */}
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[11px]" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder={`Search within ${activeSelectedCollection.title}...`}
                                        className="w-full pl-8 pr-3 h-8.5 text-xs rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary transition"
                                    />
                                </div>

                                {/* PRODUCTS DATA TABLE */}
                                {filteredActiveProducts.length === 0 ? (
                                    <div className="p-8 text-center rounded-xl border border-dashed border-border-subtle bg-bg-base/20 space-y-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                            <FaBoxOpen size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-text-base">
                                            {productSearch ? "No products matching search" : "No products in this collection"}
                                        </p>
                                        <p className="text-[11px] text-text-muted max-w-xs mx-auto">
                                            Click "Edit Collection" above to add products from your catalog.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-card">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-border-subtle bg-bg-base text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                                    <th className="py-2.5 px-3 text-center w-12">#</th>
                                                    <th className="py-2.5 px-2 text-center w-14">Image</th>
                                                    <th className="py-2.5 px-3">Product Title</th>
                                                    <th className="py-2.5 px-3 hidden sm:table-cell">Category</th>
                                                    <th className="py-2.5 px-3 font-extrabold text-text-base">Price</th>
                                                    <th className="py-2.5 px-3 text-center hidden md:table-cell">Stock</th>
                                                    <th className="py-2.5 px-3 text-center hidden sm:table-cell">Status</th>
                                                    <th className="py-2.5 px-3 text-center w-20">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-subtle">
                                                {filteredActiveProducts.map((item, pIdx) => {
                                                    const img = item.imageUrl || item.images?.[0] || "";
                                                    const stockCount = getProductStockCount(item);
                                                    const badgeProps = getStockBadgeProps(stockCount);
                                                    const isLive = item.isActive !== false;

                                                    return (
                                                        <tr key={item.id || pIdx} className="hover:bg-card-hover transition-colors">
                                                            {/* S.No */}
                                                            <td className="py-2.5 px-3 text-center font-bold text-text-muted text-[11px]">
                                                                {pIdx + 1}
                                                            </td>

                                                            {/* Image */}
                                                            <td className="py-2.5 px-2 text-center">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-subtle bg-bg-base flex items-center justify-center mx-auto p-0.5">
                                                                    {img ? (
                                                                        <img src={img} alt={item.title} className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        <FaImage size={14} className="text-text-subtle" />
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Title & Brand */}
                                                            <td className="py-2.5 px-3 min-w-[140px] max-w-[220px]">
                                                                <div className="font-bold text-text-base text-xs truncate" title={item.title}>
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-[10px] text-text-muted uppercase tracking-wider font-normal">
                                                                    {item.brand || "No Brand"}
                                                                </div>
                                                            </td>

                                                            {/* Category */}
                                                            <td className="py-2.5 px-3 text-text-muted text-xs hidden sm:table-cell">
                                                                {item.category || "General"}
                                                            </td>

                                                            {/* Price */}
                                                            <td className="py-2.5 px-3 font-extrabold text-text-base text-xs whitespace-nowrap">
                                                                ₹{Number(item.price || item.minPrice || 0).toLocaleString("en-IN")}
                                                            </td>

                                                            {/* Stock Status Badge */}
                                                            <td className="py-2.5 px-3 text-center hidden md:table-cell">
                                                                <StatusBadge {...badgeProps} size="sm" />
                                                            </td>

                                                            {/* Status */}
                                                            <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                                                                <StatusBadge
                                                                    status={isLive ? "LIVE" : "DRAFT"}
                                                                    label={isLive ? "Live" : "Draft"}
                                                                    size="sm"
                                                                />
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="py-2.5 px-3 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Link
                                                                        to={`/productdetails/${item.id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition cursor-pointer"
                                                                        title="View Product Page"
                                                                    >
                                                                        <FaExternalLinkAlt size={11} />
                                                                    </Link>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveProductFromCollection(item.id)}
                                                                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                                                                        title="Remove from this collection"
                                                                    >
                                                                        <FaTrash size={11} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-8 text-center text-text-muted text-xs font-semibold">
                                Select or create a collection to inspect its products table.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
