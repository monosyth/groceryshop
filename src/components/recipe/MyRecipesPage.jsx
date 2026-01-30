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
} from '@mui/material';
import {
  Restaurant,
  Delete,
  AccessTime,
  Close,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MyRecipesPage() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch saved recipes
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'savedRecipes'),
      where('userId', '==', currentUser.uid),
      orderBy('savedAt', 'desc')
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
            📖 My Recipes
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: '#78350F',
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
              bgcolor: '#FEF3C7',
              borderRadius: '16px',
              border: '2px solid #F59E0B',
              boxShadow: '3px 3px 0px #FCD34D',
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
                color: '#78350F',
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
                color: '#92400E',
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
                    bgcolor: 'white',
                    borderRadius: '12px',
                    border: '2px solid #E5E7EB',
                    boxShadow: '3px 3px 0px #E5E7EB',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '4px 4px 0px #E5E7EB',
                    },
                  }}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        color: '#15803D',
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
                        color: '#6B7280',
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {recipe.prepTime && (
                        <Chip
                          icon={<AccessTime sx={{ fontSize: 14 }} />}
                          label={`${recipe.prepTime + recipe.cookTime} min`}
                          size="small"
                          sx={{
                            bgcolor: '#F0FDF4',
                            color: '#059669',
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
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '11px',
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id);
                        }}
                        sx={{ color: '#EF4444' }}
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
                  color: '#15803D',
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
                    color: '#6B7280',
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
                        bgcolor: '#F0FDF4',
                        color: '#059669',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    />
                  )}
                  {selectedRecipe.cookTime && (
                    <Chip
                      label={`Cook: ${selectedRecipe.cookTime} min`}
                      size="small"
                      sx={{
                        bgcolor: '#FEF3C7',
                        color: '#92400E',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    />
                  )}
                  {selectedRecipe.servings && (
                    <Chip
                      label={`Servings: ${selectedRecipe.servings}`}
                      size="small"
                      sx={{
                        bgcolor: '#EDE9FE',
                        color: '#5B21B6',
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
                    color: '#15803D',
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
                        color: '#374151',
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
                        color: '#15803D',
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
                            color: '#374151',
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
                      color: '#15803D',
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
                    color: '#6B7280',
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}
