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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete,
  Add,
  ShoppingCart,
  Store,
  Restaurant,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
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
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function ShoppingListPage() {
  const { currentUser } = useAuth();
  const [shoppingList, setShoppingList] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [suggestedStores, setSuggestedStores] = useState([]);

  // Fetch shopping list items
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'shoppingList'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
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

  // Fetch receipts for store suggestions
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'receipts'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const receiptData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.storeInfo?.name) {
          receiptData.push({
            id: doc.id,
            storeName: data.storeInfo.name,
            items: data.items || [],
          });
        }
      });
      setReceipts(receiptData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle add item
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    setAddingItem(true);
    try {
      await addDoc(collection(db, 'shoppingList'), {
        userId: currentUser.uid,
        name: newItemName.trim(),
        checked: false,
        manual: true,
        createdAt: serverTimestamp(),
      });

      setNewItemName('');
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
        const hasItem = receipt.items.some((receiptItem) =>
          receiptItem.name?.toLowerCase().includes(listItem.name.toLowerCase()) ||
          listItem.name.toLowerCase().includes(receiptItem.name?.toLowerCase())
        );

        if (hasItem) {
          storeCounts[receipt.storeName] = (storeCounts[receipt.storeName] || 0) + 1;
        }
      });
    });

    const suggestions = Object.entries(storeCounts)
      .map(([store, count]) => ({ store, count }))
      .sort((a, b) => b.count - a.count);

    return suggestions;
  };

  const handleShowStores = () => {
    const suggestions = getStoreSuggestions();
    setSuggestedStores(suggestions);
    setStoreDialogOpen(true);
  };

  const uncheckedItems = shoppingList.filter((item) => !item.checked);
  const checkedItems = shoppingList.filter((item) => item.checked);
  const fromRecipes = uncheckedItems.filter((item) => item.fromRecipe);
  const manualItems = uncheckedItems.filter((item) => item.manual);

  if (loading) {
    return (
      <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#15803D' }} />
          </Box>
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
              color: '#15803D',
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
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add item to shopping list..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddItem();
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
          </CardContent>
        </Card>

        {/* Store Suggestions Button */}
        {uncheckedItems.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Store />}
              onClick={handleShowStores}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'none',
                color: '#7C3AED',
                borderColor: '#7C3AED',
                border: '2px solid #7C3AED',
                '&:hover': {
                  bgcolor: '#F5F3FF',
                  borderColor: '#6D28D9',
                  border: '2px solid #6D28D9',
                },
              }}
            >
              Where to Shop
            </Button>
          </Box>
        )}

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
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: '#10B981',
                            '&.Mui-checked': { color: '#10B981' },
                            py: 0.5,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              color: '#1F2937',
                              fontSize: '13px',
                              textDecoration: item.checked ? 'line-through' : 'none',
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.fromRecipe && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: '#6B7280',
                                fontSize: '11px',
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
                        color: '#15803D',
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
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Checkbox
                          checked={item.checked}
                          onChange={() => handleToggleChecked(item.id, item.checked)}
                          sx={{
                            color: '#10B981',
                            '&.Mui-checked': { color: '#10B981' },
                            py: 0.5,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            color: '#1F2937',
                            fontSize: '13px',
                            textDecoration: item.checked ? 'line-through' : 'none',
                          }}
                        >
                          {item.name}
                        </Typography>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => handleToggleChecked(item.id, item.checked)}
                            sx={{
                              color: '#10B981',
                              '&.Mui-checked': { color: '#10B981' },
                              py: 0.5,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              color: '#9CA3AF',
                              fontSize: '13px',
                              textDecoration: 'line-through',
                            }}
                          >
                            {item.name}
                          </Typography>
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

        {/* Store Suggestions Dialog */}
        <Dialog
          open={storeDialogOpen}
          onClose={() => setStoreDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#15803D',
            }}
          >
            🏪 Where to Shop
          </DialogTitle>
          <DialogContent>
            {suggestedStores.length === 0 ? (
              <Typography
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  color: '#6B7280',
                  fontSize: '14px',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                No store suggestions available yet. Upload more receipts to get personalized recommendations!
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    fontSize: '13px',
                    mb: 2,
                  }}
                >
                  Based on your shopping history, here's where you can find your items:
                </Typography>
                {suggestedStores.map((suggestion, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1.5,
                      bgcolor: '#F0FDF4',
                      border: '1px solid #6EE7B7',
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Store sx={{ fontSize: 20, color: '#059669' }} />
                          <Typography
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              color: '#059669',
                              fontSize: '14px',
                            }}
                          >
                            {suggestion.store}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${suggestion.count} item${suggestion.count !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{
                            bgcolor: '#6EE7B7',
                            color: '#059669',
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setStoreDialogOpen(false)}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                color: '#15803D',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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
