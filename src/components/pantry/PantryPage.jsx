import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete,
  Add,
  Kitchen,
  Receipt as ReceiptIcon,
  CameraAlt,
  Edit as EditIcon,
  Upload,
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
} from 'firebase/firestore';
import { db } from '../../firebase';
import { analyzePantryPhoto, categorizeShoppingItem } from '../../services/geminiService';
import { addPhotoItemsToPantry } from '../../services/pantryService';

export default function PantryPage() {
  const { currentUser } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [recategorizing, setRecategorizing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Categories for pantry items (same as shopping list)
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

  // Fetch pantry items
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'pantry'), where('userId', '==', currentUser.uid));

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
        // Sort by creation date descending
        items.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        setPantryItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pantry:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Add new pantry item manually
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an item name',
        severity: 'warning',
      });
      return;
    }

    setAddingItem(true);
    try {
      // Auto-categorize with AI
      const category = await categorizeShoppingItem(newItemName.trim());

      await addDoc(collection(db, 'pantry'), {
        userId: currentUser.uid,
        name: newItemName.trim().toLowerCase(),
        category: category,
        source: 'manual',
        createdAt: serverTimestamp(),
      });

      setNewItemName('');
      setSnackbar({
        open: true,
        message: 'Item added to pantry!',
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

  // Handle photo upload/camera
  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];

        try {
          const ingredients = await analyzePantryPhoto(base64);

          // Add ingredients to pantry collection
          if (ingredients.length > 0) {
            try {
              const addedCount = await addPhotoItemsToPantry(currentUser.uid, ingredients);
              setSnackbar({
                open: true,
                message: `Found ${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''} and added ${addedCount} to pantry!`,
                severity: 'success',
              });
            } catch (pantryError) {
              console.error('Error adding to pantry:', pantryError);
              setSnackbar({
                open: true,
                message: `Found ${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''}, but couldn't add to pantry`,
                severity: 'warning',
              });
            }
          } else {
            setSnackbar({
              open: true,
              message: 'No ingredients found in photo',
              severity: 'info',
            });
          }
        } catch (error) {
          console.error('Error analyzing photo:', error);
          setSnackbar({
            open: true,
            message: error.message.includes('API')
              ? 'Please add your Gemini API key to use this feature'
              : 'Failed to analyze photo. Please try again.',
            severity: 'error',
          });
        } finally {
          setAnalyzingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setAnalyzingPhoto(false);
      setSnackbar({
        open: true,
        message: 'Failed to read image file',
        severity: 'error',
      });
    }
  };

  // Delete pantry item
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'pantry', itemId));
      setSnackbar({
        open: true,
        message: 'Item removed from pantry',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete item',
        severity: 'error',
      });
    }
  };

  // Handle recategorize items
  const handleRecategorize = async () => {
    // Get all items that need recategorization (category is 'other' or not set)
    const itemsToRecategorize = pantryItems.filter(
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
            await updateDoc(doc(db, 'pantry', item.id), {
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

  // Group items by category
  const groupedItems = pantryItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories in a logical order
  const categoryOrder = ['produce', 'meat', 'dairy', 'bakery', 'frozen', 'pantry', 'beverages', 'snacks', 'household', 'other'];
  const sortedCategories = categoryOrder.filter((cat) => groupedItems[cat] && groupedItems[cat].length > 0);

  // Get source label
  const getSourceLabel = (source, item) => {
    switch (source) {
      case 'receipt':
        return item.storeName || 'Receipt';
      case 'photo':
        return 'Photo';
      case 'manual':
        return 'Manual';
      default:
        return 'Unknown';
    }
  };

  // Get source icon
  const getSourceIcon = (source) => {
    switch (source) {
      case 'receipt':
        return <ReceiptIcon sx={{ fontSize: 16 }} />;
      case 'photo':
        return <CameraAlt sx={{ fontSize: 16 }} />;
      case 'manual':
        return <EditIcon sx={{ fontSize: 16 }} />;
      default:
        return <Kitchen sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#10B981' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: '#10B981',
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              🥫 My Pantry
            </Typography>
            {pantryItems.length > 0 && (
              <Button
                size="small"
                onClick={handleRecategorize}
                disabled={recategorizing}
                startIcon={recategorizing ? <CircularProgress size={16} /> : null}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '12px',
                  textTransform: 'none',
                  color: '#10B981',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  '&:hover': {
                    bgcolor: '#F0FDF4',
                    border: '1px solid #059669',
                  },
                  '&:disabled': {
                    color: '#9CA3AF',
                    border: '1px solid #D1D5DB',
                  },
                }}
              >
                {recategorizing ? 'Analyzing...' : '✨ AI Categorize'}
              </Button>
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              color: '#059669',
              fontSize: '16px',
            }}
          >
            Your current inventory - {pantryItems.length} item{pantryItems.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Add Item Section */}
        <Card
          sx={{
            bgcolor: '#ECFDF5',
            borderRadius: '12px',
            border: '2px solid #10B981',
            boxShadow: '3px 3px 0px #6EE7B7',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Add item to pantry..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                disabled={addingItem}
                sx={{
                  flex: '1 1 250px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={addingItem ? <CircularProgress size={16} /> : <Add />}
                onClick={handleAddItem}
                disabled={addingItem}
                sx={{
                  bgcolor: '#10B981',
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    bgcolor: '#059669',
                  },
                }}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                startIcon={analyzingPhoto ? <CircularProgress size={16} /> : <CameraAlt />}
                onClick={() => cameraInputRef.current?.click()}
                disabled={analyzingPhoto}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  color: '#10B981',
                  borderColor: '#10B981',
                  px: 2,
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: '#F0FDF4',
                  },
                }}
              >
                Photo
              </Button>
              <Button
                variant="outlined"
                startIcon={analyzingPhoto ? <CircularProgress size={16} /> : <Upload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingPhoto}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  color: '#10B981',
                  borderColor: '#10B981',
                  px: 2,
                  '&:hover': {
                    borderColor: '#059669',
                    bgcolor: '#F0FDF4',
                  },
                }}
              >
                Upload
              </Button>
            </Box>

            {analyzingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={20} sx={{ color: '#10B981' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#059669',
                    fontSize: '13px',
                  }}
                >
                  Analyzing photo...
                </Typography>
              </Box>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </CardContent>
        </Card>

        {/* Pantry Items */}
        {pantryItems.length === 0 ? (
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
            <Box sx={{ fontSize: '56px', mb: 2 }}>🥫</Box>
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
              Your Pantry is Empty
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#92400E',
              }}
            >
              Add items manually, take a pantry photo, or upload receipts to build your inventory!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {sortedCategories.map((categoryValue) => {
              const categoryInfo = categories.find((c) => c.value === categoryValue);
              const items = groupedItems[categoryValue];

              return (
                <Grid item xs={12} md={6} key={categoryValue}>
                  <Card
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: '12px',
                      border: '2px solid #E5E7EB',
                      boxShadow: '2px 2px 0px #D1D5DB',
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            color: categoryInfo.color,
                            fontSize: '16px',
                          }}
                        >
                          {categoryInfo.label}
                        </Typography>
                        <Chip
                          label={items.length}
                          size="small"
                          sx={{
                            height: '20px',
                            fontSize: '11px',
                            fontFamily: 'Outfit, sans-serif',
                            bgcolor: `${categoryInfo.color}15`,
                            color: categoryInfo.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              borderRadius: '8px',
                              bgcolor: '#F9FAFB',
                              '&:hover': {
                                bgcolor: '#F3F4F6',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  bgcolor: '#E5E7EB',
                                  color: '#6B7280',
                                }}
                              >
                                {getSourceIcon(item.source)}
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: '13px',
                                  color: '#374151',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(item.id)}
                              sx={{
                                color: '#EF4444',
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: '#FEE2E2',
                                },
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: 'Outfit, sans-serif' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
