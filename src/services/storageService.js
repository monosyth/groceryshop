import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import imageCompression from 'browser-image-compression';
import { MAX_FILE_SIZE, COMPRESSED_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '../utils/constants';

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, onProgress) => {
  try {
    const options = {
      maxSizeMB: COMPRESSED_FILE_SIZE / 1024 / 1024,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
      onProgress: onProgress || undefined,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<Object>} { url: string, path: string }
 */
export const uploadReceiptImage = async (file, userId, onProgress) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress image
    const compressedFile = await compressImage(file, (progress) => {
      if (onProgress) {
        onProgress(progress * 0.3); // Compression is 30% of total progress
      }
    });

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `receipts/${userId}/${timestamp}_${sanitizedFileName}`;

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress (70% of total progress)
          const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 70 + 30;
          if (onProgress) {
            onProgress(uploadProgress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload image'));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress(100);
            }
            resolve({
              url: downloadURL,
              path: filePath,
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get download URL'));
          }
        }
      );
    });
  } catch (error) {
    console.error('uploadReceiptImage error:', error);
    throw error;
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imagePath - Storage path of the image
 * @returns {Promise<void>}
 */
export const deleteReceiptImage = async (imagePath) => {
  try {
    if (!imagePath) {
      throw new Error('No image path provided');
    }

    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('deleteReceiptImage error:', error);
    // Don't throw error if file doesn't exist (already deleted)
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
};

/**
 * Get storage usage for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total bytes used
 */
export const getUserStorageUsage = async (userId) => {
  // Note: This would require listing all files which is not straightforward
  // with Firebase Storage. Consider implementing server-side tracking instead.
  throw new Error('Not implemented - use server-side tracking');
};
