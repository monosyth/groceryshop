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
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { analyzePantryPhoto } from '../../services/geminiService';
import { addPhotoItemsToPantry } from '../../services/pantryService';

export default function PantryPage() {
  const { currentUser } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
      await addDoc(collection(db, 'pantry'), {
        userId: currentUser.uid,
        name: newItemName.trim().toLowerCase(),
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

  // Group items by source
  const groupedItems = pantryItems.reduce((acc, item) => {
    const source = item.source || 'unknown';
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(item);
    return acc;
  }, {});

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
            <CircularProgress size={60} sx={{ color: '#15803D' }} />
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
            🥫 My Pantry
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              color: '#166534',
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Add item to pantry..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                disabled={addingItem}
                sx={{
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
            </Box>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        <Card
          sx={{
            bgcolor: '#FFEDD5',
            borderRadius: '12px',
            border: '2px solid #F97316',
            boxShadow: '3px 3px 0px #FCD34D',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#EA580C',
                fontSize: '16px',
                mb: 1.5,
              }}
            >
              📸 Add Items from Photo
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                color: '#EA580C',
                mb: 1.5,
                fontSize: '13px',
              }}
            >
              Take a photo of your pantry or ingredients to automatically add them
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={() => cameraInputRef.current?.click()}
                disabled={analyzingPhoto}
                sx={{
                  flex: 1,
                  bgcolor: '#F97316',
                  color: 'white',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  border: '2px solid #EA580C',
                  boxShadow: '2px 2px 0px #EA580C',
                  py: 1.25,
                  '&:hover': {
                    bgcolor: '#EA580C',
                  },
                }}
              >
                {analyzingPhoto ? 'Analyzing...' : 'Take Photo'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingPhoto}
                sx={{
                  flex: 1,
                  bgcolor: '#F97316',
                  color: 'white',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  border: '2px solid #EA580C',
                  boxShadow: '2px 2px 0px #EA580C',
                  py: 1.25,
                  '&:hover': {
                    bgcolor: '#EA580C',
                  },
                }}
              >
                {analyzingPhoto ? 'Analyzing...' : 'Upload Photo'}
              </Button>
            </Box>

            {analyzingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={20} sx={{ color: '#F97316' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#EA580C',
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
            {Object.entries(groupedItems).map(([source, items]) => (
              <Grid item xs={12} key={source}>
                <Card
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    border: '2px solid #E5E7EB',
                    boxShadow: '2px 2px 0px #D1D5DB',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getSourceIcon(source)}
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '16px',
                          textTransform: 'capitalize',
                        }}
                      >
                        From {source} ({items.length} item{items.length !== 1 ? 's' : ''})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {items.map((item) => (
                        <Chip
                          key={item.id}
                          label={item.name}
                          onDelete={() => handleDeleteItem(item.id)}
                          deleteIcon={<Delete />}
                          sx={{
                            bgcolor: '#F3F4F6',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '13px',
                            '& .MuiChip-deleteIcon': {
                              color: '#EF4444',
                              '&:hover': {
                                color: '#DC2626',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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
