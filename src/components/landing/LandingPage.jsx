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
      title: 'Snap & Track',
      description: 'Photo your receipt, we handle the rest',
    },
    {
      icon: '📊',
      title: 'See Patterns',
      description: 'Charts show where your money goes',
    },
    {
      icon: '🔍',
      title: 'Find Anything',
      description: 'Search across all your receipts',
    },
    {
      icon: '💰',
      title: 'Save Money',
      description: 'Compare prices and track spending',
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
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '700px', mx: 'auto' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '36px', md: '48px' },
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 2,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            Track your groceries. Save money.
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              color: '#6B7280',
              mb: 3,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Snap a photo of your receipt. We'll automatically track every item and show you where your money goes.
          </Typography>

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

          <Typography
            variant="body2"
            sx={{
              color: '#9CA3AF',
              fontSize: '14px',
              mt: 2,
            }}
          >
            Free forever • No credit card required
          </Typography>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 4, bgcolor: '#F9FAFB', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '28px', md: '32px' },
                fontWeight: 700,
                color: '#111827',
                mb: 1,
                letterSpacing: '-0.01em',
              }}
            >
              Everything you need
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ fontSize: '40px', mb: 0.5 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#111827', mb: 0.5, fontSize: '16px' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#6B7280', lineHeight: 1.4, fontSize: '14px' }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              p: 4,
              background: '#16A34A',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '24px', md: '28px' },
                fontWeight: 700,
                color: 'white',
                mb: 2,
                letterSpacing: '-0.01em',
              }}
            >
              Ready to get started?
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
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280', fontSize: '14px' }}
            >
              © 2026 GrozeryShop
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
