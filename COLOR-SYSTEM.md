# GroceryShop Color System

All colors are now centralized in `/src/theme/colors.js` for easy management and consistency.

## Color Structure

Each color family has **4 consistent shades**:
- `dark` - Hover states, dark accents
- `main` - Primary color
- `light` - Highlights, shadows
- `bg` - Light backgrounds

## Color Palette

### Primary Brand - Teal
```javascript
teal.dark  = '#0D9488'  // Hover states
teal.main  = '#14B8A6'  // Primary brand
teal.light = '#5EEAD4'  // Highlights
teal.bg    = '#F0FDFA'  // Backgrounds
```

### Category Colors

**Blue** (Dairy)
```javascript
blue.dark  = '#1E40AF'
blue.main  = '#3B82F6'
blue.light = '#93C5FD'
blue.bg    = '#DBEAFE'
```

**Purple** (Pantry)
```javascript
purple.dark  = '#6D28D9'
purple.main  = '#8B5CF6'
purple.light = '#C4B5FD'
purple.bg    = '#EDE9FE'
```

**Pink** (Beverages)
```javascript
pink.dark  = '#BE185D'
pink.main  = '#EC4899'
pink.light = '#F9A8D4'
pink.bg    = '#FCE7F3'
```

**Orange** (Snacks)
```javascript
orange.dark  = '#EA580C'
orange.main  = '#F97316'
orange.light = '#FDBA74'
orange.bg    = '#FFEDD5'
```

**Amber** (Bakery)
```javascript
amber.dark  = '#D97706'
amber.main  = '#F59E0B'
amber.light = '#FCD34D'
amber.bg    = '#FEF3C7'
```

**Red** (Meat & Seafood)
```javascript
red.dark  = '#DC2626'
red.main  = '#EF4444'
red.light = '#FEE2E2'
red.bg    = '#FEE2E2'
```

**Cyan** (Frozen)
```javascript
cyan.dark  = '#0891B2'
cyan.main  = '#06B6D4'
cyan.light = '#67E8F9'
cyan.bg    = '#CFFAFE'
```

**Gray** (Household & UI)
```javascript
gray.dark  = '#374151'
gray.main  = '#6B7280'
gray.light = '#D1D5DB'
gray.bg    = '#F9FAFB'
```

### Neutral Colors

**Dark Gray** (Text)
```javascript
darkGray.darker = '#1F2937'  // Primary text
darkGray.dark   = '#374151'
darkGray.main   = '#4B5563'
darkGray.light  = '#9CA3AF'
```

**Brown** (Accents)
```javascript
brown.dark  = '#92400E'
brown.main  = '#78350F'
brown.light = '#B45309'
brown.bg    = '#FFFBEB'  // Cream
```

**White**
```javascript
white = '#FFFFFF'
cream = '#FFFBEB'  // Warm background
```

## Usage Examples

### Importing
```javascript
import { teal, blue, categories, getCategoryInfo } from '../theme/colors';
```

### Using in Components
```javascript
// Direct color usage
sx={{
  bgcolor: teal.main,
  '&:hover': { bgcolor: teal.dark },
}}

// Category colors
const categoryInfo = getCategoryInfo('produce');
sx={{
  color: categoryInfo.color,
  bgcolor: categoryInfo.bg,
}}
```

### Category Mapping
```javascript
categories.produce    // 🥬 Produce (Teal)
categories.meat       // 🥩 Meat & Seafood (Red)
categories.dairy      // 🥛 Dairy & Eggs (Blue)
categories.bakery     // 🍞 Bakery (Amber)
categories.frozen     // 🧊 Frozen (Cyan)
categories.pantry     // 🥫 Pantry (Purple)
categories.beverages  // 🥤 Beverages (Pink)
categories.snacks     // 🍿 Snacks (Orange)
categories.household  // 🧹 Household (Gray)
categories.other      // 📦 Other (Gray)
```

## Benefits

1. **Consistency** - Every color family has the same 4 shades
2. **Maintainability** - Update colors in one place
3. **Type Safety** - Easy to autocomplete and validate
4. **Scalability** - Easy to add new colors or adjust existing ones
5. **Clean** - No duplicate color values

## Migration

To use these colors in existing components:

**Before:**
```javascript
sx={{ bgcolor: '#14B8A6', '&:hover': { bgcolor: '#0D9488' } }}
```

**After:**
```javascript
import { teal } from '../theme/colors';
sx={{ bgcolor: teal.main, '&:hover': { bgcolor: teal.dark } }}
```
