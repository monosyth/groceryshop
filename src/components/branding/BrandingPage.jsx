import { Container, Typography, Box, Grid, Card, CardContent, Chip, Paper } from '@mui/material';
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
