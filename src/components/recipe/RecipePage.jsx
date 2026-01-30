import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  Restaurant,
  Close,
  CheckCircle,
  AccessTime,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateRecipesFromIngredients, analyzePantryPhoto } from '../../services/geminiService';

export default function RecipePage() {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [pantryIngredients, setPantryIngredients] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Fetch receipts
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'receipts'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const receiptData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include successfully analyzed receipts
          if (data.metadata?.analysisStatus === 'completed' && data.items && data.items.length > 0) {
            receiptData.push({
              id: doc.id,
              ...data,
            });
          }
        });

        // Sort by date (newest first)
        receiptData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });

        setReceipts(receiptData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receipts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Get all unique ingredients from selected receipts
  const selectedIngredients = useMemo(() => {
    const ingredients = new Set();

    selectedReceipts.forEach((receiptId) => {
      const receipt = receipts.find((r) => r.id === receiptId);
      if (receipt && receipt.items) {
        receipt.items.forEach((item) => {
          if (item.name) {
            ingredients.add(item.name.toLowerCase());
          }
        });
      }
    });

    return Array.from(ingredients);
  }, [selectedReceipts, receipts]);

  // All ingredients including pantry
  const allIngredients = useMemo(() => {
    return [...new Set([...selectedIngredients, ...pantryIngredients])];
  }, [selectedIngredients, pantryIngredients]);

  // Handle receipt selection
  const handleReceiptToggle = (receiptId) => {
    setSelectedReceipts((prev) =>
      prev.includes(receiptId)
        ? prev.filter((id) => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedReceipts.length === receipts.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(receipts.map((r) => r.id));
    }
  };

  // Handle generate recipes
  const handleGenerateRecipes = async () => {
    if (allIngredients.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select some receipts or add pantry items first',
        severity: 'warning',
      });
      return;
    }

    setGenerating(true);
    try {
      const generatedRecipes = await generateRecipesFromIngredients(allIngredients, {
        includePartialMatches: true,
      });

      setRecipes(generatedRecipes);
      setSnackbar({
        open: true,
        message: `Generated ${generatedRecipes.length} recipe suggestions!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error generating recipes:', error);
      setSnackbar({
        open: true,
        message: error.message.includes('API')
          ? 'Please add your Gemini API key to use this feature'
          : 'Failed to generate recipes. Please try again.',
        severity: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handle photo upload/camera
  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    setSelectedPhoto(URL.createObjectURL(file));

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];

        try {
          const ingredients = await analyzePantryPhoto(base64);
          setPantryIngredients((prev) => [...new Set([...prev, ...ingredients])]);
          setPhotoDialogOpen(false);
          setSnackbar({
            open: true,
            message: `Found ${ingredients.length} ingredients in your photo!`,
            severity: 'success',
          });
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
          setSelectedPhoto(null);
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

  // Handle remove pantry ingredient
  const handleRemovePantryIngredient = (ingredient) => {
    setPantryIngredients((prev) => prev.filter((ing) => ing !== ingredient));
  };

  const difficultyColors = {
    Easy: '#10B981',
    Medium: '#F59E0B',
    Hard: '#EF4444',
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
            👨‍🍳 Recipe Ideas
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: '#78350F',
            }}
          >
            Turn your groceries into delicious meals
          </Typography>
        </Box>

        {receipts.length === 0 ? (
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
            <Box sx={{ fontSize: '56px', mb: 2 }}>🧾</Box>
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
              No Receipts Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#92400E',
              }}
            >
              Upload some receipts to get recipe suggestions based on your groceries!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Ingredient Selection */}
            <Grid item xs={12} md={5}>
              {/* Receipt Selection */}
              <Card
                sx={{
                  bgcolor: '#ECFDF5',
                  borderRadius: '12px',
                  border: '2px solid #10B981',
                  boxShadow: '3px 3px 0px #6EE7B7',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#059669',
                        fontSize: '18px',
                      }}
                    >
                      🛒 Your Groceries
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleSelectAll}
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '12px',
                        textTransform: 'none',
                        color: '#059669',
                      }}
                    >
                      {selectedReceipts.length === receipts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>

                  <FormGroup>
                    {receipts.map((receipt) => (
                      <FormControlLabel
                        key={receipt.id}
                        control={
                          <Checkbox
                            checked={selectedReceipts.includes(receipt.id)}
                            onChange={() => handleReceiptToggle(receipt.id)}
                            sx={{
                              color: '#10B981',
                              '&.Mui-checked': { color: '#10B981' },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 500,
                                color: '#059669',
                              }}
                            >
                              {receipt.storeInfo?.name || 'Unknown Store'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: '#059669',
                                opacity: 0.7,
                              }}
                            >
                              {receipt.items?.length || 0} items
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>

              {/* Pantry Photo Upload */}
              <Card
                sx={{
                  bgcolor: '#FFEDD5',
                  borderRadius: '12px',
                  border: '2px solid #F97316',
                  boxShadow: '3px 3px 0px #FCD34D',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#EA580C',
                      fontSize: '18px',
                      mb: 2,
                    }}
                  >
                    📸 Add Pantry Items
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      color: '#EA580C',
                      mb: 2,
                      fontSize: '13px',
                    }}
                  >
                    Take a photo of your pantry or ingredients to add them
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
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
                        fontSize: '13px',
                        textTransform: 'none',
                        border: '2px solid #EA580C',
                        boxShadow: '2px 2px 0px #EA580C',
                        '&:hover': {
                          bgcolor: '#EA580C',
                        },
                      }}
                    >
                      Camera
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
                        fontSize: '13px',
                        textTransform: 'none',
                        border: '2px solid #EA580C',
                        boxShadow: '2px 2px 0px #EA580C',
                        '&:hover': {
                          bgcolor: '#EA580C',
                        },
                      }}
                    >
                      Upload
                    </Button>
                  </Box>

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

                  {analyzingPhoto && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <CircularProgress size={20} sx={{ color: '#F97316' }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          color: '#EA580C',
                        }}
                      >
                        Analyzing photo...
                      </Typography>
                    </Box>
                  )}

                  {/* Pantry Ingredients Chips */}
                  {pantryIngredients.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          color: '#EA580C',
                          fontWeight: 600,
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        From photos:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {pantryIngredients.map((ingredient, index) => (
                          <Chip
                            key={index}
                            label={ingredient}
                            onDelete={() => handleRemovePantryIngredient(ingredient)}
                            size="small"
                            sx={{
                              bgcolor: 'white',
                              border: '1px solid #FDBA74',
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '12px',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Selected Ingredients Summary */}
              {allIngredients.length > 0 && (
                <Card
                  sx={{
                    bgcolor: '#FCE7F3',
                    borderRadius: '12px',
                    border: '2px solid #EC4899',
                    boxShadow: '3px 3px 0px #F9A8D4',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#BE185D',
                        fontSize: '18px',
                        mb: 2,
                      }}
                    >
                      🥘 Available Ingredients ({allIngredients.length})
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {allIngredients.slice(0, 15).map((ingredient, index) => (
                        <Chip
                          key={index}
                          label={ingredient}
                          size="small"
                          sx={{
                            bgcolor: 'white',
                            border: '1px solid #F9A8D4',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '11px',
                          }}
                        />
                      ))}
                      {allIngredients.length > 15 && (
                        <Chip
                          label={`+${allIngredients.length - 15} more`}
                          size="small"
                          sx={{
                            bgcolor: 'white',
                            border: '1px solid #F9A8D4',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '11px',
                          }}
                        />
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={generating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Restaurant />}
                      onClick={handleGenerateRecipes}
                      disabled={generating}
                      sx={{
                        bgcolor: '#EC4899',
                        color: 'white',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        py: 1.5,
                        textTransform: 'none',
                        border: '2px solid #BE185D',
                        boxShadow: '3px 3px 0px #BE185D',
                        '&:hover': {
                          bgcolor: '#DB2777',
                        },
                        '&:disabled': {
                          bgcolor: '#F9A8D4',
                          color: 'white',
                        },
                      }}
                    >
                      {generating ? 'Generating Recipes...' : 'Generate Recipe Ideas'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Right Column - Recipe Results */}
            <Grid item xs={12} md={7}>
              {recipes.length === 0 ? (
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
                  <Box sx={{ fontSize: '64px', mb: 2 }}>👨‍🍳</Box>
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
                    Ready to Cook?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 400,
                      color: '#92400E',
                    }}
                  >
                    Select your groceries and tap "Generate Recipe Ideas" to get started
                  </Typography>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {recipes.map((recipe, index) => (
                    <Card
                      key={index}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        boxShadow: '3px 3px 0px #E5E7EB',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '4px 4px 0px #E5E7EB',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 700,
                              color: '#15803D',
                              fontSize: '18px',
                            }}
                          >
                            {recipe.name}
                          </Typography>
                          <Chip
                            label={recipe.difficulty}
                            size="small"
                            sx={{
                              bgcolor: difficultyColors[recipe.difficulty] || '#10B981',
                              color: 'white',
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              fontSize: '11px',
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            color: '#374151',
                            mb: 2,
                            lineHeight: 1.5,
                          }}
                        >
                          {recipe.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: '#6B7280' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: '#6B7280',
                                fontSize: '12px',
                              }}
                            >
                              {recipe.cookingTime} min
                            </Typography>
                          </Box>
                          {recipe.matchedIngredients && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label={`${recipe.matchedIngredients.length} ingredients match`}
                              size="small"
                              sx={{
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #6EE7B7',
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '11px',
                              }}
                            />
                          )}
                        </Box>

                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: '#6B7280',
                                fontWeight: 600,
                                display: 'block',
                                mb: 0.5,
                              }}
                            >
                              You'll also need:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {recipe.missingIngredients.map((ingredient, idx) => (
                                <Chip
                                  key={idx}
                                  label={ingredient}
                                  size="small"
                                  sx={{
                                    bgcolor: '#FEF3C7',
                                    border: '1px solid #FCD34D',
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11px',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<LinkIcon />}
                          href={`https://www.google.com/search?q=${encodeURIComponent(recipe.name + ' recipe')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            fontSize: '13px',
                            textTransform: 'none',
                            color: '#15803D',
                            borderColor: '#15803D',
                            '&:hover': {
                              bgcolor: '#F0FDF4',
                              borderColor: '#166534',
                            },
                          }}
                        >
                          Search Recipe on Google
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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
