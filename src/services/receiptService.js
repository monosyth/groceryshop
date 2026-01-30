import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createReceiptDocument, validateReceipt } from '../types/schemas';
import { uploadReceiptImage, deleteReceiptImage } from './storageService';

const RECEIPTS_COLLECTION = 'receipts';

/**
 * Create a new receipt with image upload
 * @param {File} imageFile - Receipt image file
 * @param {string} userId - User ID
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<string>} Receipt ID
 */
export const createReceipt = async (imageFile, userId, onProgress) => {
  try {
    // Upload image first (0-100% progress)
    const { url, path } = await uploadReceiptImage(imageFile, userId, onProgress);

    // Create receipt document
    const receiptData = createReceiptDocument(userId, url, path);

    // Validate
    const validation = validateReceipt(receiptData);
    if (!validation.valid) {
      throw new Error(`Validation error: ${validation.errors.join(', ')}`);
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), {
      ...receiptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('createReceipt error:', error);
    throw error;
  }
};

/**
 * Get a receipt by ID
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<Object>} Receipt data
 */
export const getReceipt = async (receiptId) => {
  try {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Receipt not found');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('getReceipt error:', error);
    throw error;
  }
};

/**
 * Get receipts for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options { limitCount, orderByField, orderDirection, lastDoc }
 * @returns {Promise<Array>} Array of receipts
 */
export const getUserReceipts = async (userId, options = {}) => {
  try {
    const {
      limitCount = 20,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      lastDoc = null,
    } = options;

    let q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );

    // Pagination support
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const receipts = [];

    querySnapshot.forEach((doc) => {
      receipts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return receipts;
  } catch (error) {
    console.error('getUserReceipts error:', error);
    throw error;
  }
};

/**
 * Update a receipt
 * @param {string} receiptId - Receipt ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateReceipt = async (receiptId, updates) => {
  try {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('updateReceipt error:', error);
    throw error;
  }
};

/**
 * Delete a receipt (including image)
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<void>}
 */
export const deleteReceipt = async (receiptId) => {
  try {
    // Get receipt to find image path
    const receipt = await getReceipt(receiptId);

    // Delete image from storage
    if (receipt.imagePath) {
      await deleteReceiptImage(receipt.imagePath);
    }

    // Delete Firestore document
    await deleteDoc(doc(db, RECEIPTS_COLLECTION, receiptId));
  } catch (error) {
    console.error('deleteReceipt error:', error);
    throw error;
  }
};

/**
 * Retry analysis for a failed receipt
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<void>}
 */
export const retryReceiptAnalysis = async (receiptId) => {
  try {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);

    // Reset status to trigger Cloud Function again
    await updateDoc(docRef, {
      'metadata.analysisStatus': 'pending',
      'metadata.processingError': null,
      'metadata.technicalError': null,
      'metadata.retryable': null,
      'metadata.retryCount': serverTimestamp(), // Timestamp to track retries
      updatedAt: serverTimestamp(),
    });

    // Delete and recreate document to trigger onCreate
    const receipt = await getReceipt(receiptId);
    await deleteDoc(docRef);

    // Create new document with same data
    await addDoc(collection(db, RECEIPTS_COLLECTION), {
      ...receipt,
      id: undefined, // Remove old ID
      metadata: {
        ...receipt.metadata,
        analysisStatus: 'pending',
        processingError: null,
        technicalError: null,
        retryable: null,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('retryReceiptAnalysis error:', error);
    throw error;
  }
};

/**
 * Search receipts
 * @param {string} userId - User ID
 * @param {Object} filters - Search filters { storeName, startDate, endDate, minAmount, maxAmount }
 * @returns {Promise<Array>} Array of receipts
 */
export const searchReceipts = async (userId, filters = {}) => {
  try {
    let q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let receipts = [];

    querySnapshot.forEach((doc) => {
      receipts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side filtering (Firebase doesn't support complex queries easily)
    if (filters.storeName) {
      receipts = receipts.filter((r) =>
        r.storeInfo?.name?.toLowerCase().includes(filters.storeName.toLowerCase())
      );
    }

    if (filters.startDate) {
      receipts = receipts.filter((r) => {
        const receiptDate = r.storeInfo?.date?.toDate?.() || r.createdAt?.toDate?.();
        return receiptDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      receipts = receipts.filter((r) => {
        const receiptDate = r.storeInfo?.date?.toDate?.() || r.createdAt?.toDate?.();
        return receiptDate <= filters.endDate;
      });
    }

    if (filters.minAmount !== undefined) {
      receipts = receipts.filter((r) => r.summary?.total >= filters.minAmount);
    }

    if (filters.maxAmount !== undefined) {
      receipts = receipts.filter((r) => r.summary?.total <= filters.maxAmount);
    }

    return receipts;
  } catch (error) {
    console.error('searchReceipts error:', error);
    throw error;
  }
};
