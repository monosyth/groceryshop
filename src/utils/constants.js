// Receipt categories
export const RECEIPT_CATEGORIES = [
  'grocery',
  'produce',
  'meat',
  'dairy',
  'bakery',
  'frozen',
  'beverages',
  'snacks',
  'household',
  'personal care',
  'health',
  'other',
];

// Analysis status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const COMPRESSED_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy h:mm a';
export const SHORT_DATE_FORMAT = 'MM/dd/yyyy';

// Currency
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

// Pagination
export const RECEIPTS_PER_PAGE = 12;
export const SEARCH_RESULTS_PER_PAGE = 20;

// Chart colors
export const CHART_COLORS = [
  '#2e7d32', // primary green
  '#ff6f00', // secondary orange
  '#ab47bc', // accent purple
  '#66bb6a', // success green
  '#ffa726', // warning orange
  '#29b6f6', // info blue
  '#ef5350', // error red
  '#81c784', // light green
  '#ffb74d', // light orange
  '#ce93d8', // light purple
];
