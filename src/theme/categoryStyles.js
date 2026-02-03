/**
 * Centralized Category Styling Configuration
 *
 * Import this file in components instead of defining category arrays inline.
 * This ensures consistent branding across the entire app.
 *
 * Usage:
 *   import { categoryList, getCategoryStyle, getSourceIconStyle } from '../../theme/categoryStyles';
 */

import {
  Grass,
  SetMeal,
  EggAlt,
  BakeryDining,
  AcUnit,
  Kitchen,
  LocalCafe,
  Fastfood,
  CleaningServices,
  Inventory2,
  Spa,
  LocalPharmacy,
  ShoppingCart,
  Category,
} from '@mui/icons-material';

import {
  teal, blue, purple, pink, orange, amber, red, cyan, gray, white
} from './colors';

// ============================================
// CATEGORY CONFIGURATION
// Single source of truth for all category styling
// ============================================

export const categoryConfig = {
  produce: {
    value: 'produce',
    label: 'Produce',
    icon: Grass,
    color: teal.main,
    bg: teal.bg,
  },
  meat: {
    value: 'meat',
    label: 'Meat & Seafood',
    icon: SetMeal,
    color: red.main,
    bg: red.bg,
  },
  dairy: {
    value: 'dairy',
    label: 'Dairy & Eggs',
    icon: EggAlt,
    color: blue.main,
    bg: blue.bg,
  },
  bakery: {
    value: 'bakery',
    label: 'Bakery',
    icon: BakeryDining,
    color: amber.main,
    bg: amber.bg,
  },
  frozen: {
    value: 'frozen',
    label: 'Frozen',
    icon: AcUnit,
    color: cyan.main,
    bg: cyan.bg,
  },
  pantry: {
    value: 'pantry',
    label: 'Pantry',
    icon: Kitchen,
    color: purple.main,
    bg: purple.bg,
  },
  beverages: {
    value: 'beverages',
    label: 'Beverages',
    icon: LocalCafe,
    color: pink.main,
    bg: pink.bg,
  },
  snacks: {
    value: 'snacks',
    label: 'Snacks',
    icon: Fastfood,
    color: orange.main,
    bg: orange.bg,
  },
  household: {
    value: 'household',
    label: 'Household',
    icon: CleaningServices,
    color: gray.main,
    bg: gray.bg,
  },
  'personal care': {
    value: 'personal care',
    label: 'Personal Care',
    icon: Spa,
    color: gray.main,
    bg: gray.bg,
  },
  health: {
    value: 'health',
    label: 'Health',
    icon: LocalPharmacy,
    color: teal.main,
    bg: teal.bg,
  },
  grocery: {
    value: 'grocery',
    label: 'Grocery',
    icon: ShoppingCart,
    color: teal.main,
    bg: teal.bg,
  },
  other: {
    value: 'other',
    label: 'Other',
    icon: Inventory2,
    color: gray.main,
    bg: gray.bg,
  },
};

// Array of main categories for dropdowns/lists (ordered)
export const categoryList = [
  categoryConfig.produce,
  categoryConfig.meat,
  categoryConfig.dairy,
  categoryConfig.bakery,
  categoryConfig.frozen,
  categoryConfig.pantry,
  categoryConfig.beverages,
  categoryConfig.snacks,
  categoryConfig.household,
  categoryConfig.other,
];

// Category order for sorting
export const categoryOrder = [
  'produce', 'meat', 'dairy', 'bakery', 'frozen',
  'pantry', 'beverages', 'snacks', 'household', 'other'
];

// Get category info by name
export const getCategory = (categoryName) => {
  const key = categoryName?.toLowerCase() || 'other';
  return categoryConfig[key] || categoryConfig.other;
};

// ============================================
// STYLE FUNCTIONS
// Returns sx props for MUI components
// ============================================

// Card container style (for category cards)
export const getCategoryCardStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    bgcolor: '#fff',
    borderRadius: '12px',
    border: `2px solid ${cat.color}`,
    boxShadow: `3px 3px 0px ${cat.color}40`,
    height: '100%',
  };
};

// Header/label row style
export const getCategoryHeaderStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: cat.bg,
    border: `2px solid ${cat.color}`,
    px: 1.5,
    py: 0.75,
    borderRadius: '8px',
  };
};

// Title text style
export const getCategoryTitleStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 600,
    color: cat.color,
    fontSize: '16px',
  };
};

// Count chip style
export const getCategoryChipStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    height: '20px',
    fontSize: '11px',
    fontFamily: 'Outfit, sans-serif',
    bgcolor: `${cat.color}20`,
    color: cat.color,
    fontWeight: 600,
  };
};

// Item row style
export const getCategoryItemStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    bgcolor: white,
    border: `1px solid ${cat.color}25`,
    borderRadius: '8px',
    p: 1,
    '&:hover': {
      bgcolor: `${cat.color}10`,
    },
  };
};

// Source icon container style (receipt/photo/manual icons)
export const getSourceIconStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: '6px',
  bgcolor: `${color}15`,
  border: `1.5px solid ${color}`,
});

// Checkbox style
export const getCategoryCheckboxStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    color: cat.color,
    '&.Mui-checked': { color: cat.color },
    py: 0.5,
  };
};

// Edit button style
export const getCategoryEditButtonStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    color: cat.color,
    p: 0.5,
    '&:hover': {
      bgcolor: `${cat.color}15`,
    },
  };
};

// Divider style for items
export const getCategoryDividerStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    borderBottom: `1px solid ${cat.color}20`,
    '&:last-child': { borderBottom: 'none' },
  };
};

// Icon style (for the category icon in headers)
export const getCategoryIconStyle = (categoryName) => {
  const cat = getCategory(categoryName);
  return {
    fontSize: 20,
    color: cat.color,
  };
};

export default categoryConfig;
