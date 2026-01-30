import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Custom CSS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

          * {
            font-family: 'Outfit', system-ui, -apple-system, sans-serif !important;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-3deg); }
            75% { transform: rotate(3deg); }
          }

          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .float-slow {
            animation: float 6s ease-in-out infinite;
          }

          .float-medium {
            animation: float 4s ease-in-out infinite;
          }

          .float-fast {
            animation: float 3s ease-in-out infinite;
          }

          .wiggle-hover:hover {
            animation: wiggle 0.5s ease-in-out;
          }

          .feature-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .feature-card:hover {
            transform: scale(1.08) rotate(-2deg);
          }
        `}
      </style>

      {/* Floating decorative elements */}
      <Box
        className="float-slow"
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          fontSize: '80px',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        🥑
      </Box>
      <Box
        className="float-medium"
        sx={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          fontSize: '60px',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        🍞
      </Box>
      <Box
        className="float-fast"
        sx={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          fontSize: '70px',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        🥛
      </Box>
      <Box
        className="float-slow"
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          fontSize: '65px',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        🧀
      </Box>

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          pt: 3,
          pb: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '15px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  transform: 'rotate(-5deg)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                }}
              >
                🛒
              </Box>
              <Typography
                sx={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#15803D',
                  letterSpacing: '-0.02em',
                }}
              >
                GrozeryShop
              </Typography>
            </Box>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#15803D',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: '50px',
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '2px solid #15803D',
                '&:hover': {
                  bgcolor: '#F0FDF4',
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* Main headline */}
          <Typography
            sx={{
              fontSize: { xs: '14px', md: '16px' },
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#B45309',
              mb: 2,
            }}
          >
            Grocery tracking, but make it fun
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '48px', sm: '60px', md: '72px' },
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#15803D',
              letterSpacing: '-0.03em',
              textShadow: '4px 4px 0px rgba(0,0,0,0.1)',
              mb: 2,
            }}
          >
            Your groceries,{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              organized
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '18px', md: '22px' },
              color: '#78350F',
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Take a pic of your receipt. We'll magically turn it into insights.
            <Box component="span" sx={{ fontSize: '24px' }}> ✨</Box>
          </Typography>

          {/* CTA Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{
              bgcolor: '#15803D',
              color: 'white',
              fontWeight: 800,
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '20px',
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(21, 128, 61, 0.4)',
              border: '3px solid #166534',
              '&:hover': {
                bgcolor: '#166534',
                transform: 'scale(1.08) rotate(-1deg)',
                boxShadow: '0 12px 35px rgba(21, 128, 61, 0.5)',
              },
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              mb: 2,
            }}
          >
            {loading ? 'Loading...' : 'Start For Free'}
          </Button>

          <Typography
            sx={{
              fontSize: '14px',
              color: '#92400E',
              fontWeight: 600,
            }}
          >
            Free forever • No credit card • Just groceries
          </Typography>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {/* Feature 1 - Green */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: '#ECFDF5',
              borderRadius: '24px',
              p: 3,
              border: '4px solid #10B981',
              boxShadow: '6px 6px 0px #10B981',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 1 }}>📸</Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#059669', mb: 1 }}>
              Snap It
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#059669', lineHeight: 1.4 }}>
              One photo and you're done. No typing needed.
            </Typography>
          </Box>

          {/* Feature 2 - Pink */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: '#FCE7F3',
              borderRadius: '24px',
              p: 3,
              border: '4px solid #EC4899',
              boxShadow: '6px 6px 0px #EC4899',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 1 }}>📊</Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#BE185D', mb: 1 }}>
              See Patterns
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#BE185D', lineHeight: 1.4 }}>
              Pretty charts that actually make sense.
            </Typography>
          </Box>

          {/* Feature 3 - Yellow */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: '#FEF3C7',
              borderRadius: '24px',
              p: 3,
              border: '4px solid #F59E0B',
              boxShadow: '6px 6px 0px #F59E0B',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 1 }}>🔍</Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#D97706', mb: 1 }}>
              Find Stuff
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#D97706', lineHeight: 1.4 }}>
              Search across all your receipts in seconds.
            </Typography>
          </Box>

          {/* Feature 4 - Orange */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: '#FFEDD5',
              borderRadius: '24px',
              p: 3,
              border: '4px solid #F97316',
              boxShadow: '6px 6px 0px #F97316',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 1 }}>💰</Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', mb: 1 }}>
              Save Money
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#EA580C', lineHeight: 1.4 }}>
              See where your money goes. Keep more of it.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Final CTA */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '32px',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            border: '6px solid #15803D',
            boxShadow: '12px 12px 0px #15803D',
            transform: 'rotate(-1deg)',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '32px', md: '42px' },
              fontWeight: 900,
              color: '#15803D',
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Ready to turn groceries into a game?
          </Typography>
          <Typography
            sx={{
              fontSize: '18px',
              color: '#166534',
              mb: 3,
              fontWeight: 500,
            }}
          >
            Start tracking your groceries the easy way
          </Typography>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{
              bgcolor: '#EC4899',
              color: 'white',
              fontWeight: 800,
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '20px',
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)',
              border: '3px solid #BE185D',
              '&:hover': {
                bgcolor: '#DB2777',
                transform: 'scale(1.08)',
                boxShadow: '0 12px 35px rgba(236, 72, 153, 0.5)',
              },
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {loading ? 'Loading...' : 'Get Started Free'}
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 4, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#92400E',
            fontWeight: 600,
          }}
        >
          Made with 💚 by people who hate spreadsheets
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            color: '#B45309',
            mt: 1,
          }}
        >
          © 2026 GrozeryShop • Making grocery tracking actually enjoyable
        </Typography>
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
