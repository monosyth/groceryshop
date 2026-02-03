/**
 * GroceryShop Color System
 *
 * Centralized color palette with consistent shading structure.
 * Each color family has 4 shades: dark, main, light, bg (background)
 *
 * IMPORTANT: All colors in the app should reference this file.
 * Do not use hardcoded hex values in components.
 */

// Primary Brand Colors - Teal
export const teal = {
  darker: '#0D9488',  // Hover states, dark accents
  dark: '#0D9488',    // Hover states, dark accents (alias)
  main: '#14B8A6',    // Primary brand color
  light: '#5EEAD4',   // Highlights, shadows
  bg: '#F0FDFA',      // Light backgrounds (app pages)
  bgAlt: '#E6F9F5',   // Alternative light background
};

// Category Colors
export const blue = {
  dark: '#1E40AF',
  main: '#3B82F6',    // Dairy category
  light: '#93C5FD',
  bg: '#DBEAFE',
};

export const purple = {
  dark: '#6D28D9',
  main: '#8B5CF6',    // Pantry category
  light: '#C4B5FD',
  bg: '#EDE9FE',
};

export const pink = {
  darker: '#9F1239',  // Very dark pink/rose for text
  dark: '#BE185D',
  main: '#EC4899',    // Beverages category
  light: '#F9A8D4',
  bg: '#FCE7F3',
};

export const rose = {
  dark: '#DB2777',    // Rose-700
  main: '#F43F5E',    // Rose-500
  light: '#FDA4AF',   // Rose-300
  bg: '#FFE4E6',      // Rose-100
};

export const orange = {
  dark: '#EA580C',
  main: '#F97316',    // Snacks category
  light: '#FDBA74',
  bg: '#FFEDD5',
};

export const amber = {
  dark: '#D97706',
  main: '#F59E0B',    // Bakery category
  light: '#FCD34D',
  bg: '#FEF3C7',
};

export const red = {
  dark: '#DC2626',
  main: '#EF4444',    // Meat category
  light: '#FEE2E2',
  bg: '#FEE2E2',
};

export const cyan = {
  dark: '#0891B2',
  main: '#06B6D4',    // Frozen category
  light: '#67E8F9',
  bg: '#CFFAFE',
};

// Neutral Colors
export const gray = {
  dark: '#374151',
  main: '#6B7280',    // Household category, UI elements
  light: '#D1D5DB',
  bg: '#F9FAFB',
};

export const darkGray = {
  darker: '#1F2937',  // Primary text
  dark: '#374151',
  main: '#4B5563',
  light: '#9CA3AF',
};

// Brown - now mapped to neutral grays (no brown in the app)
export const brown = {
  dark: '#374151',    // Gray-700
  main: '#4B5563',    // Gray-600 (neutral text)
  light: '#6B7280',   // Gray-500
  bg: '#F9FAFB',      // Gray-50 background
};

// UI Colors
export const white = '#FFFFFF';
export const cream = '#FFFBEB';  // Warm background (landing page)

// UI utility colors - borders, dividers, backgrounds
export const ui = {
  border: '#E5E7EB',        // Default border color
  borderLight: '#F3F4F6',   // Light border
  divider: '#E5E7EB',       // Divider lines
  background: '#FFFFFF',    // Default background
  backgroundAlt: '#F9FAFB', // Alternative background
  backgroundPage: '#F0FDFA', // Page background (light teal)
  shadow: '#D1D5DB',        // Box shadow color
  overlay: 'rgba(0,0,0,0.5)', // Modal overlay
};

// Category Mapping
export const categories = {
  produce: {
    emoji: '🥬',
    name: 'Produce',
    color: teal.main,
    bg: teal.bg,
  },
  meat: {
    emoji: '🥩',
    name: 'Meat & Seafood',
    color: red.main,
    bg: red.bg,
  },
  dairy: {
    emoji: '🥛',
    name: 'Dairy & Eggs',
    color: blue.main,
    bg: blue.bg,
  },
  bakery: {
    emoji: '🍞',
    name: 'Bakery',
    color: amber.main,
    bg: amber.bg,
  },
  frozen: {
    emoji: '🧊',
    name: 'Frozen',
    color: cyan.main,
    bg: cyan.bg,
  },
  pantry: {
    emoji: '🥫',
    name: 'Pantry',
    color: purple.main,
    bg: purple.bg,
  },
  beverages: {
    emoji: '🥤',
    name: 'Beverages',
    color: pink.main,
    bg: pink.bg,
  },
  snacks: {
    emoji: '🍿',
    name: 'Snacks',
    color: orange.main,
    bg: orange.bg,
  },
  household: {
    emoji: '🧹',
    name: 'Household',
    color: gray.main,
    bg: gray.bg,
  },
  'personal care': {
    emoji: '🧴',
    name: 'Personal Care',
    color: gray.main,
    bg: gray.bg,
  },
  health: {
    emoji: '💊',
    name: 'Health',
    color: teal.main,
    bg: teal.bg,
  },
  grocery: {
    emoji: '🛒',
    name: 'Grocery',
    color: teal.main,
    bg: teal.bg,
  },
  other: {
    emoji: '📦',
    name: 'Other',
    color: gray.main,
    bg: gray.bg,
  },
};

// Receipt Card Color Schemes (rotating colors for variety)
export const cardThemes = [
  { bg: orange.bg, border: orange.main, shadow: amber.light },   // Orange
  { bg: pink.bg, border: pink.main, shadow: pink.light },        // Pink
  { bg: teal.bg, border: teal.main, shadow: teal.light },        // Teal
  { bg: amber.bg, border: amber.main, shadow: amber.light },     // Yellow
];

// Helper function to get category info
export const getCategoryInfo = (categoryName) => {
  const categoryKey = categoryName?.toLowerCase() || 'other';
  return categories[categoryKey] || categories.other;
};

// Export all color families for easy access
export const colors = {
  teal,
  blue,
  purple,
  pink,
  orange,
  amber,
  red,
  cyan,
  gray,
  darkGray,
  brown,
  white,
  cream,
  ui,
};

export default colors;
