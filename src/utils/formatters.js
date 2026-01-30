import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL, DATE_FORMAT, DATETIME_FORMAT } from './constants';

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return `${CURRENCY_SYMBOL}0.00`;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format a date object or timestamp
 * @param {Date|string|number} date - Date to format
 * @param {string} formatString - Format string (default: DATE_FORMAT)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = DATE_FORMAT) => {
  if (!date) return '';

  try {
    if (typeof date === 'string') {
      return format(parseISO(date), formatString);
    }

    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return format(date.toDate(), formatString);
    }

    return format(new Date(date), formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date and time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, DATETIME_FORMAT);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  try {
    let dateObj = date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};
