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
  Undo,
  Leaf,
  LocalFlorist,
  LocalDining,
  BakeryDining,
  AcUnit,
  LocalBar,
  FastfoodRounded,
  CleaningServices,
  Package,
  AutoAwesome,
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
import { teal, blue, purple, pink, orange, amber, red, cyan, gray, darkGray, brown, ui, white, cream } from '../../theme/colors';

export default function PantryPage() {
  const { currentUser } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [recategorizing, setRecategorizing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Undo system (stores last 30 operations)
  const [undoStack, setUndoStack] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Categories for pantry items (same as shopping list)
  const categories = [
    { value: 'produce', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Leaf sx={{ fontSize: 16 }} /> Produce</Box>, color: teal.main },
    { value: 'meat', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalDining sx={{ fontSize: 16 }} /> Meat & Seafood</Box>, color: red.main },
    { value: 'dairy', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalDining sx={{ fontSize: 16 }} /> Dairy & Eggs</Box>, color: blue.main },
    { value: 'bakery', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><BakeryDining sx={{ fontSize: 16 }} /> Bakery</Box>, color: amber.main },
    { value: 'frozen', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AcUnit sx={{ fontSize: 16 }} /> Frozen</Box>, color: cyan.main },
    { value: 'pantry', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Kitchen sx={{ fontSize: 16 }} /> Pantry</Box>, color: purple.main },
    { value: 'beverages', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalBar sx={{ fontSize: 16 }} /> Beverages</Box>, color: pink.main },
    { value: 'snacks', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><FastfoodRounded sx={{ fontSize: 16 }} /> Snacks</Box>, color: orange.main },
    { value: 'household', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CleaningServices sx={{ fontSize: 16 }} /> Household</Box>, color: gray.main },
    { value: 'other', label: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Package sx={{ fontSize: 16 }} /> Other</Box>, color: darkGray.light },
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

  // Open delete confirmation dialog
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Confirmed delete - adds to undo stack
  const handleConfirmedDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Add to undo stack before deleting
      const operation = {
        type: 'delete',
        item: { ...itemToDelete },
        timestamp: Date.now(),
      };

      setUndoStack((prev) => {
        const newStack = [operation, ...prev];
        return newStack.slice(0, 30); // Keep only last 30 operations
      });

      await deleteDoc(doc(db, 'pantry', itemToDelete.id));
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
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle edit item click
  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditDialogOpen(true);
  };

  // Handle save edited name with AI recategorization
  const handleSaveEdit = async () => {
    if (!editingItemId || !editedName.trim()) return;

    setSavingEdit(true);
    try {
      // Find the original item for undo
      const originalItem = pantryItems.find((item) => item.id === editingItemId);

      // Recategorize with AI using the new name
      const newCategory = await categorizeShoppingItem(editedName.trim());

      await updateDoc(doc(db, 'pantry', editingItemId), {
        name: editedName.trim(),
        category: newCategory,
      });

      // Add to undo stack
      const operation = {
        type: 'edit',
        itemId: editingItemId,
        oldData: {
          name: originalItem.name,
          category: originalItem.category,
        },
        timestamp: Date.now(),
      };

      setUndoStack((prev) => {
        const newStack = [operation, ...prev];
        return newStack.slice(0, 30);
      });

      setSnackbar({
        open: true,
        message: 'Item updated and recategorized successfully',
        severity: 'success',
      });

      setEditDialogOpen(false);
      setEditingItemId(null);
      setEditedName('');
    } catch (error) {
      console.error('Error updating item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update item',
        severity: 'error',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle undo
  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const [lastOperation, ...restStack] = undoStack;

    try {
      if (lastOperation.type === 'delete') {
        // Restore deleted item
        const { item } = lastOperation;
        const { id, ...itemData } = item;
        await addDoc(collection(db, 'pantry'), itemData);

        setSnackbar({
          open: true,
          message: `Restored: ${item.name}`,
          severity: 'success',
        });
      } else if (lastOperation.type === 'edit') {
        // Revert edit
        await updateDoc(doc(db, 'pantry', lastOperation.itemId), lastOperation.oldData);

        setSnackbar({
          open: true,
          message: 'Edit undone',
          severity: 'success',
        });
      }

      // Remove the operation from stack
      setUndoStack(restStack);
    } catch (error) {
      console.error('Error undoing operation:', error);
      setSnackbar({
        open: true,
        message: 'Failed to undo',
        severity: 'error',
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingItemId(null);
    setEditedName('');
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

  // Get source icon with distinct colors
  const getSourceIcon = (source) => {
    switch (source) {
      case 'receipt':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: blue.bg,
              border: `1.5px solid ${blue.main}`,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 16, color: blue.dark }} />
          </Box>
        );
      case 'photo':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: red.bg,
              border: `1.5px solid ${red.main}`,
            }}
          >
            <CameraAlt sx={{ fontSize: 16, color: red.darker }} />
          </Box>
        );
      case 'manual':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: teal.bg,
              border: `1.5px solid ${teal.main}`,
            }}
          >
            <EditIcon sx={{ fontSize: 16, color: teal.darker }} />
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: ui.borderLight,
              border: `1.5px solid ${gray.main}`,
            }}
          >
            <Kitchen sx={{ fontSize: 16, color: darkGray.dark }} />
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: teal.main }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Kitchen sx={{ fontSize: { xs: 32, md: 40 }, color: teal.main }} />
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  color: teal.main,
                  fontSize: { xs: '28px', md: '34px' },
                }}
              >
                My Pantry
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {undoStack.length > 0 && (
                <Button
                  size="small"
                  onClick={handleUndo}
                  startIcon={<Undo />}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '12px',
                    textTransform: 'none',
                    color: amber.main,
                    border: `1px solid ${amber.main}`,
                    borderRadius: '8px',
                    px: 2,
                    py: 0.75,
                    '&:hover': {
                      bgcolor: teal.bg,
                      border: `1px solid ${amber.dark}`,
                    },
                  }}
                >
                  Undo ({undoStack.length})
                </Button>
              )}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AutoAwesome sx={{ fontSize: 16 }} />
                    {recategorizing ? 'Analyzing...' : 'AI Categorize'}
                  </Box>
                </Button>
              )}
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              color: teal.dark,
              fontSize: '16px',
            }}
          >
            Your current inventory - {pantryItems.length} item{pantryItems.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Add Item Section */}
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
                    bgcolor: white,
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
                  bgcolor: teal.main,
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    bgcolor: teal.dark,
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
                  color: teal.main,
                  borderColor: teal.main,
                  px: 2,
                  '&:hover': {
                    borderColor: teal.dark,
                    bgcolor: teal.bg,
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
                  color: teal.main,
                  borderColor: teal.main,
                  px: 2,
                  '&:hover': {
                    borderColor: teal.dark,
                    bgcolor: teal.bg,
                  },
                }}
              >
                Upload
              </Button>
            </Box>

            {analyzingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={20} sx={{ color: teal.main }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: teal.dark,
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
              bgcolor: amber.bg,
              borderRadius: '16px',
              border: `2px solid ${amber.main}`,
              boxShadow: `3px 3px 0px ${amber.light}`,
              p: 5,
              textAlign: 'center',
            }}
          >
            <Kitchen sx={{ fontSize: 56, color: brown.main, mb: 2 }} />
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
              Your Pantry is Empty
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.dark,
              }}
            >
              Add items manually, take a pantry photo, or upload receipts to build your inventory!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {sortedCategories.map((categoryValue) => {
              const categoryInfo = categories.find((c) => c.value === categoryValue);
              const items = groupedItems[categoryValue];

              return (
                <Grid item xs={12} sm={6} md={6} lg={4} key={categoryValue}>
                  <Card
                    sx={{
                      bgcolor: white,
                      borderRadius: '12px',
                      border: `2px solid ${ui.border}`,
                      boxShadow: `2px 2px 0px ${ui.borderLight}`,
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
                              bgcolor: gray.bg,
                              '&:hover': {
                                bgcolor: gray.light,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              {getSourceIcon(item.source)}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: '13px',
                                  color: darkGray.dark,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(item)}
                              sx={{
                                color: teal.main,
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: teal.bg,
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(item)}
                              sx={{
                                color: red.main,
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: red.bg,
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Item?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{itemToDelete?.name}</strong>? You can undo this action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmedDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Item Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !savingEdit) {
                  handleSaveEdit();
                }
              }}
              helperText="Update the item name - will automatically recategorize with AI"
              disabled={savingEdit}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} disabled={savingEdit}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editedName.trim() || savingEdit}
          >
            {savingEdit ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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
