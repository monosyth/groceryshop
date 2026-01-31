import { Container, Typography, Box, Grid, Card, CardContent, Chip, Paper, Button } from '@mui/material';
import { CameraAlt, Upload, Add, Delete, Edit, Download } from '@mui/icons-material';
import {
  teal, blue, purple, pink, orange, amber, red, cyan, gray, darkGray, brown,
  white, cream, categories, cardThemes
} from '../../theme/colors';

export default function BrandingPage() {
  // Define all color families
  const colorFamilies = [
    { name: 'Teal (Primary)', colors: teal, description: 'Main brand color - Produce category' },
    { name: 'Blue', colors: blue, description: 'Dairy & Eggs category' },
    { name: 'Purple', colors: purple, description: 'Pantry category' },
    { name: 'Pink', colors: pink, description: 'Beverages category' },
    { name: 'Orange', colors: orange, description: 'Snacks category' },
    { name: 'Amber', colors: amber, description: 'Bakery category' },
    { name: 'Red', colors: red, description: 'Meat & Seafood category' },
    { name: 'Cyan', colors: cyan, description: 'Frozen category' },
    { name: 'Gray', colors: gray, description: 'Household & UI elements' },
    { name: 'Dark Gray', colors: darkGray, description: 'Text colors' },
    { name: 'Brown', colors: brown, description: 'Text accents' },
  ];

  const ColorSwatch = ({ color, label, description }) => (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          width: '100%',
          height: 80,
          bgcolor: color,
          borderRadius: '12px',
          border: '2px solid #E5E7EB',
          mb: 1,
          boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          color: '#6B7280',
          fontSize: '11px',
          fontFamily: 'monospace',
        }}
      >
        {color}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            color: '#9CA3AF',
            fontSize: '10px',
            display: 'block',
            mt: 0.5,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 6, pb: 4, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              color: teal.main,
              fontSize: { xs: '32px', md: '42px' },
              mb: 1,
            }}
          >
            🎨 Brand Style Guide
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              color: brown.main,
              fontSize: '16px',
            }}
          >
            GroceryShop Color System • Centralized & Consistent
          </Typography>
        </Box>

        {/* Color Structure Info */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: teal.bg,
            borderRadius: '16px',
            border: `2px solid ${teal.main}`,
            p: 3,
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: teal.main,
              mb: 2,
            }}
          >
            Color Structure
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Chip
                label="dark"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  bgcolor: 'white',
                  fontWeight: 600,
                  width: '100%',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '11px',
                  color: '#6B7280',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                Hover states, dark accents
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip
                label="main"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  bgcolor: 'white',
                  fontWeight: 600,
                  width: '100%',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '11px',
                  color: '#6B7280',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                Primary color
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip
                label="light"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  bgcolor: 'white',
                  fontWeight: 600,
                  width: '100%',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '11px',
                  color: '#6B7280',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                Highlights, shadows
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip
                label="bg"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  bgcolor: 'white',
                  fontWeight: 600,
                  width: '100%',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '11px',
                  color: '#6B7280',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                Light backgrounds
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Color Families */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Color Families
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {colorFamilies.map((family) => (
            <Grid item xs={12} md={6} lg={4} key={family.name}>
              <Card
                sx={{
                  bgcolor: 'white',
                  borderRadius: '16px',
                  border: '2px solid #E5E7EB',
                  boxShadow: '3px 3px 0px #E5E7EB',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      fontSize: '18px',
                      mb: 0.5,
                    }}
                  >
                    {family.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                      mb: 3,
                    }}
                  >
                    {family.description}
                  </Typography>

                  {Object.entries(family.colors).map(([shade, color]) => (
                    <ColorSwatch
                      key={shade}
                      color={color}
                      label={shade}
                      description={
                        shade === 'dark' ? 'Hover states' :
                        shade === 'main' ? 'Primary' :
                        shade === 'light' ? 'Accents' :
                        shade === 'bg' ? 'Backgrounds' :
                        shade === 'darker' ? 'Headings' : ''
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Category Colors */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Category Colors
        </Typography>

        <Grid container spacing={2} sx={{ mb: 6 }}>
          {Object.entries(categories).map(([key, category]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Card
                sx={{
                  bgcolor: category.bg,
                  borderRadius: '12px',
                  border: `2px solid ${category.color}`,
                  boxShadow: `2px 2px 0px ${category.color}`,
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Box sx={{ fontSize: '42px', mb: 1 }}>{category.emoji}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      color: category.color,
                      fontSize: '16px',
                      mb: 1,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#6B7280',
                    }}
                  >
                    {category.color}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Card Themes */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Receipt Card Themes
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {cardThemes.map((theme, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: theme.bg,
                  borderRadius: '12px',
                  border: `2px solid ${theme.border}`,
                  boxShadow: `3px 3px 0px ${theme.shadow}`,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: theme.border,
                    mb: 2,
                  }}
                >
                  Theme {index + 1}
                </Typography>
                <Box sx={{ textAlign: 'left', width: '80%' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    bg: {theme.bg}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    border: {theme.border}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      display: 'block',
                    }}
                  >
                    shadow: {theme.shadow}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Typography */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Typography
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                border: '2px solid #E5E7EB',
                boxShadow: '3px 3px 0px #E5E7EB',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mb: 2,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Font Family
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Outfit
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    fontSize: '13px',
                  }}
                >
                  Primary font used throughout the app
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300, mb: 0.5 }}>
                    Light (300) - The quick brown fox
                  </Typography>
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, mb: 0.5 }}>
                    Regular (400) - The quick brown fox
                  </Typography>
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, mb: 0.5 }}>
                    Semibold (600) - The quick brown fox
                  </Typography>
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                    Bold (700) - The quick brown fox
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                border: '2px solid #E5E7EB',
                boxShadow: '3px 3px 0px #E5E7EB',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mb: 2,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Text Sizes
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '34px', fontWeight: 700, mb: 1 }}>
                  Heading 1 (34px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 700, mb: 1 }}>
                  Heading 2 (28px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 600, mb: 1 }}>
                  Heading 3 (20px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 600, mb: 1 }}>
                  Heading 4 (16px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', mb: 1 }}>
                  Body text (14px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', mb: 1 }}>
                  Small text (13px)
                </Typography>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px' }}>
                  Caption (11px)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Borders & Shadows */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Borders & Shadows
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: 'white',
                p: 3,
                borderRadius: '8px',
                border: '2px solid #E5E7EB',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, mb: 1 }}>
                Border Radius
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B7280', mb: 2 }}>
                8px, 12px, 16px, 24px
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Box sx={{ width: 40, height: 40, bgcolor: teal.main, borderRadius: '8px' }} />
                <Box sx={{ width: 40, height: 40, bgcolor: teal.main, borderRadius: '12px' }} />
                <Box sx={{ width: 40, height: 40, bgcolor: teal.main, borderRadius: '16px' }} />
                <Box sx={{ width: 40, height: 40, bgcolor: teal.main, borderRadius: '24px' }} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: 'white',
                p: 3,
                borderRadius: '12px',
                border: '2px solid #14B8A6',
                boxShadow: '2px 2px 0px #5EEAD4',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, mb: 1 }}>
                Flat Shadow
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>
                2px 2px 0px
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: 'white',
                p: 3,
                borderRadius: '12px',
                border: '3px solid #F59E0B',
                boxShadow: '3px 3px 0px #FCD34D',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, mb: 1 }}>
                Medium Shadow
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>
                3px 3px 0px
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: 'white',
                p: 3,
                borderRadius: '12px',
                border: '4px solid #EC4899',
                boxShadow: '6px 6px 0px #F9A8D4',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, mb: 1 }}>
                Large Shadow
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>
                6px 6px 0px
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Buttons & Components */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Buttons & Components
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                border: '2px solid #E5E7EB',
                boxShadow: '3px 3px 0px #E5E7EB',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mb: 2,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Button Styles
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: teal.main,
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      '&:hover': { bgcolor: teal.dark },
                    }}
                  >
                    Primary Button
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      '&:hover': { borderColor: teal.dark, bgcolor: teal.bg },
                    }}
                  >
                    Outlined Button
                  </Button>
                  <Button
                    size="small"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      color: teal.main,
                      border: '1px solid #14B8A6',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                    }}
                  >
                    Small Button
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                border: '2px solid #E5E7EB',
                boxShadow: '3px 3px 0px #E5E7EB',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mb: 2,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Chips & Badges
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Chip
                    label="Category Badge"
                    sx={{
                      bgcolor: teal.main,
                      color: 'white',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label="Count Badge"
                    size="small"
                    sx={{
                      height: '20px',
                      fontSize: '11px',
                      fontFamily: 'Outfit, sans-serif',
                      bgcolor: `${teal.main}15`,
                      color: teal.main,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label="Status: Active"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mt: 3,
                    mb: 1,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Dividers
                </Typography>
                <Box>
                  <Box sx={{ borderBottom: '1px solid #E5E7EB', mb: 1 }} />
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', mb: 1 }}>
                    Solid divider
                  </Typography>
                  <Box sx={{ borderBottom: '1px dashed #E5E7EB', mb: 1 }} />
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px' }}>
                    Dashed divider (receipt style)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Icon Buttons */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Icon Buttons
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                border: '2px solid #E5E7EB',
                boxShadow: '3px 3px 0px #E5E7EB',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    mb: 3,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Outlined Icon Buttons - Hover to see obvious color change
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: teal.dark,
                        borderWidth: '2px',
                        bgcolor: teal.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Photo
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: teal.dark,
                        borderWidth: '2px',
                        bgcolor: teal.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: teal.dark,
                        borderWidth: '2px',
                        bgcolor: teal.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Add Item
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: teal.dark,
                        borderWidth: '2px',
                        bgcolor: teal.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    sx={{
                      color: teal.main,
                      borderColor: teal.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: teal.dark,
                        borderWidth: '2px',
                        bgcolor: teal.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    sx={{
                      color: red.main,
                      borderColor: red.main,
                      borderWidth: '2px',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '16px',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: red.dark,
                        borderWidth: '2px',
                        bgcolor: red.dark,
                        color: 'white',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    color: '#6B7280',
                    fontSize: '13px',
                    mt: 2,
                  }}
                >
                  Hover effect: Border and background change to dark color, text turns white for maximum contrast
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Card Styles */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: '#1F2937',
            mb: 3,
          }}
        >
          Card Styles
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: '12px',
                border: '2px solid #E5E7EB',
                boxShadow: '2px 2px 0px #D1D5DB',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Standard Card
              </Typography>
            </Card>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#6B7280',
                mt: 1,
                textAlign: 'center',
              }}
            >
              2px border, 2px shadow
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: '#F0FDFA',
                borderRadius: '12px',
                border: '2px solid #14B8A6',
                boxShadow: '3px 3px 0px #5EEAD4',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Accent Card (Teal)
              </Typography>
            </Card>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#6B7280',
                mt: 1,
                textAlign: 'center',
              }}
            >
              Colored border & background
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: '#FEF3C7',
                borderRadius: '16px',
                border: '4px solid #DBEAFE',
                boxShadow: '6px 6px 0px #DBEAFE',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Feature Card
              </Typography>
            </Card>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#6B7280',
                mt: 1,
                textAlign: 'center',
              }}
            >
              4px border, 6px shadow
            </Typography>
          </Grid>
        </Grid>

        {/* Usage Example */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#F9FAFB',
            borderRadius: '16px',
            border: '2px solid #E5E7EB',
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#1F2937',
              mb: 2,
            }}
          >
            💡 Usage Example
          </Typography>
          <Paper
            sx={{
              bgcolor: '#1F2937',
              color: '#F9FAFB',
              p: 2,
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0 }}>
{`// Import colors
import { teal, getCategoryInfo } from '../theme/colors';

// Use in components
sx={{
  bgcolor: teal.main,
  '&:hover': { bgcolor: teal.dark }
}}

// Get category colors
const category = getCategoryInfo('produce');
sx={{
  color: category.color,
  bgcolor: category.bg
}}`}
            </pre>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
}
