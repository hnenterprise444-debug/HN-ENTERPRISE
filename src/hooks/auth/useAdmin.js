import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product/productService.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { uploadService } from '../../services/upload/uploadService.js';
import { generateVariantCombinations } from '../../utils/variantUtils.js';
import { useDraftManager } from '../common/useDraftManager.js';
import { useAuth as useAuthCtx } from '../../context/AuthContext.jsx';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrorHandler.js';
import { queryKeys } from '../../utils/queryKeys.js';
import { normalizeCategoryName } from '../../utils/categoryUtils.js';

/**
 * Helper to flatten and sanitize arrays before sending to Firestore
 * Prevents "FirebaseError: Nested arrays are not supported"
 */
const sanitizeProductForFirestore = (data) => {
  if (!data || typeof data !== 'object') return data;
  const clean = { ...data };

  // ── Strip client-only fields that must NEVER go to Firestore ──────────────
  // pendingFiles is a Map of blob URL → File object — not Firestore-serializable
  delete clean.pendingFiles;
  // Remove any File / Blob objects that may have leaked into the data
  delete clean.file;
  delete clean.blob;

  // Strip any remaining Map/Set/File objects from all top-level keys
  for (const key of Object.keys(clean)) {
    const val = clean[key];
    if (val instanceof Map || val instanceof Set || val instanceof File || val instanceof Blob) {
      delete clean[key];
    }
  }

  // Flatten images array and filter out non-strings / blob URLs
  if (Array.isArray(clean.images)) {
    clean.images = clean.images.flat(Infinity).filter(img => typeof img === 'string' && img.trim() !== '' && !img.startsWith('blob:'));
  } else {
    clean.images = typeof clean.imageUrl === 'string' && clean.imageUrl && !clean.imageUrl.startsWith('blob:') ? [clean.imageUrl] : [];
  }

  // Ensure imageUrl is a non-blob string
  if (typeof clean.imageUrl !== 'string' || clean.imageUrl.startsWith('blob:')) {
    clean.imageUrl = clean.images[0] || '';
  }

  // Process tags
  if (typeof clean.tags === 'string') {
    clean.tags = clean.tags.split(',').map(t => t.trim()).filter(Boolean);
  } else if (Array.isArray(clean.tags)) {
    clean.tags = clean.tags.flat(Infinity).map(t => typeof t === 'string' ? t.trim() : String(t)).filter(Boolean);
  } else {
    clean.tags = [];
  }

  // Flatten variants and variant images, strip blob URLs
  if (Array.isArray(clean.variants)) {
    clean.variants = clean.variants.map(v => {
      if (!v || typeof v !== 'object') return v;
      const vClean = { ...v };
      if (Array.isArray(vClean.images)) {
        vClean.images = vClean.images.flat(Infinity).filter(img => typeof img === 'string' && img.trim() !== '' && !img.startsWith('blob:'));
      } else {
        vClean.images = [];
      }
      return vClean;
    });
  } else {
    clean.variants = [];
  }

  // Flatten variantTypes values
  if (Array.isArray(clean.variantTypes)) {
    clean.variantTypes = clean.variantTypes.map(vt => {
      if (!vt || typeof vt !== 'object') return vt;
      const vtClean = { ...vt };
      if (Array.isArray(vtClean.values)) {
        vtClean.values = vtClean.values.flat(Infinity).filter(val => typeof val === 'string' && val.trim() !== '');
      } else {
        vtClean.values = [];
      }
      return vtClean;
    });
  } else {
    clean.variantTypes = [];
  }

  return clean;
};

/**
 * useAdmin Hook
 * Manages admin catalog forms, product creation, updates, and deletes.
 * Supports the updated product schema with brand, tags, and images arrays.
 */
