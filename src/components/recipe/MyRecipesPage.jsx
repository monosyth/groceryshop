import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Restaurant,
  Delete,
  AccessTime,
  Close,
  Link as LinkIcon,
  ShoppingCart,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { teal, pink, orange, amber, brown, purple, blue, gray, darkGray, ui, white, cream } from '../../theme/colors';

export default function MyRecipesPage() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState({}); // Track selected ingredients per recipe
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch saved recipes
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'savedRecipes'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recipeData = [];
        snapshot.forEach((doc) => {
          recipeData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        // Sort by savedAt descending in JavaScript
        recipeData.sort((a, b) => {
          const dateA = a.savedAt?.toDate() || new Date(0);
          const dateB = b.savedAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        setRecipes(recipeData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Handle delete recipe
  const handleDeleteRecipe = async (recipeId) => {
    try {
      await deleteDoc(doc(db, 'savedRecipes', recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  // Toggle ingredient selection
  const handleToggleIngredient = (recipeId, ingredient) => {
    setSelectedIngredients((prev) => {
      const current = prev[recipeId] || [];
      if (current.includes(ingredient)) {
        return {
          ...prev,
          [recipeId]: current.filter((ing) => ing !== ingredient),
        };
      } else {
        return {
          ...prev,
          [recipeId]: [...current, ingredient],
        };
      }
    });
  };

  // Add selected ingredients to shopping list
  const handleAddToShoppingList = async (recipeId, recipeName) => {
    const selected = selectedIngredients[recipeId] || [];
    if (selected.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select ingredients to add',
        severity: 'warning',
      });
      return;
    }

    try {
      const shoppingListRef = collection(db, 'shoppingList');
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
      setSelectedIngredients((prev) => ({
        ...prev,
        [recipeId]: [],
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
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: teal.main,
              fontSize: { xs: '28px', md: '34px' },
              mb: 1,
            }}
          >
            📖 My Recipes
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: brown.main,
            }}
          >
            {recipes.length > 0
              ? `${recipes.length} saved recipe${recipes.length !== 1 ? 's' : ''}`
              : 'No saved recipes yet'}
          </Typography>
        </Box>

        {recipes.length === 0 ? (
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
            <Box sx={{ fontSize: '56px', mb: 2 }}>📖</Box>
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
              No Saved Recipes Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.dark,
              }}
            >
              Import recipes from URLs on the Recipes page to save them here!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {recipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <Card
                  sx={{
                    bgcolor: white,
                    borderRadius: '12px',
                    border: `2px solid ${ui.border}`,
                    boxShadow: `3px 3px 0px ${ui.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        color: teal.main,
                        fontSize: '16px',
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {recipe.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        color: gray.main,
                        fontSize: '13px',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {recipe.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {recipe.prepTime && recipe.cookTime && (
                        <Chip
                          icon={<AccessTime sx={{ fontSize: 14 }} />}
                          label={`${recipe.prepTime}-${recipe.cookTime} min`}
                          size="small"
                          sx={{
                            bgcolor: teal.bg,
                            color: teal.dark,
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '11px',
                          }}
                        />
                      )}
                      {recipe.ingredients && (
                        <Chip
                          label={`${recipe.ingredients.length} ingredients`}
                          size="small"
                          sx={{
                            bgcolor: amber.bg,
                            color: brown.dark,
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '11px',
                          }}
                        />
                      )}
                    </Box>

                    {/* Ingredients List */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <Box
                        sx={{
                          bgcolor: gray.bg,
                          borderRadius: '8px',
                          p: 1.5,
                          mb: 2,
                          border: `1px solid ${ui.border}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            color: darkGray.main,
                            fontSize: '12px',
                            display: 'block',
                            mb: 1,
                          }}
                        >
                          Ingredients:
                        </Typography>
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {recipe.ingredients.map((ingredient, idx) => (
                            <FormControlLabel
                              key={idx}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={(selectedIngredients[recipe.id] || []).includes(ingredient)}
                                  onChange={() => handleToggleIngredient(recipe.id, ingredient)}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    color: teal.main,
                                    '&.Mui-checked': { color: teal.main },
                                    py: 0.25,
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    color: darkGray.main,
                                    fontSize: '12px',
                                  }}
                                >
                                  {ingredient}
                                </Typography>
                              }
                              sx={{ display: 'flex', my: 0, width: '100%' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ))}
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingCart />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToShoppingList(recipe.id, recipe.name);
                          }}
                          disabled={(selectedIngredients[recipe.id] || []).length === 0}
                          sx={{
                            mt: 1.5,
                            bgcolor: teal.main,
                            color: 'white',
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            fontSize: '11px',
                            textTransform: 'none',
                            py: 0.75,
                            '&:hover': {
                              bgcolor: teal.dark,
                            },
                            '&:disabled': {
                              bgcolor: teal.light,
                              color: 'white',
                            },
                          }}
                        >
                          Add to Shopping List
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ pt: 2, borderTop: `1px solid ${ui.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          color: darkGray.light,
                          fontSize: '11px',
                        }}
                      >
                        Click to view details
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id);
                        }}
                        sx={{ color: pink.dark }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Recipe Detail Dialog */}
        <Dialog
          open={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedRecipe && (
            <>
              <DialogTitle
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  color: teal.main,
                  pr: 6,
                }}
              >
                {selectedRecipe.name}
                <IconButton
                  onClick={() => setSelectedRecipe(null)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: gray.main,
                    mb: 2,
                  }}
                >
                  {selectedRecipe.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {selectedRecipe.prepTime && (
                    <Chip
                      label={`Prep: ${selectedRecipe.prepTime} min`}
                      size="small"
                      sx={{
                        bgcolor: teal.bg,
                        color: teal.dark,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    />
                  )}
                  {selectedRecipe.cookTime && (
                    <Chip
                      label={`Cook: ${selectedRecipe.cookTime} min`}
                      size="small"
                      sx={{
                        bgcolor: amber.bg,
                        color: brown.dark,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    />
                  )}
                  {selectedRecipe.servings && (
                    <Chip
                      label={`Servings: ${selectedRecipe.servings}`}
                      size="small"
                      sx={{
                        bgcolor: purple.bg,
                        color: purple.dark,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: teal.main,
                    fontSize: '16px',
                    mb: 1.5,
                  }}
                >
                  Ingredients
                </Typography>
                <Box component="ul" sx={{ pl: 2.5 }}>
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <Typography
                      component="li"
                      key={idx}
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        color: darkGray.main,
                        fontSize: '14px',
                        mb: 0.5,
                      }}
                    >
                      {ingredient}
                    </Typography>
                  ))}
                </Box>

                {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: teal.main,
                        fontSize: '16px',
                        mb: 1.5,
                      }}
                    >
                      Instructions
                    </Typography>
                    <Box component="ol" sx={{ pl: 2.5 }}>
                      {selectedRecipe.instructions.map((step, idx) => (
                        <Typography
                          component="li"
                          key={idx}
                          variant="body2"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            color: darkGray.main,
                            fontSize: '14px',
                            mb: 1,
                          }}
                        >
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                {selectedRecipe.sourceUrl && (
                  <Button
                    startIcon={<LinkIcon />}
                    href={selectedRecipe.sourceUrl}
                    target="_blank"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: teal.main,
                    }}
                  >
                    View Original
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedRecipe(null)}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: gray.main,
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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
