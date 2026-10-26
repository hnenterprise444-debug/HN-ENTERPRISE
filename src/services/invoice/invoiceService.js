import { fireDB, storage } from '../../firebase/FirebaseConfig.js';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { invoiceRenderUtils } from '../../invoice/index.js';

export const invoiceService = {
  /**
   * Upload an admin custom PDF invoice for an order.
   * Uploads file to Storage first, updates Firestore metadata, and then cleans up oldStoragePath.
   */
  async uploadAdminInvoice(orderId, file, oldStoragePath = null) {
    if (!orderId) throw new Error("Order ID is required.");
    if (!file) throw new Error("Please select a file to upload.");

    // Validate file type
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      throw new Error("Invalid file type. Only PDF documents (.pdf) are allowed.");
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds maximum limit of 5MB.");
    }

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `invoices/${orderId}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    // 1. Upload NEW file to Storage
    await uploadBytes(storageRef, file);

    // 2. Update Firestore Order document
    const orderRef = doc(fireDB, "orders", orderId);
    const invoiceMetadata = {
      uploaded: true,
      storagePath,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "ADMIN"
    };

    await updateDoc(orderRef, {
      invoice: invoiceMetadata
    });

    // 3. Delete OLD storage file after new upload + Firestore update succeeds
    if (oldStoragePath && oldStoragePath !== storagePath) {
      try {
        const oldRef = ref(storage, oldStoragePath);
        await deleteObject(oldRef);
      } catch (delErr) {
        console.warn("Could not remove old invoice file from storage:", delErr);
      }
    }

    return invoiceMetadata;
  },

  /**
   * Removes an admin-uploaded invoice, setting uploaded = false.
   */
  async removeAdminInvoice(orderId, currentStoragePath = null) {
    if (!orderId) throw new Error("Order ID is required.");

    if (currentStoragePath) {
      try {
        const oldRef = ref(storage, currentStoragePath);
        await deleteObject(oldRef);
      } catch (delErr) {
        console.warn("Could not delete invoice file from storage during removal:", delErr);
      }
    }

    const orderRef = doc(fireDB, "orders", orderId);
    await updateDoc(orderRef, {
      "invoice.uploaded": false,
      "invoice.storagePath": null,
      "invoice.fileName": null
    });
  },

  /**
   * Client-side download of an uploaded invoice file from Firebase Storage or direct URL.
   */
  async downloadUploadedInvoice(storagePath, downloadFileName = "Invoice.pdf") {
    if (!storagePath) throw new Error("Storage path is missing.");

    try {
      let url = storagePath;
      // If it's a relative storage path (e.g. invoices/orderId/xyz.pdf), get download URL from Firebase Storage
      if (!storagePath.startsWith("http://") && !storagePath.startsWith("https://")) {
        const storageRef = ref(storage, storagePath);
        url = await getDownloadURL(storageRef);
      }

      const targetFileName = downloadFileName.toLowerCase().endsWith(".pdf")
        ? downloadFileName
        : `${downloadFileName}.pdf`;

      // Method 1: Try downloading via fetch & blob (preserves custom download filename without navigating away)
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = targetFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          return true;
        }
      } catch (corsErr) {
        console.warn("Direct blob download failed (cross-origin restriction). Initiating direct browser download fallback:", corsErr);
      }

      // Method 2: Resilient Fallback - Direct link trigger with target _blank (works even if CORS blocks JavaScript fetch)
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (err) {
      console.error("Error downloading uploaded invoice:", err);
      throw new Error("Unable to download the uploaded invoice file. Please try again or contact support.");
    }
  },

  /**
   * Client-side Tax Invoice PDF generation and download via global invoiceRenderUtils.
   */
  async generateClientInvoicePdf(orderData, siteConfig = {}) {
    return invoiceRenderUtils.generateClientInvoicePdf(orderData, siteConfig);
  }
};

export default invoiceService;
