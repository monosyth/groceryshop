import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Add items from a receipt to pantry
 * @param {string} userId - User ID
 * @param {string} receiptId - Receipt ID
 * @param {Array} items - Array of items from receipt
 * @param {string} storeName - Store name from receipt
 * @returns {Promise<number>} Number of items added
 */
export const addReceiptItemsToPantry = async (userId, receiptId, items, storeName) => {
  try {
    if (!items || items.length === 0) {
      return 0;
    }

    // Check which items already exist in pantry from this receipt
    // (to avoid duplicates if function is called multiple times)
    const existingQuery = query(
      collection(db, 'pantry'),
      where('userId', '==', userId),
      where('receiptId', '==', receiptId)
    );
    const existingSnap = await getDocs(existingQuery);
    const existingItems = new Set(existingSnap.docs.map((doc) => doc.data().name));

    let addedCount = 0;

    // Add each item to pantry
    for (const item of items) {
      if (!item.name) continue;

      const itemName = item.name.toLowerCase();

      // Skip if already added from this receipt
      if (existingItems.has(itemName)) {
        continue;
      }

      await addDoc(collection(db, 'pantry'), {
        userId,
        name: itemName,
        source: 'receipt',
        receiptId,
        storeName: storeName || 'Unknown Store',
        category: item.category || null,
        createdAt: serverTimestamp(),
      });

      addedCount++;
    }

    return addedCount;
  } catch (error) {
    console.error('Error adding receipt items to pantry:', error);
    throw error;
  }
};

/**
 * Add items from pantry photo to pantry
 * @param {string} userId - User ID
 * @param {Array} items - Array of ingredient names
 * @returns {Promise<number>} Number of items added
 */
export const addPhotoItemsToPantry = async (userId, items) => {
  try {
    if (!items || items.length === 0) {
      return 0;
    }

    let addedCount = 0;

    // Add each item to pantry
    for (const itemName of items) {
      if (!itemName) continue;

      await addDoc(collection(db, 'pantry'), {
        userId,
        name: itemName.toLowerCase(),
        source: 'photo',
        createdAt: serverTimestamp(),
      });

      addedCount++;
    }

    return addedCount;
  } catch (error) {
    console.error('Error adding photo items to pantry:', error);
    throw error;
  }
};
