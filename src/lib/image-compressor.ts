/**
 * Utility to compress an image file in browser using HTML5 Canvas.
 * Ensures the output file size is <= maxSizeKB (default 50KB).
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 50,
  maxWidthOrHeight: number = 1000
): Promise<File> {
  // If file is already smaller than target size and is jpeg, return as is
  if (file.size <= maxSizeKB * 1024 && file.type === "image/jpeg") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while scaling down if exceeding max width/height
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        const quality = 0.85;

        const attemptCompression = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // If size <= maxSizeKB or quality reached minimum limit
              if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.15) {
                // If blob is still > maxSizeKB and dimensions are still large, scale dimensions down further
                if (blob.size > maxSizeKB * 1024 && maxWidthOrHeight > 300) {
                  compressImage(file, maxSizeKB, Math.round(maxWidthOrHeight * 0.7))
                    .then(resolve)
                    .catch(() => resolve(file));
                  return;
                }

                const compressedFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = new File([blob], compressedFileName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Decrease quality step-by-step
                attemptCompression(Math.max(0.1, currentQuality - 0.15));
              }
            },
            "image/jpeg",
            currentQuality
          );
        };

        attemptCompression(quality);
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
