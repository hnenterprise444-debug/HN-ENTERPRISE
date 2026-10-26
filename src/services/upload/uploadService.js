import { storage } from '../../firebase/FirebaseConfig.js';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { compressImage } from '../../utils/imageCompression.js';

export const uploadService = {
  /**
   * Resumable upload of an image or document to Firebase Storage with progress tracking.
   * Compresses image files before upload (leaves PDFs/documents untouched).
   * @param {File} rawFile - The file to upload
   * @param {string} folder - Target folder ('products', 'banners', 'company', 'legal', 'orders', etc.)
   * @param {function} onProgress - Optional callback receiving upload percentage (0-100)
   */
  async uploadFile(rawFile, folder = 'uploads', onProgress) {
    const file = await compressImage(rawFile);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${sanitizedName}`);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || rawFile.type,
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  /**
   * Product image upload -> saves into `products/` folder
   */
  async uploadProductImage(rawFile, onProgress) {
    return this.uploadFile(rawFile, 'products', onProgress);
  },

  /**
   * Banner image upload -> saves into `banners/` folder
   */
  async uploadBannerImage(rawFile, onProgress) {
    return this.uploadFile(rawFile, 'banners', onProgress);
  },

  /**
   * Company identity upload (logo, favicon) -> saves into `company/` folder
   * Preserves transparency for PNG/SVG/WebP background-removed brand logos!
   */
  async uploadCompanyAsset(rawFile, onProgress) {
    // If it's a vector or transparent brand asset, preserve its exact format & alpha channel
    if (rawFile.type === 'image/svg+xml' || rawFile.type === 'image/png' || rawFile.type === 'image/webp') {
      const file = rawFile.size > 2 * 1024 * 1024
        ? await compressImage(rawFile, { maxDimension: 1024, mimeType: rawFile.type })
        : rawFile;

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `company/${Date.now()}_${sanitizedName}`);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || rawFile.type || 'image/png',
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(Math.round(progress));
            }
          },
          reject,
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    }

    return this.uploadFile(rawFile, 'company', onProgress);
  },

  /**
   * Legal policy document upload (PDF) -> saves into `legal/` folder
   */
  async uploadLegalDocument(rawFile, onProgress) {
    return this.uploadFile(rawFile, 'legal', onProgress);
  },

  /**
   * Deletes a file from Firebase Storage given its download URL
   */
  async deleteFile(fileUrl) {
    if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    }
  },

  // Backwards compatibility alias
  async deleteProductImage(imageUrl) {
    return this.deleteFile(imageUrl);
  },

  // Backwards compatibility alias
  uploadFirebaseImage(file, onProgress) {
    return this.uploadProductImage(file, onProgress);
  }
};

