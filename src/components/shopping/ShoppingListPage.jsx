import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Delete,
  Add,
  ShoppingCart,
  Store,
  CheckCircle,
  Restaurant,
  ViewList,
  LocationOn,
  LocalFlorist,
  Restaurant as MeatIcon,
  LocalDining,
  BakeryDining,
  AcUnit,
  Inventory2,
  LocalBar,
  Fastfood,
  CleaningServices,
  AutoAwesome,
  ShoppingBag,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import { useHousehold } from '../../context/HouseholdContext';
import { SkeletonList, ShoppingListItemSkeleton } from '../common/Skeletons';
import { categorizeShoppingItem } from '../../services/geminiService';
import {
  collection,
  query,
  where,
  or,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { teal, blue, purple, pink, orange, amber, red, cyan, gray, brown, darkGray, ui, white } from '../../theme/colors';

export default function ShoppingListPage() {
  const { currentUser } = useAuth();
  const { receipts: allReceipts } = useReceipts();
  const { householdId, hasHousehold } = useHousehold();
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [recategorizing, setRecategorizing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('location'); // 'default', 'store', 'location' - default to category view

  // Categories for shopping items
  const categories = [
    { value: 'produce', label: 'Produce', icon: LocalFlorist, color: teal.main },
    { value: 'meat', label: 'Meat & Seafood', icon: MeatIcon, color: red.main },
    { value: 'dairy', label: 'Dairy & Eggs', icon: LocalDining, color: blue.main },
    { value: 'bakery', label: 'Bakery', icon: BakeryDining, color: amber.main },
    { value: 'frozen', label: 'Frozen', icon: AcUnit, color: cyan.main },
    { value: 'pantry', label: 'Pantry', icon: Inventory2, color: purple.main },
    { value: 'beverages', label: 'Beverages', icon: LocalBar, color: pink.main },
    { value: 'snacks', label: 'Snacks', icon: Fastfood, color: orange.main },
    { value: 'household', label: 'Household', icon: CleaningServices, color: gray.main },
    { value: 'other', label: 'Other', icon: Inventory2, color: darkGray.light },
  ];

  // Filter receipts with store info for store suggestions
  const receipts = allReceipts.filter((receipt) => receipt.storeInfo?.name);

  // Generate item suggestions from receipts and shopping list history with store info
  const itemSuggestions = useMemo(() => {
    const itemMap = new Map(); // Use map to track items and their stores

    // Add items from receipts with store info
    allReceipts.forEach((receipt) => {
      const storeName = receipt.storeInfo?.name;
      receipt.items?.forEach((item) => {
        if (item.name) {
          const itemKey = item.name.toLowerCase();
          if (!itemMap.has(itemKey)) {
            itemMap.set(itemKey, {
              name: item.name,
              stores: new Set(),
            });
          }
          if (storeName) {
            itemMap.get(itemKey).stores.add(storeName);
          }
        }
      });
    });

    // Add items from shopping list history
    shoppingList.forEach((item) => {
      if (item.name) {
        const itemKey = item.name.toLowerCase();
        if (!itemMap.has(itemKey)) {
          itemMap.set(itemKey, {
            name: item.name,
            stores: new Set(),
          });
        }
      }
    });

    // Convert to array with store info and sort alphabetically
    return Array.from(itemMap.values())
      .map((item) => ({
        name: item.name,
        stores: Array.from(item.stores),
        suggestedStore: item.stores.size > 0 ? Array.from(item.stores)[0] : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allReceipts, shoppingList]);

  // Fetch shopping list items (household or personal)
  useEffect(() => {
    if (!currentUser) return;

    let q;
    // If user is in a household, show all household items
    if (hasHousehold && householdId) {
      q = query(
        collection(db, 'shoppingList'),
        or(
          where('householdId', '==', householdId),
          where('userId', '==', currentUser.uid)
        )
      );
    } else {
      q = query(
        collection(db, 'shoppingList'),
        where('userId', '==', currentUser.uid)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        // Sort by createdAt descending in JavaScript
        items.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        setShoppingList(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching shopping list:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, householdId, hasHousehold]);

  // Estimate item price from receipt history
  const estimateItemPrice = (itemName) => {
    const lowerItemName = itemName.toLowerCase();
    const prices = [];

    allReceipts.forEach((receipt) => {
      receipt.items?.forEach((receiptItem) => {
        if (
          receiptItem.name?.toLowerCase().includes(lowerItemName) ||
          lowerItemName.includes(receiptItem.name?.toLowerCase())
        ) {
          if (receiptItem.price && receiptItem.price > 0) {
            prices.push(receiptItem.price);
          }
        }
      });
    });

    if (prices.length === 0) return null;

    // Return average price
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  };

  // Handle add item
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    setAddingItem(true);
    try {
      // Estimate price from receipt history
      const estimatedPrice = estimateItemPrice(newItemName.trim());

      // Auto-categorize with AI if category is still 'other' (default)
      let finalCategory = newItemCategory;
      if (newItemCategory === 'other') {
        finalCategory = await categorizeShoppingItem(newItemName.trim());
      }

      await addDoc(collection(db, 'shoppingList'), {
        userId: currentUser.uid,
        householdId: householdId || null,
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || null,
        category: finalCategory,
        notes: newItemNotes.trim() || null,
        estimatedPrice: estimatedPrice,
        checked: false,
        manual: true,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCategory('other');
      setNewItemNotes('');
      setShowAdvanced(false);

      setSnackbar({
        open: true,
        message: 'Item added to shopping list!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add item',
        severity: 'error',
      });
    } finally {
      setAddingItem(false);
    }
  };

  // Handle toggle checked
  const handleToggleChecked = async (itemId, currentChecked) => {
    try {
      await updateDoc(doc(db, 'shoppingList', itemId), {
        checked: !currentChecked,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update item',
        severity: 'error',
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'shoppingList', itemId));
      setSnackbar({
        open: true,
        message: 'Item removed from shopping list',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove item',
        severity: 'error',
      });
    }
  };

  // Handle clear completed
  const handleClearCompleted = async () => {
    const completedItems = shoppingList.filter((item) => item.checked);

    try {
      const promises = completedItems.map((item) =>
        deleteDoc(doc(db, 'shoppingList', item.id))
      );
      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: `Removed ${completedItems.length} completed items`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error clearing completed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to clear completed items',
        severity: 'error',
      });
    }
  };

  // Handle recategorize items
  const handleRecategorize = async () => {
    // Get all items that need recategorization (category is 'other' or not set)
    const itemsToRecategorize = shoppingList.filter(
      (item) => !item.category || item.category === 'other'
    );

    if (itemsToRecategorize.length === 0) {
      setSnackbar({
        open: true,
        message: 'All items are already categorized!',
        severity: 'info',
      });
      return;
    }

    setRecategorizing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process items sequentially to avoid rate limits
      for (const item of itemsToRecategorize) {
        try {
          const newCategory = await categorizeShoppingItem(item.name);

          // Only update if AI returned a category different from 'other'
          if (newCategory && newCategory !== 'other') {
            await updateDoc(doc(db, 'shoppingList', item.id), {
              category: newCategory,
            });
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error recategorizing ${item.name}:`, error);
          failCount++;
        }
      }

      setSnackbar({
        open: true,
        message: `Recategorized ${successCount} items${failCount > 0 ? `, ${failCount} remained as 'other'` : ''}`,
        severity: successCount > 0 ? 'success' : 'info',
      });
    } catch (error) {
      console.error('Error recategorizing items:', error);
      setSnackbar({
        open: true,
        message: 'Failed to recategorize items',
        severity: 'error',
      });
    } finally {
      setRecategorizing(false);
    }
  };

  // Get store suggestions
  const getStoreSuggestions = () => {
    const uncheckedItems = shoppingList.filter((item) => !item.checked);
    const storeCounts = {};

    uncheckedItems.forEach((listItem) => {
      receipts.forEach((receipt) => {
        const hasItem = receipt.items?.some((receiptItem) =>
          receiptItem.name?.toLowerCase().includes(listItem.name.toLowerCase()) ||
          listItem.name.toLowerCase().includes(receiptItem.name?.toLowerCase())
        );

        if (hasItem && receipt.storeInfo?.name) {
          const storeName = receipt.storeInfo.name;
          storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
        }
      });
    });

    const suggestions = Object.entries(storeCounts)
      .map(([store, count]) => ({ store, count }))
      .sort((a, b) => b.count - a.count);

    return suggestions;
  };

  // Get items available at a specific store
  const getItemsForStore = (storeName) => {
    const uncheckedItems = shoppingList.filter((item) => !item.checked);
    const matchingItems = [];

    uncheckedItems.forEach((listItem) => {
      const hasMatch = receipts.some((receipt) => {
        if (receipt.storeInfo?.name !== storeName) return false;
        return receipt.items?.some((receiptItem) =>
          receiptItem.name?.toLowerCase().includes(listItem.name.toLowerCase()) ||
          listItem.name.toLowerCase().includes(receiptItem.name?.toLowerCase())
        );
      });

      if (hasMatch) {
        matchingItems.push(listItem);
      }
    });

    return matchingItems;
  };

  // Get suggested store for a single item
  const getSuggestedStore = (itemName) => {
    const storeCounts = {};

    receipts.forEach((receipt) => {
      const hasItem = receipt.items?.some((receiptItem) =>
        receiptItem.name?.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(receiptItem.name?.toLowerCase())
      );

      if (hasItem && receipt.storeInfo?.name) {
        const storeName = receipt.storeInfo.name;
        storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
      }
    });

    // Return the store with the most occurrences
    const stores = Object.entries(storeCounts);
    if (stores.length === 0) return null;

    stores.sort((a, b) => b[1] - a[1]);
    return stores[0][0];
  };

  const uncheckedItems = shoppingList.filter((item) => !item.checked);
  const checkedItems = shoppingList.filter((item) => item.checked);

  // Sort/group items based on sortBy state
  let fromRecipes = [];
  let manualItems = [];
  let groupedByStore = {};
  let groupedByLocation = {};

  if (sortBy === 'store') {
    // Group by store
    uncheckedItems.forEach((item) => {
      const store = getSuggestedStore(item.name) || 'Unknown Store';
      if (!groupedByStore[store]) {
        groupedByStore[store] = [];
      }
      groupedByStore[store].push(item);
    });
  } else if (sortBy === 'location') {
    // Group by category (grocery store location)
    uncheckedItems.forEach((item) => {
      const category = item.category || 'other';
      if (!groupedByLocation[category]) {
        groupedByLocation[category] = [];
      }
      groupedByLocation[category].push(item);
    });
  } else {
    // Default view (by source)
    fromRecipes = uncheckedItems.filter((item) => item.fromRecipe);
    manualItems = uncheckedItems.filter((item) => item.manual);
  }

  if (loading) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 4, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart sx={{ fontSize: 36, color: teal.main }} />
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  color: teal.main,
                  fontSize: { xs: '28px', md: '34px' },
                  mb: 0,
                }}
              >
                Shopping List
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.main,
              }}
            >
              Loading your shopping list...
            </Typography>
          </Box>
          <Card
            sx={{
              bgcolor: white,
              borderRadius: '12px',
              border: `2px solid ${ui.border}`,
              boxShadow: `3px 3px 0px ${ui.border}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <SkeletonList count={8} component={ShoppingListItemSkeleton} />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart sx={{ fontSize: 36, color: teal.main }} />
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  color: teal.main,
                  fontSize: { xs: '28px', md: '34px' },
                  mb: 0,
                }}
              >
                Shopping List
              </Typography>
            </Box>
            {shoppingList.length > 0 && (
              <Button
                size="small"
                onClick={handleRecategorize}
                disabled={recategorizing}
                startIcon={recategorizing ? <CircularProgress size={16} /> : <AutoAwesome sx={{ fontSize: 16 }} />}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '12px',
                  textTransform: 'none',
                  color: teal.main,
                  border: `1px solid ${teal.main}`,
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  '&:hover': {
                    bgcolor: teal.bg,
                    border: `1px solid ${teal.dark}`,
                  },
                  '&:disabled': {
                    color: darkGray.light,
                    border: `1px solid ${gray.light}`,
                  },
                }}
              >
                {recategorizing ? 'Analyzing...' : 'AI Categorize'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.main,
              }}
            >
              {uncheckedItems.length > 0
                ? `${uncheckedItems.length} item${uncheckedItems.length !== 1 ? 's' : ''} to buy`
                : 'Your shopping list is empty'}
            </Typography>
            {uncheckedItems.length > 0 && (
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setSortBy(newValue);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '11px',
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    border: `1px solid ${gray.light}`,
                    color: gray.main,
                    '&.Mui-selected': {
                      bgcolor: teal.main,
                      color: 'white',
                      border: `1px solid ${teal.main}`,
                      '&:hover': {
                        bgcolor: teal.dark,
                      },
                    },
                    '&:hover': {
                      bgcolor: ui.borderLight,
                    },
                  },
                }}
              >
                <ToggleButton value="default">
                  <ViewList sx={{ fontSize: 16, mr: 0.5 }} />
                  Default
                </ToggleButton>
                <ToggleButton value="store">
                  <Store sx={{ fontSize: 16, mr: 0.5 }} />
                  Store
                </ToggleButton>
                <ToggleButton value="location">
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  Category
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
        </Box>

        {/* Add Item */}
        <Card
          sx={{
            bgcolor: teal.bg,
            borderRadius: '12px',
            border: `2px solid ${teal.main}`,
            boxShadow: `3px 3px 0px ${teal.light}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {/* Main input row */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: showAdvanced ? 2 : 0 }}>
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                options={itemSuggestions}
                value={newItemName}
                onChange={(event, newValue) => {
                  // Handle both string and object values
                  if (typeof newValue === 'string') {
                    setNewItemName(newValue);
                  } else if (newValue && newValue.name) {
                    setNewItemName(newValue.name);
                  } else {
                    setNewItemName('');
                  }
                }}
                onInputChange={(event, newValue) => {
                  setNewItemName(newValue);
                }}
                filterOptions={(options, state) => {
                  // Only show suggestions if user has typed at least 1 character
                  if (!state.inputValue || state.inputValue.length === 0) {
                    return [];
                  }
                  // Filter options based on input
                  return options.filter((option) =>
                    option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                  );
                }}
                getOptionLabel={(option) => {
                  // Handle both string and object options
                  if (typeof option === 'string') return option;
                  return option.name || '';
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {option.name}
                    </Typography>
                    {option.suggestedStore && (
                      <Chip
                        label={option.suggestedStore}
                        size="small"
                        icon={<Store sx={{ fontSize: 12 }} />}
                        sx={{
                          height: '18px',
                          fontSize: '10px',
                          fontFamily: 'Outfit, sans-serif',
                          bgcolor: blue.bg,
                          color: blue.dark,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            color: blue.dark,
                            ml: 0.5,
                          },
                        }}
                      />
                    )}
                  </Box>
                )}
                disabled={addingItem}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add item to shopping list..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showAdvanced) handleAddItem();
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Outfit, sans-serif',
                        bgcolor: white,
                        '& fieldset': { borderColor: teal.light },
                        '&:hover fieldset': { borderColor: teal.main },
                        '&.Mui-focused fieldset': { borderColor: teal.main },
                      },
                    }}
                  />
                )}
              />
              <Button
                variant="outlined"
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  color: teal.main,
                  borderColor: teal.main,
                  bgcolor: white,
                  minWidth: '40px',
                  px: 2,
                  '&:hover': {
                    borderColor: teal.dark,
                    bgcolor: teal.bg,
                  },
                }}
              >
                {showAdvanced ? '−' : '+'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddItem}
                disabled={!newItemName.trim() || addingItem}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  color: teal.main,
                  borderColor: teal.main,
                  px: 2,
                  '&:hover': {
                    borderColor: teal.dark,
                    bgcolor: teal.bg,
                  },
                }}
              >
                Add
              </Button>
            </Box>

            {/* Advanced options */}
            {showAdvanced && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Quantity (e.g., 2x, 1 lb)"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    disabled={addingItem}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Outfit, sans-serif',
                        bgcolor: white,
                        '& fieldset': { borderColor: teal.light },
                        '&:hover fieldset': { borderColor: teal.main },
                        '&.Mui-focused fieldset': { borderColor: teal.main },
                      },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    disabled={addingItem}
                    SelectProps={{
                      native: true,
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Outfit, sans-serif',
                        bgcolor: white,
                        '& fieldset': { borderColor: teal.light },
                        '&:hover fieldset': { borderColor: teal.main },
                        '&.Mui-focused fieldset': { borderColor: teal.main },
                      },
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </TextField>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Notes (e.g., organic, brand preference)"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  disabled={addingItem}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Outfit, sans-serif',
                      bgcolor: white,
                      '& fieldset': { borderColor: teal.light },
                      '&:hover fieldset': { borderColor: teal.main },
                      '&.Mui-focused fieldset': { borderColor: teal.main },
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {shoppingList.length === 0 ? (
          <Card
            sx={{
              bgcolor: amber.bg,
              borderRadius: '16px',
              border: `2px solid ${amber.main}`,
              boxShadow: `3px 3px 0px ${amber.light}`,
              p: 5,
              textAlign: 'center',
            }}
          >
            <ShoppingBag sx={{ fontSize: 56, color: amber.main, mb: 2 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: brown.main,
                mb: 1,
                fontSize: '20px',
              }}
            >
              No Items Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.dark,
              }}
            >
              Add items manually or select ingredients from recipes to get started!
            </Typography>
          </Card>
        ) : (
          <>
            {/* Conditional Rendering based on sortBy */}
            {sortBy === 'default' && (
              <>
                {/* From Recipes */}
                {fromRecipes.length > 0 && (
              <Card
                sx={{
                  bgcolor: white,
                  borderRadius: '12px',
                  border: `2px solid ${ui.border}`,
                  boxShadow: `3px 3px 0px ${ui.border}`,
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Restaurant sx={{ fontSize: 18, color: amber.main }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: brown.main,
                        fontSize: '15px',
                      }}
                    >
                      From Recipes
                    </Typography>
                  </Box>

                  {fromRecipes.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: `1px solid ${ui.borderLight}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: teal.main,
                            '&.Mui-checked': { color: teal.main },
                            py: 0.5,
                            mt: -0.5,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: darkGray.darker,
                                fontSize: '13px',
                                fontWeight: 500,
                                textDecoration: item.checked ? 'line-through' : 'none',
                              }}
                            >
                              {item.name}
                            </Typography>
                            {item.quantity && (
                              <Chip
                                label={item.quantity}
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '11px',
                                  fontFamily: 'Outfit, sans-serif',
                                  bgcolor: amber.bg,
                                  color: brown.dark,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {item.category && item.category !== 'other' && (() => {
                              const categoryInfo = categories.find((c) => c.value === item.category);
                              return categoryInfo ? (
                                <Chip
                                  label={categoryInfo.label}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '11px',
                                    fontFamily: 'Outfit, sans-serif',
                                    bgcolor: `${categoryInfo.color}15`,
                                    color: categoryInfo.color,
                                    fontWeight: 500,
                                  }}
                                />
                              ) : null;
                            })()}
                            {item.estimatedPrice && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: gray.main,
                                  fontSize: '11px',
                                  fontWeight: 500,
                                }}
                              >
                                ~${item.estimatedPrice.toFixed(2)}
                              </Typography>
                            )}
                            {(() => {
                              const suggestedStore = getSuggestedStore(item.name);
                              return suggestedStore ? (
                                <Chip
                                  label={suggestedStore}
                                  icon={<Store sx={{ fontSize: 14 }} />}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '10px',
                                    fontFamily: 'Outfit, sans-serif',
                                    bgcolor: blue.bg,
                                    color: blue.dark,
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                      color: blue.dark,
                                    },
                                  }}
                                />
                              ) : null;
                            })()}
                          </Box>
                          {item.notes && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: gray.main,
                                fontSize: '11px',
                                fontStyle: 'italic',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              Note: {item.notes}
                            </Typography>
                          )}
                          {item.fromRecipe && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: gray.main,
                                fontSize: '11px',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              from {item.fromRecipe}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{ color: red.main }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Manual Items */}
            {manualItems.length > 0 && (
              <Card
                sx={{
                  bgcolor: white,
                  borderRadius: '12px',
                  border: `2px solid ${ui.border}`,
                  boxShadow: `3px 3px 0px ${ui.border}`,
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <ShoppingCart sx={{ fontSize: 18, color: teal.main }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: teal.main,
                        fontSize: '15px',
                      }}
                    >
                      Other Items
                    </Typography>
                  </Box>

                  {manualItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: `1px solid ${ui.borderLight}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: teal.main,
                            '&.Mui-checked': { color: teal.main },
                            py: 0.5,
                            mt: -0.5,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: darkGray.darker,
                                fontSize: '13px',
                                fontWeight: 500,
                                textDecoration: item.checked ? 'line-through' : 'none',
                              }}
                            >
                              {item.name}
                            </Typography>
                            {item.quantity && (
                              <Chip
                                label={item.quantity}
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '11px',
                                  fontFamily: 'Outfit, sans-serif',
                                  bgcolor: amber.bg,
                                  color: brown.dark,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {item.category && item.category !== 'other' && (() => {
                              const categoryInfo = categories.find((c) => c.value === item.category);
                              return categoryInfo ? (
                                <Chip
                                  label={categoryInfo.label}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '11px',
                                    fontFamily: 'Outfit, sans-serif',
                                    bgcolor: `${categoryInfo.color}15`,
                                    color: categoryInfo.color,
                                    fontWeight: 500,
                                  }}
                                />
                              ) : null;
                            })()}
                            {item.estimatedPrice && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: gray.main,
                                  fontSize: '11px',
                                  fontWeight: 500,
                                }}
                              >
                                ~${item.estimatedPrice.toFixed(2)}
                              </Typography>
                            )}
                            {(() => {
                              const suggestedStore = getSuggestedStore(item.name);
                              return suggestedStore ? (
                                <Chip
                                  label={suggestedStore}
                                  icon={<Store sx={{ fontSize: 14 }} />}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '10px',
                                    fontFamily: 'Outfit, sans-serif',
                                    bgcolor: blue.bg,
                                    color: blue.dark,
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                      color: blue.dark,
                                    },
                                  }}
                                />
                              ) : null;
                            })()}
                          </Box>
                          {item.notes && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: gray.main,
                                fontSize: '11px',
                                fontStyle: 'italic',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              Note: {item.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{ color: red.main }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
              </>
            )}

            {/* Store View */}
            {sortBy === 'store' && (
              <>
                {Object.entries(groupedByStore)
                  .sort(([storeA], [storeB]) => storeA.localeCompare(storeB))
                  .map(([store, items]) => (
                    <Card
                      key={store}
                      sx={{
                        bgcolor: white,
                        borderRadius: '12px',
                        border: `2px solid ${ui.border}`,
                        boxShadow: `3px 3px 0px ${ui.border}`,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Store sx={{ fontSize: 18, color: blue.main }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              color: blue.dark,
                              fontSize: '15px',
                            }}
                          >
                            {store}
                          </Typography>
                          <Chip
                            label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              height: '20px',
                              fontSize: '11px',
                              fontFamily: 'Outfit, sans-serif',
                              bgcolor: blue.bg,
                              color: blue.dark,
                              fontWeight: 500,
                            }}
                          />
                        </Box>

                        {items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 0.75,
                              borderBottom: `1px solid ${ui.borderLight}`,
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                              <Checkbox
                                checked={item.checked}
                                onChange={() => handleToggleChecked(item.id, item.checked)}
                                sx={{
                                  color: teal.main,
                                  '&.Mui-checked': { color: teal.main },
                                  py: 0.5,
                                  mt: -0.5,
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'Outfit, sans-serif',
                                      color: darkGray.darker,
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      textDecoration: item.checked ? 'line-through' : 'none',
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  {item.quantity && (
                                    <Chip
                                      label={item.quantity}
                                      size="small"
                                      sx={{
                                        height: '20px',
                                        fontSize: '11px',
                                        fontFamily: 'Outfit, sans-serif',
                                        bgcolor: amber.bg,
                                        color: brown.dark,
                                        fontWeight: 500,
                                      }}
                                    />
                                  )}
                                  {item.category && item.category !== 'other' && (() => {
                                    const categoryInfo = categories.find((c) => c.value === item.category);
                                    return categoryInfo ? (
                                      <Chip
                                        label={categoryInfo.label}
                                        size="small"
                                        sx={{
                                          height: '20px',
                                          fontSize: '10px',
                                          fontFamily: 'Outfit, sans-serif',
                                          bgcolor: categoryInfo.color,
                                          color: white,
                                          fontWeight: 500,
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  {item.estimatedPrice && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontFamily: 'Outfit, sans-serif',
                                        color: teal.main,
                                        fontSize: '11px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      ~${item.estimatedPrice.toFixed(2)}
                                    </Typography>
                                  )}
                                </Box>
                                {item.notes && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'Outfit, sans-serif',
                                      color: gray.main,
                                      fontSize: '11px',
                                      fontStyle: 'italic',
                                      display: 'block',
                                      mt: 0.25,
                                    }}
                                  >
                                    Note: {item.notes}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(item.id)}
                              sx={{ color: red.main }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
              </>
            )}

            {/* Location/Aisle View */}
            {sortBy === 'location' && (
              <>
                {Object.entries(groupedByLocation)
                  .sort(([catA], [catB]) => {
                    const orderA = categories.findIndex((c) => c.value === catA);
                    const orderB = categories.findIndex((c) => c.value === catB);
                    return orderA - orderB;
                  })
                  .map(([category, items]) => {
                    const categoryInfo = categories.find((c) => c.value === category);
                    if (!categoryInfo) return null;

                    return (
                      <Card
                        key={category}
                        sx={{
                          bgcolor: 'white',
                          borderRadius: '12px',
                          border: `2px solid ${ui.border}`,
                          boxShadow: `3px 3px 0px ${ui.border}`,
                          mb: 2,
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            {categoryInfo.icon && (function() {
                              const IconComponent = categoryInfo.icon;
                              return <IconComponent sx={{ fontSize: 20, color: categoryInfo.color }} />;
                            })()}
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                                color: darkGray.darker,
                                fontSize: '15px',
                              }}
                            >
                              {categoryInfo.label}
                            </Typography>
                            <Chip
                              label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '11px',
                                fontFamily: 'Outfit, sans-serif',
                                bgcolor: categoryInfo.color,
                                color: white,
                                fontWeight: 500,
                              }}
                            />
                          </Box>

                          {items.map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 0.75,
                                borderBottom: `1px solid ${ui.borderLight}`,
                                '&:last-child': { borderBottom: 'none' },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                                <Checkbox
                                  checked={item.checked}
                                  onChange={() => handleToggleChecked(item.id, item.checked)}
                                  sx={{
                                    color: teal.main,
                                    '&.Mui-checked': { color: teal.main },
                                    py: 0.5,
                                    mt: -0.5,
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontFamily: 'Outfit, sans-serif',
                                        color: darkGray.darker,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        textDecoration: item.checked ? 'line-through' : 'none',
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    {item.quantity && (
                                      <Chip
                                        label={item.quantity}
                                        size="small"
                                        sx={{
                                          height: '20px',
                                          fontSize: '11px',
                                          fontFamily: 'Outfit, sans-serif',
                                          bgcolor: amber.bg,
                                          color: brown.dark,
                                          fontWeight: 500,
                                        }}
                                      />
                                    )}
                                    {item.estimatedPrice && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontFamily: 'Outfit, sans-serif',
                                          color: teal.main,
                                          fontSize: '11px',
                                          fontWeight: 600,
                                        }}
                                      >
                                        ~${item.estimatedPrice.toFixed(2)}
                                      </Typography>
                                    )}
                                    {(() => {
                                      const suggestedStore = getSuggestedStore(item.name);
                                      return suggestedStore ? (
                                        <Chip
                                          label={suggestedStore}
                                          icon={<Store sx={{ fontSize: 14 }} />}
                                          size="small"
                                          sx={{
                                            height: '20px',
                                            fontSize: '10px',
                                            fontFamily: 'Outfit, sans-serif',
                                            bgcolor: blue.bg,
                                            color: blue.dark,
                                            fontWeight: 500,
                                            '& .MuiChip-icon': {
                                              color: blue.dark,
                                            },
                                          }}
                                        />
                                      ) : null;
                                    })()}
                                  </Box>
                                  {item.notes && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontFamily: 'Outfit, sans-serif',
                                        color: gray.main,
                                        fontSize: '11px',
                                        fontStyle: 'italic',
                                        display: 'block',
                                        mt: 0.25,
                                      }}
                                    >
                                      Note: {item.notes}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItem(item.id)}
                                sx={{ color: red.main }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
              </>
            )}

            {/* Completed Items */}
            {checkedItems.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Card
                  sx={{
                    bgcolor: gray.bg,
                    borderRadius: '12px',
                    border: `2px solid ${gray.light}`,
                    boxShadow: `2px 2px 0px ${gray.light}`,
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 18, color: teal.main }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            color: gray.main,
                            fontSize: '15px',
                          }}
                        >
                          Completed ({checkedItems.length})
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={handleClearCompleted}
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '11px',
                          textTransform: 'none',
                          color: gray.main,
                        }}
                      >
                        Clear All
                      </Button>
                    </Box>

                    {checkedItems.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.75,
                          borderBottom: `1px solid ${ui.border}`,
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => handleToggleChecked(item.id, item.checked)}
                            sx={{
                              color: teal.main,
                              '&.Mui-checked': { color: teal.main },
                              py: 0.5,
                              mt: -0.5,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: darkGray.light,
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  textDecoration: 'line-through',
                                }}
                              >
                                {item.name}
                              </Typography>
                              {item.quantity && (
                                <Chip
                                  label={item.quantity}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '11px',
                                    fontFamily: 'Outfit, sans-serif',
                                    bgcolor: ui.borderLight,
                                    color: gray.main,
                                    fontWeight: 500,
                                  }}
                                />
                              )}
                              {item.category && item.category !== 'other' && (() => {
                                const categoryInfo = categories.find((c) => c.value === item.category);
                                return categoryInfo ? (
                                  <Chip
                                    label={categoryInfo.label}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '11px',
                                      fontFamily: 'Outfit, sans-serif',
                                      bgcolor: ui.borderLight,
                                      color: gray.main,
                                      fontWeight: 500,
                                    }}
                                  />
                                ) : null;
                              })()}
                              {item.estimatedPrice && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    color: darkGray.light,
                                    fontSize: '11px',
                                    fontWeight: 500,
                                  }}
                                >
                                  ~${item.estimatedPrice.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                            {item.notes && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: darkGray.light,
                                  fontSize: '11px',
                                  fontStyle: 'italic',
                                  display: 'block',
                                  mt: 0.25,
                                }}
                              >
                                Note: {item.notes}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ color: darkGray.light }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
