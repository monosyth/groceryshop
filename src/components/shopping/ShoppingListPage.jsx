import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Delete,
  Add,
  ShoppingCart,
  Store,
  CheckCircle,
  Restaurant,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import { SkeletonList, ShoppingListItemSkeleton } from '../common/Skeletons';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function ShoppingListPage() {
  const { currentUser } = useAuth();
  const { receipts: allReceipts } = useReceipts();
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [expandedStore, setExpandedStore] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Categories for shopping items
  const categories = [
    { value: 'produce', label: '🥬 Produce', color: '#10B981' },
    { value: 'meat', label: '🥩 Meat & Seafood', color: '#EF4444' },
    { value: 'dairy', label: '🥛 Dairy & Eggs', color: '#3B82F6' },
    { value: 'bakery', label: '🍞 Bakery', color: '#F59E0B' },
    { value: 'frozen', label: '🧊 Frozen', color: '#06B6D4' },
    { value: 'pantry', label: '🥫 Pantry', color: '#8B5CF6' },
    { value: 'beverages', label: '🥤 Beverages', color: '#EC4899' },
    { value: 'snacks', label: '🍿 Snacks', color: '#F97316' },
    { value: 'household', label: '🧹 Household', color: '#6B7280' },
    { value: 'other', label: '📦 Other', color: '#9CA3AF' },
  ];

  // Filter receipts with store info for store suggestions
  const receipts = allReceipts.filter((receipt) => receipt.storeInfo?.name);

  // Fetch shopping list items
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'shoppingList'),
      where('userId', '==', currentUser.uid)
    );

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
  }, [currentUser]);

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

      await addDoc(collection(db, 'shoppingList'), {
        userId: currentUser.uid,
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || null,
        category: newItemCategory,
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

  const uncheckedItems = shoppingList.filter((item) => !item.checked);
  const checkedItems = shoppingList.filter((item) => item.checked);
  const fromRecipes = uncheckedItems.filter((item) => item.fromRecipe);
  const manualItems = uncheckedItems.filter((item) => item.manual);

  if (loading) {
    return (
      <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 4, pb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: '#10B981',
                fontSize: { xs: '28px', md: '34px' },
                mb: 1,
              }}
            >
              🛒 Shopping List
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#78350F',
              }}
            >
              Loading your shopping list...
            </Typography>
          </Box>
          <Card
            sx={{
              bgcolor: 'white',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              boxShadow: '3px 3px 0px #E5E7EB',
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
    <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#10B981',
              fontSize: { xs: '28px', md: '34px' },
              mb: 1,
            }}
          >
            🛒 Shopping List
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: '#78350F',
            }}
          >
            {uncheckedItems.length > 0
              ? `${uncheckedItems.length} item${uncheckedItems.length !== 1 ? 's' : ''} to buy`
              : 'Your shopping list is empty'}
          </Typography>
        </Box>

        {/* Add Item */}
        <Card
          sx={{
            bgcolor: '#F0FDF4',
            borderRadius: '12px',
            border: '2px solid #10B981',
            boxShadow: '3px 3px 0px #6EE7B7',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {/* Main input row */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: showAdvanced ? 2 : 0 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add item to shopping list..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showAdvanced) handleAddItem();
                }}
                disabled={addingItem}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Outfit, sans-serif',
                    bgcolor: 'white',
                    '& fieldset': { borderColor: '#6EE7B7' },
                    '&:hover fieldset': { borderColor: '#10B981' },
                    '&.Mui-focused fieldset': { borderColor: '#10B981' },
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  color: '#10B981',
                  borderColor: '#10B981',
                  bgcolor: 'white',
                  minWidth: '40px',
                  px: 2,
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: '#F0FDF4',
                  },
                }}
              >
                {showAdvanced ? '−' : '+'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddItem}
                disabled={!newItemName.trim() || addingItem}
                sx={{
                  bgcolor: '#10B981',
                  color: 'white',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  border: '2px solid #059669',
                  boxShadow: '2px 2px 0px #059669',
                  px: 3,
                  '&:hover': {
                    bgcolor: '#059669',
                  },
                  '&:disabled': {
                    bgcolor: '#6EE7B7',
                    color: 'white',
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
                        bgcolor: 'white',
                        '& fieldset': { borderColor: '#6EE7B7' },
                        '&:hover fieldset': { borderColor: '#10B981' },
                        '&.Mui-focused fieldset': { borderColor: '#10B981' },
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
                        bgcolor: 'white',
                        '& fieldset': { borderColor: '#6EE7B7' },
                        '&:hover fieldset': { borderColor: '#10B981' },
                        '&.Mui-focused fieldset': { borderColor: '#10B981' },
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
                      bgcolor: 'white',
                      '& fieldset': { borderColor: '#6EE7B7' },
                      '&:hover fieldset': { borderColor: '#10B981' },
                      '&.Mui-focused fieldset': { borderColor: '#10B981' },
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Store Suggestions */}
        {uncheckedItems.length > 0 && (() => {
          const suggestions = getStoreSuggestions();
          if (suggestions.length === 0) return null;

          return (
            <Card
              sx={{
                bgcolor: '#F0FDF4',
                borderRadius: '12px',
                border: '2px solid #10B981',
                boxShadow: '3px 3px 0px #6EE7B7',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#059669',
                    fontSize: '14px',
                    mb: 2,
                  }}
                >
                  🏪 Where to Shop
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {suggestions.map((suggestion, index) => {
                    const isExpanded = expandedStore === suggestion.store;
                    const storeItems = isExpanded ? getItemsForStore(suggestion.store) : [];

                    return (
                      <Box key={index}>
                        <Box
                          onClick={() => setExpandedStore(isExpanded ? null : suggestion.store)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            bgcolor: 'white',
                            border: '2px solid #6EE7B7',
                            borderRadius: '8px',
                            px: 1.5,
                            py: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#F0FDF4',
                              borderColor: '#10B981',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Store sx={{ fontSize: 18, color: '#059669' }} />
                            <Typography
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                                color: '#059669',
                                fontSize: '13px',
                              }}
                            >
                              {suggestion.store}
                            </Typography>
                            <Chip
                              label={`${suggestion.count} item${suggestion.count !== 1 ? 's' : ''}`}
                              size="small"
                              sx={{
                                bgcolor: '#6EE7B7',
                                color: '#059669',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                                fontSize: '11px',
                                height: '22px',
                              }}
                            />
                          </Box>
                          {isExpanded ? (
                            <ExpandLess sx={{ fontSize: 20, color: '#059669' }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: 20, color: '#059669' }} />
                          )}
                        </Box>

                        {isExpanded && storeItems.length > 0 && (
                          <Box
                            sx={{
                              mt: 1,
                              ml: 2,
                              pl: 2,
                              borderLeft: '3px solid #6EE7B7',
                            }}
                          >
                            {storeItems.map((item) => (
                              <Box
                                key={item.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  py: 0.75,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '13px',
                                    color: '#374151',
                                  }}
                                >
                                  • {item.name}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          );
        })()}

        {shoppingList.length === 0 ? (
          <Card
            sx={{
              bgcolor: '#FEF3C7',
              borderRadius: '16px',
              border: '2px solid #F59E0B',
              boxShadow: '3px 3px 0px #FCD34D',
              p: 5,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 2 }}>🛍️</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#78350F',
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
                color: '#92400E',
              }}
            >
              Add items manually or select ingredients from recipes to get started!
            </Typography>
          </Card>
        ) : (
          <>
            {/* From Recipes */}
            {fromRecipes.length > 0 && (
              <Card
                sx={{
                  bgcolor: 'white',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  boxShadow: '3px 3px 0px #E5E7EB',
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Restaurant sx={{ fontSize: 18, color: '#F59E0B' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#78350F',
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
                        borderBottom: '1px solid #F3F4F6',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: '#10B981',
                            '&.Mui-checked': { color: '#10B981' },
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
                                color: '#1F2937',
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
                                  bgcolor: '#FEF3C7',
                                  color: '#92400E',
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
                                  color: '#6B7280',
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
                                color: '#6B7280',
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
                                color: '#6B7280',
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
                        sx={{ color: '#EF4444' }}
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
                  bgcolor: 'white',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  boxShadow: '3px 3px 0px #E5E7EB',
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <ShoppingCart sx={{ fontSize: 18, color: '#10B981' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#10B981',
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
                        borderBottom: '1px solid #F3F4F6',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: '#10B981',
                            '&.Mui-checked': { color: '#10B981' },
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
                                color: '#1F2937',
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
                                  bgcolor: '#FEF3C7',
                                  color: '#92400E',
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
                                  color: '#6B7280',
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
                                color: '#6B7280',
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
                        sx={{ color: '#EF4444' }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed Items */}
            {checkedItems.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Card
                  sx={{
                    bgcolor: '#F9FAFB',
                    borderRadius: '12px',
                    border: '2px solid #D1D5DB',
                    boxShadow: '2px 2px 0px #D1D5DB',
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            color: '#6B7280',
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
                          color: '#6B7280',
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
                          borderBottom: '1px solid #E5E7EB',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', flex: 1 }}>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => handleToggleChecked(item.id, item.checked)}
                            sx={{
                              color: '#10B981',
                              '&.Mui-checked': { color: '#10B981' },
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
                                  color: '#9CA3AF',
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
                                    bgcolor: '#F3F4F6',
                                    color: '#6B7280',
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
                                      bgcolor: '#F3F4F6',
                                      color: '#6B7280',
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
                                    color: '#9CA3AF',
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
                                  color: '#9CA3AF',
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
                          sx={{ color: '#9CA3AF' }}
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
