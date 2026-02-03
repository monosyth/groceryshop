import { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Restaurant,
  Close,
  CheckCircle,
  AccessTime,
  Link as LinkIcon,
  ShoppingCart,
  AddLink,
  Save,
  ReceiptLong,
  Edit as EditIcon,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateRecipesFromIngredients } from '../../services/geminiService';
import { parseRecipeFromText } from '../../services/recipeUrlService';
import { teal, pink, orange, amber, brown, purple, blue, gray, darkGray, ui, white, cream, red } from '../../theme/colors';

export default function RecipePage() {
  const { currentUser } = useAuth();
  const { getAnalyzedReceipts, loading: receiptsLoading } = useReceipts();
  const receipts = getAnalyzedReceipts();
  const [pantryItems, setPantryItems] = useState([]); // From Firestore pantry collection
  const [pantryLoading, setPantryLoading] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Individual ingredient selection
  const [recipes, setRecipes] = useState([]);
  const loading = receiptsLoading || pantryLoading;
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [checkedIngredients, setCheckedIngredients] = useState({}); // Track checked ingredients per recipe
  const [recipeText, setRecipeText] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [importingRecipe, setImportingRecipe] = useState(false);
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [importedRecipeIngredients, setImportedRecipeIngredients] = useState([]);

  // Helper function to sort ingredients by priority
  // Basic staples (water, salt, pepper, oil, etc.) go to the bottom
  const sortIngredientsByPriority = (ingredients) => {
    const basicIngredients = [
      'water', 'salt', 'pepper', 'black pepper', 'white pepper',
      'olive oil', 'vegetable oil', 'cooking oil', 'oil',
      'butter', 'sugar', 'flour', 'all-purpose flour',
      'baking powder', 'baking soda', 'vanilla extract',
      'garlic powder', 'onion powder', 'paprika',
    ];

    const priority = [];
    const basic = [];

    ingredients.forEach((ingredient) => {
      const lowerIngredient = ingredient.toLowerCase();
      const isBasic = basicIngredients.some((basicItem) =>
        lowerIngredient.includes(basicItem) || basicItem.includes(lowerIngredient)
      );

      if (isBasic) {
        basic.push(ingredient);
      } else {
        priority.push(ingredient);
      }
    });

    return [...priority, ...basic];
  };

  // Fetch pantry items
  useEffect(() => {
    if (!currentUser) {
      setPantryLoading(false);
      return;
    }

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
        setPantryItems(items);
        setPantryLoading(false);
      },
      (error) => {
        console.error('Error fetching pantry:', error);
        setPantryLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Get all available ingredients from all receipts
  const availableIngredients = useMemo(() => {
    const ingredients = new Set();

    receipts.forEach((receipt) => {
      if (receipt.items) {
        receipt.items.forEach((item) => {
          if (item.name) {
            ingredients.add(item.name.toLowerCase());
          }
        });
      }
    });

    return Array.from(ingredients).sort();
  }, [receipts]);

  // All ingredients including pantry
  const allIngredients = useMemo(() => {
    const pantryIngredientNames = pantryItems.map((item) => item.name);
    return [...new Set([...availableIngredients, ...pantryIngredientNames])].sort();
  }, [availableIngredients, pantryItems]);

  // Handle ingredient selection
  const handleIngredientSelect = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((ing) => ing !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Handle receipt quick-select (add all ingredients from a receipt)
  const handleReceiptQuickSelect = (receiptId) => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt || !receipt.items) return;

    const receiptIngredients = receipt.items
      .map((item) => item.name?.toLowerCase())
      .filter(Boolean);

    // Check if all ingredients from this receipt are already selected
    const allSelected = receiptIngredients.every((ing) => selectedIngredients.includes(ing));

    if (allSelected) {
      // Remove all ingredients from this receipt
      setSelectedIngredients((prev) => prev.filter((ing) => !receiptIngredients.includes(ing)));
    } else {
      // Add all ingredients from this receipt
      setSelectedIngredients((prev) => [...new Set([...prev, ...receiptIngredients])]);
    }
  };

  // Check if all ingredients from a receipt are selected
  const isReceiptSelected = (receiptId) => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt || !receipt.items) return false;

    const receiptIngredients = receipt.items
      .map((item) => item.name?.toLowerCase())
      .filter(Boolean);

    return receiptIngredients.length > 0 && receiptIngredients.every((ing) => selectedIngredients.includes(ing));
  };

  // Handle select all ingredients
  const handleSelectAllIngredients = () => {
    if (selectedIngredients.length === allIngredients.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients([...allIngredients]);
    }
  };

  // Handle generate recipes
  const handleGenerateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select some ingredients first',
        severity: 'warning',
      });
      return;
    }

    setGenerating(true);
    try {
      const generatedRecipes = await generateRecipesFromIngredients(selectedIngredients, {
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

  // Handle ingredient selection
  const handleIngredientToggle = (recipeIndex, ingredient) => {
    setCheckedIngredients((prev) => {
      const recipeKey = `recipe-${recipeIndex}`;
      const current = prev[recipeKey] || [];

      if (current.includes(ingredient)) {
        return {
          ...prev,
          [recipeKey]: current.filter((ing) => ing !== ingredient),
        };
      } else {
        return {
          ...prev,
          [recipeKey]: [...current, ingredient],
        };
      }
    });
  };

  // Add selected ingredients to shopping list
  const handleAddToShoppingList = async (recipeIndex, recipeName) => {
    const recipeKey = `recipe-${recipeIndex}`;
    const selected = checkedIngredients[recipeKey] || [];

    if (selected.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select ingredients to add to your shopping list',
        severity: 'warning',
      });
      return;
    }

    try {
      const shoppingListRef = collection(db, 'shoppingList');

      // Add each ingredient to the shopping list
      const promises = selected.map((ingredient) =>
        addDoc(shoppingListRef, {
          userId: currentUser.uid,
          name: ingredient,
          checked: false,
          fromRecipe: recipeName,
          createdAt: serverTimestamp(),
        })
      );

      await Promise.all(promises);

      // Clear selection for this recipe
      setCheckedIngredients((prev) => ({
        ...prev,
        [recipeKey]: [],
      }));

      setSnackbar({
        open: true,
        message: `Added ${selected.length} item${selected.length > 1 ? 's' : ''} to shopping list!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add items to shopping list',
        severity: 'error',
      });
    }
  };

  // Handle import recipe from text
  const handleImportRecipe = async () => {
    if (!recipeText.trim()) return;

    setImportingRecipe(true);
    try {
      const parsedRecipe = await parseRecipeFromText(recipeText);

      // Match ingredients with what user has
      const userIngredientSet = new Set(allIngredients.map((ing) => ing.toLowerCase()));
      const matched = [];
      const missing = [];

      parsedRecipe.ingredients.forEach((ingredient) => {
        const ingredientLower = ingredient.toLowerCase();
        let found = false;

        // Check if any user ingredient matches
        for (const userIng of userIngredientSet) {
          if (ingredientLower.includes(userIng) || userIng.includes(ingredientLower)) {
            matched.push(ingredient);
            found = true;
            break;
          }
        }

        if (!found) {
          missing.push(ingredient);
        }
      });

      setImportedRecipe({
        ...parsedRecipe,
        matchedIngredients: matched,
        missingIngredients: missing,
      });

      setImportedRecipeIngredients([]);

      setSnackbar({
        open: true,
        message: 'Recipe imported successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error importing recipe:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to import recipe',
        severity: 'error',
      });
    } finally {
      setImportingRecipe(false);
    }
  };

  // Handle save imported recipe
  const handleSaveImportedRecipe = async () => {
    if (!importedRecipe) return;

    try {
      const recipesRef = collection(db, 'savedRecipes');
      await addDoc(recipesRef, {
        userId: currentUser.uid,
        ...importedRecipe,
        savedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Recipe saved! View it in My Recipes.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save recipe',
        severity: 'error',
      });
    }
  };

  // Handle add imported recipe ingredients to shopping list
  const handleAddImportedToShoppingList = async () => {
    if (importedRecipeIngredients.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select ingredients to add',
        severity: 'warning',
      });
      return;
    }

    try {
      const shoppingListRef = collection(db, 'shoppingList');
      const promises = importedRecipeIngredients.map((ingredient) =>
        addDoc(shoppingListRef, {
          userId: currentUser.uid,
          name: ingredient,
          checked: false,
          fromRecipe: importedRecipe.name,
          createdAt: serverTimestamp(),
        })
      );

      await Promise.all(promises);

      // Also save the recipe
      await handleSaveImportedRecipe();

      setImportedRecipeIngredients([]);

      setSnackbar({
        open: true,
        message: `Added ${promises.length} items to shopping list and saved recipe!`,
        severity: 'success',
      });

      // Clear the imported recipe
      setImportedRecipe(null);
      setRecipeText('');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add items to shopping list',
        severity: 'error',
      });
    }
  };

  // Toggle imported recipe ingredient
  const handleToggleImportedIngredient = (ingredient) => {
    setImportedRecipeIngredients((prev) => {
      if (prev.includes(ingredient)) {
        return prev.filter((ing) => ing !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const difficultyColors = {
    Easy: teal.main,
    Medium: amber.main,
    Hard: red.main,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Restaurant sx={{ fontSize: { xs: '28px', md: '34px' }, color: teal.main }} />
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: teal.main,
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              Recipe Ideas
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
            Turn your groceries into delicious meals
          </Typography>
        </Box>

        {receipts.length === 0 ? (
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
            <ReceiptLong sx={{ fontSize: '56px', mb: 2, color: brown.main }} />
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
              No Receipts Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.dark,
              }}
            >
              Upload some receipts to get recipe suggestions based on your groceries!
            </Typography>
          </Card>
        ) : (
          <Box>
            {/* Top Section - Quick Select and Paste Recipe */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Quick Select from Receipts */}
              {receipts.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      bgcolor: blue.bg,
                      borderRadius: '12px',
                      border: `2px solid ${blue.main}`,
                      boxShadow: `3px 3px 0px ${blue.light}`,
                      p: 2,
                      height: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <ReceiptLong sx={{ color: blue.dark, fontSize: '20px' }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          color: blue.dark,
                          fontSize: '16px',
                        }}
                      >
                        Quick Select from Receipts
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {receipts.map((receipt) => (
                        <Button
                          key={receipt.id}
                          variant={isReceiptSelected(receipt.id) ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => handleReceiptQuickSelect(receipt.id)}
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '12px',
                            textTransform: 'none',
                            borderColor: blue.main,
                            color: isReceiptSelected(receipt.id) ? white : blue.dark,
                            bgcolor: isReceiptSelected(receipt.id) ? blue.main : 'transparent',
                            '&:hover': {
                              bgcolor: isReceiptSelected(receipt.id) ? blue.dark : blue.bg,
                              borderColor: blue.dark,
                            },
                          }}
                        >
                          {receipt.storeInfo?.name || 'Unknown Store'} ({receipt.items?.length || 0} items) -{' '}
                          {receipt.createdAt?.toDate()
                            ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
                                receipt.createdAt.toDate()
                              )
                            : 'Unknown date'}
                        </Button>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              )}

              {/* Paste Recipe Section */}
              <Grid item xs={12} md={receipts.length > 0 ? 6 : 12}>
                <Card
                  sx={{
                    bgcolor: purple.bg,
                    borderRadius: '12px',
                    border: `2px solid ${purple.main}`,
                    boxShadow: `3px 3px 0px ${purple.light}`,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <EditIcon sx={{ color: purple.dark, fontSize: '20px' }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          color: purple.dark,
                          fontSize: '16px',
                        }}
                      >
                        Paste Recipe
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        color: purple.dark,
                        mb: 1.5,
                        fontSize: '13px',
                      }}
                    >
                      Paste a recipe URL or text from any website
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Paste recipe URL (e.g., allrecipes.com) or recipe text..."
                      value={recipeText}
                      onChange={(e) => setRecipeText(e.target.value)}
                      disabled={importingRecipe}
                      sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '13px',
                          bgcolor: white,
                          '& fieldset': { borderColor: purple.light },
                          '&:hover fieldset': { borderColor: purple.main },
                          '&.Mui-focused fieldset': { borderColor: purple.main },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Restaurant />}
                      onClick={handleImportRecipe}
                      disabled={!recipeText.trim() || importingRecipe}
                      sx={{
                        bgcolor: purple.main,
                        color: white,
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'none',
                        border: `2px solid ${purple.dark}`,
                        boxShadow: `2px 2px 0px ${purple.dark}`,
                        py: 1.25,
                        '&:hover': {
                          bgcolor: purple.dark,
                        },
                        '&:disabled': {
                          bgcolor: purple.light,
                          color: white,
                        },
                      }}
                    >
                      {importingRecipe ? 'Extracting...' : 'Extract Recipe'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Available Ingredients Section */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Your Groceries */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    bgcolor: teal.bg,
                    borderRadius: '12px',
                    border: `2px solid ${teal.main}`,
                    boxShadow: `3px 3px 0px ${teal.light}`,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCart sx={{ color: teal.dark, fontSize: '20px' }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            color: teal.dark,
                            fontSize: '16px',
                          }}
                        >
                          Available Ingredients ({allIngredients.length})
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={handleSelectAllIngredients}
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '11px',
                          textTransform: 'none',
                          color: teal.dark,
                          minWidth: 'auto',
                          px: 1,
                        }}
                      >
                        {selectedIngredients.length === allIngredients.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </Box>

                    {/* Search input */}
                    <TextField
                      size="small"
                      placeholder="Search ingredients..."
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: teal.main, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1.5,
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '13px',
                          bgcolor: white,
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: teal.light,
                          },
                          '&:hover fieldset': {
                            borderColor: teal.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: teal.main,
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: gray.main,
                          opacity: 1,
                        },
                      }}
                    />

                    <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                      {allIngredients.length === 0 ? (
                        <Typography
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            color: teal.dark,
                            fontSize: '13px',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            py: 2,
                          }}
                        >
                          No ingredients available. Upload receipts or add pantry items.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {allIngredients
                            .filter((ingredient) =>
                              ingredient.toLowerCase().includes(ingredientSearch.toLowerCase())
                            )
                            .map((ingredient, idx) => (
                              <Chip
                                key={idx}
                                label={ingredient}
                                onClick={() => handleIngredientSelect(ingredient)}
                                sx={{
                                  bgcolor: selectedIngredients.includes(ingredient) ? teal.main : teal.bg,
                                  color: selectedIngredients.includes(ingredient) ? white : teal.dark,
                                  border: `1px solid ${teal.main}`,
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: '12px',
                                  fontWeight: selectedIngredients.includes(ingredient) ? 600 : 400,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    bgcolor: selectedIngredients.includes(ingredient) ? teal.dark : teal.light,
                                  },
                                }}
                              />
                            ))}
                        </Box>
                      )}
                    </Box>

                    {/* Generate Recipe Button */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={generating ? <CircularProgress size={20} sx={{ color: white }} /> : <Restaurant />}
                        onClick={handleGenerateRecipes}
                        disabled={generating || selectedIngredients.length === 0}
                        sx={{
                          bgcolor: teal.main,
                          color: white,
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          py: 1.25,
                          textTransform: 'none',
                          border: `2px solid ${teal.dark}`,
                          boxShadow: `2px 2px 0px ${teal.dark}`,
                          '&:hover': {
                            bgcolor: teal.dark,
                          },
                          '&:disabled': {
                            bgcolor: teal.light,
                            color: white,
                          },
                        }}
                      >
                        {generating ? 'Generating Recipes...' : 'Generate Recipe Ideas'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Imported Recipe Preview */}
            {importedRecipe && (
              <Card
                sx={{
                  bgcolor: white,
                  borderRadius: '12px',
                  border: `2px solid ${purple.main}`,
                  boxShadow: `3px 3px 0px ${purple.light}`,
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 700,
                          color: purple.dark,
                          fontSize: '18px',
                          mb: 0.5,
                        }}
                      >
                        {importedRecipe.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          color: gray.main,
                          fontSize: '13px',
                        }}
                      >
                        {importedRecipe.description}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setImportedRecipe(null);
                        setRecipeText('');
                        setImportedRecipeIngredients([]);
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  {/* Ingredient matching */}
                  <Grid container spacing={2}>
                    {/* What You Have */}
                    {importedRecipe.matchedIngredients && importedRecipe.matchedIngredients.length > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            bgcolor: teal.bg,
                            borderRadius: '8px',
                            border: `1px solid ${teal.light}`,
                            p: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                            <CheckCircle sx={{ fontSize: 14, color: teal.dark }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                color: teal.dark,
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                              }}
                            >
                              You Have ({importedRecipe.matchedIngredients.length})
                            </Typography>
                          </Box>
                          <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'disc' }}>
                            {importedRecipe.matchedIngredients.map((ingredient, idx) => (
                              <Typography
                                component="li"
                                key={idx}
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: teal.dark,
                                  fontSize: '12px',
                                  lineHeight: 1.6,
                                }}
                              >
                                {ingredient}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {/* What You Need */}
                    {importedRecipe.missingIngredients && importedRecipe.missingIngredients.length > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            bgcolor: amber.bg,
                            borderRadius: '8px',
                            border: `1px solid ${amber.light}`,
                            p: 1.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              color: brown.dark,
                              fontWeight: 700,
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              display: 'block',
                              mb: 0.75,
                            }}
                          >
                            You'll Need ({importedRecipe.missingIngredients.length})
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            {sortIngredientsByPriority(importedRecipe.missingIngredients).map((ingredient, idx) => (
                              <FormControlLabel
                                key={idx}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={importedRecipeIngredients.includes(ingredient)}
                                    onChange={() => handleToggleImportedIngredient(ingredient)}
                                    sx={{
                                      color: amber.main,
                                      '&.Mui-checked': { color: amber.main },
                                      py: 0.25,
                                    }}
                                  />
                                }
                                label={
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'Outfit, sans-serif',
                                      color: brown.dark,
                                      fontSize: '12px',
                                    }}
                                  >
                                    {ingredient}
                                  </Typography>
                                }
                                sx={{ display: 'flex', my: 0 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCart />}
                      onClick={handleAddImportedToShoppingList}
                      disabled={importedRecipeIngredients.length === 0}
                      sx={{
                        bgcolor: amber.main,
                        color: white,
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'none',
                        py: 1,
                        '&:hover': { bgcolor: amber.dark },
                        '&:disabled': { bgcolor: amber.light, color: white },
                      }}
                    >
                      Add to Shopping List & Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Save />}
                      onClick={handleSaveImportedRecipe}
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'none',
                        color: purple.main,
                        borderColor: purple.main,
                        border: `2px solid ${purple.main}`,
                        '&:hover': {
                          bgcolor: purple.bg,
                          borderColor: purple.dark,
                          border: `2px solid ${purple.dark}`,
                        },
                      }}
                    >
                      Save Only
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Recipe Results */}
            <Grid container spacing={3}>
              <Grid item xs={12}>

              {recipes.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {recipes.map((recipe, index) => (
                    <Card
                      key={index}
                      sx={{
                        bgcolor: white,
                        borderRadius: '12px',
                        border: `2px solid ${ui.border}`,
                        boxShadow: `3px 3px 0px ${ui.border}`,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 700,
                              color: teal.main,
                              fontSize: { xs: '16px', sm: '18px' },
                              flex: 1,
                              pr: 1,
                            }}
                          >
                            {recipe.name}
                          </Typography>
                          <Chip
                            label={recipe.difficulty}
                            size="small"
                            sx={{
                              bgcolor: difficultyColors[recipe.difficulty] || teal.main,
                              color: 'white',
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              fontSize: '11px',
                              flexShrink: 0,
                            }}
                          />
                        </Box>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            color: darkGray.dark,
                            mb: 2,
                            lineHeight: 1.5,
                            fontSize: { xs: '13px', sm: '14px' },
                          }}
                        >
                          {recipe.description}
                        </Typography>

                        {/* Time Badge */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
                          <AccessTime sx={{ fontSize: 16, color: gray.main }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              color: gray.main,
                              fontSize: '12px',
                            }}
                          >
                            {recipe.cookingTime} min
                          </Typography>
                        </Box>

                        {/* Ingredients - Mobile Stacked, Desktop Side-by-Side */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            mb: 2.5,
                          }}
                        >
                          {/* What You Have */}
                          {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                            <Box
                              sx={{
                                flex: 1,
                                bgcolor: teal.bg,
                                borderRadius: '8px',
                                border: `1px solid ${teal.light}`,
                                p: 1.5,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                <CheckCircle sx={{ fontSize: 14, color: teal.dark }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    color: teal.dark,
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  You Have ({recipe.matchedIngredients.length})
                                </Typography>
                              </Box>
                              <Box
                                component="ul"
                                sx={{
                                  m: 0,
                                  pl: 2.5,
                                  listStyle: 'disc',
                                }}
                              >
                                {recipe.matchedIngredients.map((ingredient, idx) => (
                                  <Typography
                                    component="li"
                                    key={idx}
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'Outfit, sans-serif',
                                      color: teal.dark,
                                      fontSize: '12px',
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {ingredient}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* What You Need */}
                          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                            <Box
                              sx={{
                                flex: 1,
                                bgcolor: amber.bg,
                                borderRadius: '8px',
                                border: `1px solid ${amber.light}`,
                                p: 1.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  color: brown.dark,
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  display: 'block',
                                  mb: 0.75,
                                }}
                              >
                                You'll Need ({recipe.missingIngredients.length})
                              </Typography>
                              <Box sx={{ mb: 1 }}>
                                {sortIngredientsByPriority(recipe.missingIngredients).map((ingredient, idx) => (
                                  <FormControlLabel
                                    key={idx}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={
                                          (checkedIngredients[`recipe-${index}`] || []).includes(ingredient)
                                        }
                                        onChange={() => handleIngredientToggle(index, ingredient)}
                                        sx={{
                                          color: amber.main,
                                          '&.Mui-checked': { color: amber.main },
                                          py: 0.25,
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontFamily: 'Outfit, sans-serif',
                                          color: brown.dark,
                                          fontSize: '12px',
                                        }}
                                      >
                                        {ingredient}
                                      </Typography>
                                    }
                                    sx={{ display: 'flex', my: 0 }}
                                  />
                                ))}
                              </Box>
                              <Button
                                size="small"
                                variant="contained"
                                fullWidth
                                startIcon={<ShoppingCart />}
                                onClick={() => handleAddToShoppingList(index, recipe.name)}
                                disabled={(checkedIngredients[`recipe-${index}`] || []).length === 0}
                                sx={{
                                  bgcolor: amber.main,
                                  color: white,
                                  fontFamily: 'Outfit, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  textTransform: 'none',
                                  py: 0.75,
                                  '&:hover': {
                                    bgcolor: amber.dark,
                                  },
                                  '&:disabled': {
                                    bgcolor: amber.light,
                                    color: white,
                                  },
                                }}
                              >
                                Add to Shopping List
                              </Button>
                            </Box>
                          )}
                        </Box>

                        {/* View Recipe Button */}
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
                            color: teal.main,
                            borderColor: teal.main,
                            border: `2px solid ${teal.main}`,
                            py: 1,
                            '&:hover': {
                              bgcolor: teal.bg,
                              borderColor: teal.dark,
                              border: `2px solid ${teal.dark}`,
                            },
                          }}
                        >
                          View Full Recipe
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
          </Box>
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
