import { ANALYSIS_STATUS } from '../utils/constants';

/**
 * Create a new receipt document structure
 * @param {string} userId - User ID
 * @param {string} imageUrl - URL to the receipt image
 * @param {string} imagePath - Storage path for the image
 * @returns {Object} Receipt document
 */
export const createReceiptDocument = (userId, imageUrl, imagePath) => {
  return {
    userId,
    imageUrl,
    imagePath,
    storeInfo: {
      name: '',
      location: null,
      date: null,
    },
    items: [],
    summary: {
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    metadata: {
      analysisStatus: ANALYSIS_STATUS.PENDING,
      processedAt: null,
      processingError: null,
      geminiFeedback: null,
    },
    tags: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a receipt item structure
 * @param {string} name - Item name
 * @param {number} quantity - Quantity
 * @param {number} unitPrice - Unit price
 * @param {number} totalPrice - Total price
 * @param {string} category - Item category
 * @returns {Object} Receipt item
 */
export const createReceiptItem = (name, quantity, unitPrice, totalPrice, category = 'other') => {
  return {
    name,
    quantity: quantity || 1,
    unitPrice: unitPrice || 0,
    totalPrice: totalPrice || 0,
    category,
  };
};

/**
 * Validate receipt document
 * @param {Object} receipt - Receipt document
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateReceipt = (receipt) => {
  const errors = [];

  if (!receipt.userId) {
    errors.push('User ID is required');
  }

  if (!receipt.imageUrl) {
    errors.push('Image URL is required');
  }

  if (!receipt.imagePath) {
    errors.push('Image path is required');
  }

  if (receipt.summary) {
    if (typeof receipt.summary.total !== 'number') {
      errors.push('Total must be a number');
    }
    if (receipt.summary.total < 0) {
      errors.push('Total cannot be negative');
    }
  }

  if (receipt.items && Array.isArray(receipt.items)) {
    receipt.items.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Item ${index + 1}: name is required`);
      }
      if (typeof item.totalPrice !== 'number') {
        errors.push(`Item ${index + 1}: totalPrice must be a number`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create user preferences document
 * @returns {Object} User preferences
 */
export const createUserPreferences = () => {
  return {
    theme: 'light',
    currency: 'USD',
    defaultStore: null,
    categories: [],
  };
};