export default function useAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthCtx();
  const userId = user?.user?.uid ?? null;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [variantUploadingIndex, _setVariantUploadingIndex] = useState(null);

  const initialFormState = {
    id: '',
    brand: '',
    title: '',
    isActive: true,
    hasVariants: false,
    price: '',
    originalPrice: '',
    inStock: '',
    imageUrl: '',
    category: '',
    description: '',
    tags: [],
    images: [],
    variants: [],
    variantTypes: [],
  };

  const {
    formState: productForm,
    setFormState: setProductForm,
    loadValues: loadProductValues,
    hasDraft,
    draftMeta,
    isDirty,
    recheckDraft,
    restoreDraft,
    discardDraft,
    clearDraft: clearProductDraft,
    resetForm,
  } = useDraftManager({
    storageKey: 'draft_product_create',
    defaultValues: initialFormState,
    userId,
    schemaVersion: 1,
    expiryHours: 24,
  });

  const isEditing = Boolean(productForm?.id);

  const edithandle = (item) => {
    // Use loadProductValues (not setProductForm) to avoid marking isDirty
    loadProductValues({
      id: item.id || '',
      brand: item.brand || '',
      title: item.title || '',
      isActive: item.isActive !== false,
      hasVariants: item.hasVariants ?? (Array.isArray(item.variants) && item.variants.length > 0),
      price: item.price ?? '',
      originalPrice: item.originalPrice ?? '',
      inStock: item.inStock ?? '',
      imageUrl: item.imageUrl || '',
      category: item.category || '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      images: Array.isArray(item.images) ? item.images : (item.imageUrl ? [item.imageUrl] : []),
      variants: Array.isArray(item.variants) ? item.variants : [],
      variantTypes: Array.isArray(item.variantTypes) ? item.variantTypes : [],
    });
  };

  const isDescriptionValid = (desc) => {
    if (!desc) return false;
    if (typeof desc === 'string') return desc.trim() !== '';
    if (typeof desc === 'object') {
      return Boolean(desc.short || (desc.sections && desc.sections.length > 0));
    }
    return false;
  };

  const uploadPendingImages = async (formState) => {
    const pendingMap = formState.pendingFiles || new Map();
    const finalImages = [];
    setUploading(true);

    let uploadedCount = 0;
    const totalFiles = pendingMap.size || 1;

    for (const url of formState.images || []) {
      if (typeof url === 'string' && url.startsWith('blob:') && pendingMap.has(url)) {
        const file = pendingMap.get(url);
        try {
          const downloadURL = await uploadService.uploadProductImage(file, (p) => {
            setUploadProgress(Math.round(((uploadedCount + p / 100) / totalFiles) * 100));
          });
          finalImages.push(downloadURL);
          uploadedCount++;
        } catch (err) {
          console.error("Error uploading pending image:", err);
        }
      } else if (typeof url === 'string' && !url.startsWith('blob:')) {
        finalImages.push(url);
      }
    }

    // Process variant images if any are local blob URLs
    const finalVariants = [];
    for (const variant of formState.variants || []) {
      const vImages = [];
      for (const vUrl of variant.images || []) {
        if (typeof vUrl === 'string' && vUrl.startsWith('blob:') && pendingMap.has(vUrl)) {
          const file = pendingMap.get(vUrl);
          try {
            const downloadURL = await uploadService.uploadProductImage(file);
            vImages.push(downloadURL);
          } catch (err) {
            console.error("Error uploading pending variant image:", err);
          }
        } else if (typeof vUrl === 'string' && !vUrl.startsWith('blob:')) {
          vImages.push(vUrl);
        }
      }
      finalVariants.push({ ...variant, images: vImages });
    }

    setUploading(false);
    setUploadProgress(0);

    const primaryUrl = finalImages[0] || (formState.imageUrl && !formState.imageUrl.startsWith('blob:') ? formState.imageUrl : '');

    // Destructure out pendingFiles — it's a Map and must never reach Firestore
    const { pendingFiles: _removed, ...restForm } = formState;

    return {
      ...restForm,
      imageUrl: primaryUrl,
      images: finalImages,
      variants: finalVariants
    };
  };

  const addProduct = async () => {
    if (
      !productForm.title ||
      !productForm.brand ||
      !productForm.category ||
      !isDescriptionValid(productForm.description)
    ) {
      return toast.error('Please fill all required basic fields (Title, Brand, Category, Description)');
    }

    if (!productForm.hasVariants) {
      if (!productForm.price || Number(productForm.price) <= 0) {
        return toast.error('Please enter a valid base price for products without variants');
      }
      if (productForm.inStock === '' || productForm.inStock === undefined || Number(productForm.inStock) < 0) {
        return toast.error('Please enter in-stock quantity');
      }
    } else {
      if (!productForm.variants || productForm.variants.length === 0) {
        return toast.error('Please generate or add at least one product variant');
      }
    }

    if (!productForm.imageUrl && (!productForm.images || productForm.images.length === 0)) {
      return toast.error('Please upload at least one image');
    }

    setLoading(true);
    try {
      // Upload pending images only now after validation passed
      const preparedForm = await uploadPendingImages(productForm);

      const cleanCategory = normalizeCategoryName(preparedForm.category);
      if (cleanCategory) {
        await productService.saveCategory(cleanCategory);
      }

      const rawData = {
        ...preparedForm,
        category: cleanCategory,
        isActive: preparedForm.isActive !== false,
        hasVariants: Boolean(preparedForm.hasVariants),
        price: preparedForm.hasVariants ? null : Number(preparedForm.price) || 0,
        originalPrice: preparedForm.hasVariants ? null : (preparedForm.originalPrice ? Number(preparedForm.originalPrice) : null),
        inStock: preparedForm.hasVariants ? null : Number(preparedForm.inStock) || 0,
        variantTypes: preparedForm.hasVariants ? (preparedForm.variantTypes || []) : [],
        variants: preparedForm.hasVariants ? (preparedForm.variants || []) : [],
        time: Timestamp.now(),
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      };

      const docData = sanitizeProductForFirestore(rawData);
      await productService.createProduct(docData);

      try {
        const { activityService } = await import('../../services/activity/activityService.js');
        await activityService.logActivity({
          type: 'PRODUCT_ADDED',
          title: `Product Added: ${docData.title}`,
          description: `Category: ${docData.category} • Brand: ${docData.brand}`,
          userEmail: 'Admin',
        });
      } catch (logErr) {
        console.warn('Activity logging failed:', logErr);
      }

      toast.success("Product Added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      // Clear draft BEFORE navigating to prevent stale draft on return
      clearProductDraft();
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, "Failed to add product. Please try again."));
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const updateProduct = async () => {
    if (
      !productForm.title ||
      !productForm.brand ||
      !productForm.category ||
      !isDescriptionValid(productForm.description)
    ) {
      return toast.error('Please fill all required basic fields (Title, Brand, Category, Description)');
    }

    if (!productForm.hasVariants) {
      if (!productForm.price || Number(productForm.price) <= 0) {
        return toast.error('Please enter a valid base price for products without variants');
      }
      if (productForm.inStock === '' || productForm.inStock === undefined || Number(productForm.inStock) < 0) {
        return toast.error('Please enter in-stock quantity');
      }
    } else {
      if (!productForm.variants || productForm.variants.length === 0) {
        return toast.error('Please generate or add at least one product variant');
      }
    }

    if (!productForm.imageUrl && (!productForm.images || productForm.images.length === 0)) {
      return toast.error('Please upload at least one image');
    }

    setLoading(true);
    try {
      // Upload pending images only now after validation passed
      const preparedForm = await uploadPendingImages(productForm);

      const cleanCategory = normalizeCategoryName(preparedForm.category);
      if (cleanCategory) {
        await productService.saveCategory(cleanCategory);
      }

      const rawData = {
        ...preparedForm,
        category: cleanCategory,
        isActive: preparedForm.isActive !== false,
        hasVariants: Boolean(preparedForm.hasVariants),
        price: preparedForm.hasVariants ? null : Number(preparedForm.price) || 0,
        originalPrice: preparedForm.hasVariants ? null : (preparedForm.originalPrice ? Number(preparedForm.originalPrice) : null),
        inStock: preparedForm.hasVariants ? null : Number(preparedForm.inStock) || 0,
        variantTypes: preparedForm.hasVariants ? (preparedForm.variantTypes || []) : [],
        variants: preparedForm.hasVariants ? (preparedForm.variants || []) : [],
      };

      const updateData = sanitizeProductForFirestore(rawData);
      await productService.updateProduct(productForm.id, updateData);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Product Updated successfully");
      setTimeout(() => {
        navigate('/products');
      }, 800);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, "Failed to update product. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const toggleProductActiveStatus = async (item) => {
    const productId = item?.id || item?.docId;
    if (!productId) return;
    const currentStatus = item.isActive !== false;
    const newStatus = !currentStatus;
    setLoading(true);
    try {
      await productService.updateProduct(productId, { isActive: newStatus });
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(`Product "${item.title || 'Item'}" marked as ${newStatus ? 'Live' : 'Draft'}!`);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, "Failed to update product status."));
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (item) => {
    const productId = item?.id || item?.docId;
    if (!productId) return;
    setLoading(true);
    try {
      await productService.deleteProduct(productId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product Deleted successfully');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, "Failed to delete product."));
    } finally {
      setLoading(false);
    }
  };

  // Event handlers for state mutations with deferred uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newBlobUrls = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));

    setProductForm((prev) => {
      const currentImages = prev.images || [];
      const updatedImages = [...currentImages, ...newBlobUrls.map(b => b.url)];
      const pendingMap = new Map(prev.pendingFiles || []);
      newBlobUrls.forEach(b => pendingMap.set(b.url, b.file));

      return {
        ...prev,
        images: updatedImages,
        imageUrl: prev.imageUrl || updatedImages[0] || '',
        pendingFiles: pendingMap
      };
    });
    toast.info(`${files.length} image(s) selected (will upload on save).`);
  };

  const handleImageDelete = async (indexToDelete) => {
    const imageUrlToDelete = productForm.images[indexToDelete];
    
    setProductForm((prev) => {
      const newImages = (prev.images || []).filter((_, idx) => idx !== indexToDelete);
      let newPrimaryUrl = prev.imageUrl;
      if (prev.imageUrl === imageUrlToDelete) {
        newPrimaryUrl = newImages.length > 0 ? newImages[0] : '';
      }
      const pendingMap = new Map(prev.pendingFiles || []);
      if (pendingMap.has(imageUrlToDelete)) {
        pendingMap.delete(imageUrlToDelete);
      }
      return {
        ...prev,
        images: newImages,
        imageUrl: newPrimaryUrl,
        pendingFiles: pendingMap
      };
    });

    if (typeof imageUrlToDelete === 'string' && !imageUrlToDelete.startsWith('blob:')) {
      try {
        await uploadService.deleteProductImage(imageUrlToDelete);
        toast.success("Image deleted");
      } catch (err) {
        console.warn("Storage deletion warning:", err);
      }
    }
  };

  const handleVariantImageUpload = (variantIndex, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newBlobUrls = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));

    setProductForm((prev) => {
      const newVariants = [...(prev.variants || [])];
      const existingImages = newVariants[variantIndex].images || [];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: [...existingImages, ...newBlobUrls.map(b => b.url)]
      };
      const pendingMap = new Map(prev.pendingFiles || []);
      newBlobUrls.forEach(b => pendingMap.set(b.url, b.file));

      return {
        ...prev,
        variants: newVariants,
        pendingFiles: pendingMap
      };
    });
    toast.info(`${files.length} variant image(s) selected (will upload on save).`);
  };

  const handleVariantImageDelete = async (variantIndex, imageIndexToDelete) => {
    let imageUrlToDelete = '';
    
    setProductForm((prev) => {
      const newVariants = [...(prev.variants || [])];
      const existingImages = newVariants[variantIndex].images || [];
      imageUrlToDelete = existingImages[imageIndexToDelete];
      const newImages = existingImages.filter((_, idx) => idx !== imageIndexToDelete);
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: newImages
      };
      return {
        ...prev,
        variants: newVariants
      };
    });

    if (imageUrlToDelete) {
      try {
        await uploadService.deleteProductImage(imageUrlToDelete);
        toast.success("Variant image deleted");
      } catch (err) {
        console.warn("Storage deletion warning:", err);
      }
    }
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setProductForm(prev => ({
      ...prev,
      tags: value
    }));
  };

  const generateCombinations = () => {
    const generated = generateVariantCombinations(productForm);
    if (generated.length === 0) return;
    setProductForm(prev => ({
      ...prev,
      variants: generated
    }));
    toast.info(`Generated ${generated.length} variant combinations`);
  };

  const addManualVariant = () => {
    const attributes = {};
    if (productForm.variantTypes && productForm.variantTypes.length > 0) {
      productForm.variantTypes.forEach(vt => {
        attributes[vt.name] = vt.values?.[0] || '';
      });
    }
    setProductForm(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          attributes,
          price: Number(productForm.price) || 0,
          originalPrice: Number(productForm.price) || 0,
          inStock: 10,
          isActive: true,
          images: []
        }
      ]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setProductForm(prev => {
      const newVariants = [...(prev.variants || [])];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value
      };
      return {
        ...prev,
        variants: newVariants
      };
    });
  };

  const deleteVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, idx) => idx !== index)
    }));
  };

  const deleteAllVariants = () => {
    setProductForm(prev => ({
      ...prev,
      variants: []
    }));
  };

  const addVariantType = () => {
    setProductForm(prev => ({
      ...prev,
      variantTypes: [...(prev.variantTypes || []), { name: '', values: [] }]
    }));
  };

  const deleteVariantType = (typeIndex) => {
    setProductForm(prev => {
      const newTypes = (prev.variantTypes || []).filter((_, idx) => idx !== typeIndex);
      return {
        ...prev,
        variantTypes: newTypes
      };
    });
  };

  const handleVariantTypeNameChange = (typeIndex, name) => {
    setProductForm(prev => {
      const newTypes = [...(prev.variantTypes || [])];
      newTypes[typeIndex] = { ...newTypes[typeIndex], name };
      return {
        ...prev,
        variantTypes: newTypes
      };
    });
  };

  const handleVariantTypeValuesChange = (typeIndex, values) => {
    const valuesArray = Array.isArray(values)
      ? values
      : typeof values === 'string'
        ? values.split(',').map(v => v.trim()).filter(v => v !== '')
        : [];
    setProductForm(prev => {
      const newTypes = [...(prev.variantTypes || [])];
      newTypes[typeIndex] = { ...newTypes[typeIndex], values: valuesArray };
      return {
        ...prev,
        variantTypes: newTypes
      };
    });
  };

  const handleCancel = (isModal, onClose) => {
    resetForm();
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/products');
    }
  };

  return {
    loading,
    uploading,
    uploadProgress,
    productForm,
    setProductForm,
    hasDraft,
    draftMeta,
    isDirty,
    recheckDraft,
    restoreDraft,
    discardDraft,
    edithandle,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActiveStatus,
    resetForm,
    handleImageUpload,
    handleImageDelete,
    handleTagsChange,
    generateCombinations,
    addManualVariant,
    handleVariantChange,
    deleteVariant,
    deleteAllVariants,
    addVariantType,
    deleteVariantType,
    handleVariantTypeNameChange,
    handleVariantTypeValuesChange,
    handleVariantImageUpload,
    handleVariantImageDelete,
    variantUploadingIndex,
    isEditing,
    handleCancel
  };
}
