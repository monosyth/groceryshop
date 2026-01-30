import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  CameraAlt,
  Insights,
  Search,
  TrendingUp,
  AutoAwesome,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '📸',
      title: 'Snap & Forget',
      description: 'Snap a photo, we extract everything automatically.',
    },
    {
      icon: '📊',
      title: 'Visual Insights',
      description: 'Beautiful charts show where your money goes.',
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find any item across all your receipts instantly.',
    },
    {
      icon: '💰',
      title: 'Budget Clarity',
      description: 'Compare stores and track price changes over time.',
    },
    {
      icon: '🗂️',
      title: 'Cloud Storage',
      description: 'All receipts backed up and accessible anywhere.',
    },
    {
      icon: '📦',
      title: 'Auto Categories',
      description: 'Items automatically sorted by type for easy insights.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Custom CSS for fonts and animations */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(3deg); }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-slide-up {
            animation: slideUp 0.8s ease-out forwards;
          }

          .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
          .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
          .animate-delay-3 { animation-delay: 0.3s; opacity: 0; }
          .animate-delay-4 { animation-delay: 0.4s; opacity: 0; }

          .feature-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
          }

          .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            animation: float 8s ease-in-out infinite;
          }
        `}
      </style>

      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#111827',
                fontSize: '20px',
              }}
            >
              GrozeryShop
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={<GoogleIcon />}
              variant="contained"
              sx={{
                bgcolor: '#16A34A',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '15px',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803D',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In with Google'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box className="animate-slide-up">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '40px', md: '52px' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 2,
                  color: '#111827',
                  letterSpacing: '-0.02em',
                }}
              >
                Track your groceries.{' '}
                <Box
                  component="span"
                  sx={{
                    color: '#16A34A',
                  }}
                >
                  Save money.
                </Box>
              </Typography>
            </Box>

            <Box className="animate-slide-up animate-delay-1">
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '18px', md: '20px' },
                  color: '#6B7280',
                  mb: 3,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  maxWidth: '500px',
                }}
              >
                Snap a photo of your receipt. We'll automatically track every item and show you where your money goes.
              </Typography>
            </Box>

            <Box className="animate-slide-up animate-delay-2" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={{
                  bgcolor: '#16A34A',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#15803D',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In with Google'}
              </Button>
            </Box>

            {/* Trust Badge */}
            <Box className="animate-slide-up animate-delay-3" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body1"
                className="body-text"
                sx={{
                  color: '#795548',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 500,
                }}
              >
                ✨ Free forever • No credit card required • Smart automation
              </Typography>
            </Box>
          </Grid>

          {/* Hero Visual */}
          <Grid item xs={12} md={5}>
            <Box
              className="animate-slide-up animate-delay-2"
              sx={{
                position: 'relative',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  background: '#F9FAFB',
                  borderRadius: '16px',
                  p: 3,
                  border: '1px solid #E5E7EB',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      fontSize: '100px',
                      mb: 1.5,
                      display: 'inline-block',
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  >
                    🧾
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: '#111827', mb: 0.5, fontSize: '18px' }}
                  >
                    Upload Receipt
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#6B7280', mb: 2, fontSize: '14px' }}
                  >
                    Automatically extracts items, prices, categories
                  </Typography>

                  {/* Mock receipt items */}
                  <Box sx={{ textAlign: 'left', bgcolor: 'white', p: 2, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {['🥑 Avocados', '🍞 Whole Wheat Bread', '🥛 Organic Milk'].map((item, i) => (
                      <Box
                        key={i}
                        className="animate-slide-up"
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: i < 2 ? '1px solid #E0E0E0' : 'none',
                          animationDelay: `${0.5 + i * 0.1}s`,
                          opacity: 0,
                        }}
                      >
                        <Typography className="body-text" sx={{ fontSize: '14px' }}>
                          {item}
                        </Typography>
                        <Typography className="body-text" sx={{ fontSize: '14px', fontWeight: 600 }}>
                          ${(Math.random() * 5 + 2).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '32px', md: '36px' },
                fontWeight: 700,
                color: '#111827',
                mb: 1,
                letterSpacing: '-0.01em',
              }}
            >
              Simple, powerful features
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#6B7280',
                maxWidth: 500,
                mx: 'auto',
                fontSize: '16px',
              }}
            >
              Everything you need to manage your grocery spending
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  className={`feature-card animate-slide-up animate-delay-${index + 1}`}
                  elevation={0}
                  sx={{
                    height: '100%',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    overflow: 'visible',
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Box
                      sx={{
                        fontSize: '48px',
                        mb: 1,
                        display: 'inline-block',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: '#111827', mb: 0.5, fontSize: '17px' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6B7280', lineHeight: 1.5, fontSize: '14px' }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              background: '#16A34A',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '28px', md: '32px' },
                  fontWeight: 700,
                  color: 'white',
                  mb: 1.5,
                  letterSpacing: '-0.01em',
                }}
              >
                Ready to get started?
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  mb: 3,
                  maxWidth: 450,
                  mx: 'auto',
                  fontSize: '16px',
                }}
              >
                Free forever. No credit card required.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={{
                  bgcolor: 'white',
                  color: '#16A34A',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#F9FAFB',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In with Google'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#1B5E20',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" className="hero-title" sx={{ fontWeight: 900 }}>
                  GrozeryShop
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, maxWidth: 400, fontSize: '14px' }}
              >
                Snap receipts, track spending, save money.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  sx={{
                    bgcolor: 'white',
                    color: '#16A34A',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    fontSize: '15px',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In with Google'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Typography
              variant="body2"
              className="body-text"
              textAlign="center"
              sx={{ opacity: 0.7 }}
            >
              © 2026 GrozeryShop • Made with 💚 for smart shoppers
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
