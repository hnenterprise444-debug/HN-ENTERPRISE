/**
 * Image Compression Utility
 * Resizes and compresses image files using HTML Canvas API before upload.
 * Preserves aspect ratio, maintains high visual quality, and reduces file size.
 * Non-image files (e.g. PDFs) are returned unchanged.
 */

export async function compressImage(file, options = {}) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    return file; // Return original if not an image
  }

  // Avoid compressing SVGs
  if (file.type === "image/svg+xml") {
    return file;
  }

  // Detect formats with alpha transparency (PNG, WebP, GIF)
  const isAlphaFormat = file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";

  const {
    maxDimension = 1920,
    quality = 0.85,
    // Preserve transparent formats (PNG/WebP) so background removal is maintained!
    mimeType = options.mimeType || (isAlphaFormat ? (file.type === "image/gif" ? "image/png" : file.type) : "image/jpeg")
  } = options;

  // Avoid compressing very small images (< 150KB)
  if (file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't shrink size, return original file
              resolve(file);
              return;
            }

            const extMap = {
              "image/png": ".png",
              "image/webp": ".webp",
              "image/gif": ".png",
              "image/jpeg": ".jpg"
            };
            const ext = extMap[mimeType] || ".jpg";
            const compressedFileName = file.name.replace(/\.[^/.]+$/, "") + ext;
            const compressedFile = new File([blob], compressedFileName, {
              type: mimeType,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
