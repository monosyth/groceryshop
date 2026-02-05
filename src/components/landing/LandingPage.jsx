import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Google as GoogleIcon,
  ShoppingCart,
  PhotoCamera,
  BarChart,
  Search,
  AttachMoney,
  AutoAwesome,
  Favorite,
  OpenInBrowser,
  ContentCopy,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { teal, pink, rose, orange, amber, brown, white } from '../../theme/colors';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Show nothing while redirecting
  if (currentUser) {
    return null;
  }

  const [showBrowserDialog, setShowBrowserDialog] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // With popup auth, we get the result directly - navigate immediately
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (error.message && error.message.includes('regular browser')) {
        // Show the embedded browser dialog
        setShowBrowserDialog(true);
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setError('Link copied! Paste it in your browser.');
    setShowBrowserDialog(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${amber.bg} 0%, ${amber.light} 50%, ${amber.light} 100%)`,
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
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        <PhotoCamera sx={{ fontSize: '80px', color: teal.main }} />
      </Box>
      <Box
        className="float-medium"
        sx={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        <BarChart sx={{ fontSize: '60px', color: pink.main }} />
      </Box>
      <Box
        className="float-fast"
        sx={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        <Search sx={{ fontSize: '70px', color: amber.main }} />
      </Box>
      <Box
        className="float-slow"
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        <AttachMoney sx={{ fontSize: '65px', color: orange.main }} />
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
                  background: `linear-gradient(135deg, ${teal.main} 0%, ${teal.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(-5deg)',
                  boxShadow: `0 4px 20px rgba(20, 184, 166, 0.4)`,
                }}
              >
                <ShoppingCart sx={{ color: 'white', fontSize: '28px' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: teal.main,
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
                bgcolor: white,
                color: teal.main,
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: '50px',
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: `2px solid ${teal.main}`,
                '&:hover': {
                  bgcolor: teal.bg,
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
              color: amber.dark,
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
              color: teal.main,
              letterSpacing: '-0.03em',
              textShadow: '4px 4px 0px rgba(0,0,0,0.1)',
              mb: 2,
            }}
          >
            Your groceries,{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${pink.main} 0%, ${rose.main} 100%)`,
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
              color: brown.main,
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Take a pic of your receipt. We'll magically turn it into insights.
            <Box
              component="span"
              sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}
            >
              <AutoAwesome sx={{ fontSize: '24px', color: amber.main }} />
            </Box>
          </Typography>

          {/* CTA Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{
              bgcolor: teal.main,
              color: white,
              fontWeight: 800,
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '20px',
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(20, 184, 166, 0.4)',
              border: `3px solid ${teal.dark}`,
              '&:hover': {
                bgcolor: teal.dark,
                transform: 'scale(1.08) rotate(-1deg)',
                boxShadow: '0 12px 35px rgba(20, 184, 166, 0.5)',
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
              color: brown.dark,
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
              bgcolor: teal.bg,
              borderRadius: '24px',
              p: 3,
              border: `4px solid ${teal.main}`,
              boxShadow: `6px 6px 0px ${teal.main}`,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ mb: 1 }}>
              <PhotoCamera sx={{ fontSize: '56px', color: teal.dark }} />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: teal.dark, mb: 1 }}>
              Snap It
            </Typography>
            <Typography sx={{ fontSize: '14px', color: teal.dark, lineHeight: 1.4 }}>
              One photo and you're done. No typing needed.
            </Typography>
          </Box>

          {/* Feature 2 - Pink */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: pink.bg,
              borderRadius: '24px',
              p: 3,
              border: `4px solid ${pink.main}`,
              boxShadow: `6px 6px 0px ${pink.main}`,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ mb: 1 }}>
              <BarChart sx={{ fontSize: '56px', color: pink.dark }} />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: pink.dark, mb: 1 }}>
              See Patterns
            </Typography>
            <Typography sx={{ fontSize: '14px', color: pink.dark, lineHeight: 1.4 }}>
              Pretty charts that actually make sense.
            </Typography>
          </Box>

          {/* Feature 3 - Yellow */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: amber.bg,
              borderRadius: '24px',
              p: 3,
              border: `4px solid ${amber.main}`,
              boxShadow: `6px 6px 0px ${amber.main}`,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Search sx={{ fontSize: '56px', color: amber.dark }} />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: amber.dark, mb: 1 }}>
              Find Stuff
            </Typography>
            <Typography sx={{ fontSize: '14px', color: amber.dark, lineHeight: 1.4 }}>
              Search across all your receipts in seconds.
            </Typography>
          </Box>

          {/* Feature 4 - Orange */}
          <Box
            className="feature-card wiggle-hover"
            sx={{
              bgcolor: orange.bg,
              borderRadius: '24px',
              p: 3,
              border: `4px solid ${orange.main}`,
              boxShadow: `6px 6px 0px ${orange.main}`,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ mb: 1 }}>
              <AttachMoney sx={{ fontSize: '56px', color: orange.dark }} />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, color: orange.dark, mb: 1 }}>
              Save Money
            </Typography>
            <Typography sx={{ fontSize: '14px', color: orange.dark, lineHeight: 1.4 }}>
              See where your money goes. Keep more of it.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Final CTA */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        <Box
          sx={{
            bgcolor: white,
            borderRadius: '32px',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            border: `6px solid ${teal.main}`,
            boxShadow: `12px 12px 0px ${teal.main}`,
            transform: 'rotate(-1deg)',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '32px', md: '42px' },
              fontWeight: 900,
              color: teal.main,
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Ready to turn groceries into a game?
          </Typography>
          <Typography
            sx={{
              fontSize: '18px',
              color: teal.dark,
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
              bgcolor: pink.main,
              color: white,
              fontWeight: 800,
              px: 5,
              py: 2,
              borderRadius: '50px',
              fontSize: '20px',
              textTransform: 'none',
              boxShadow: `0 8px 25px rgba(236, 72, 153, 0.4)`,
              border: `3px solid ${pink.dark}`,
              '&:hover': {
                bgcolor: rose.dark,
                transform: 'scale(1.08)',
                boxShadow: `0 12px 35px rgba(236, 72, 153, 0.5)`,
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
            color: brown.dark,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          Made with <Favorite sx={{ fontSize: '16px', color: rose.main }} /> by people who
          hate spreadsheets
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            color: amber.dark,
            mt: 1,
          }}
        >
          © 2026 GrozeryShop • Making grocery tracking actually enjoyable
        </Typography>
      </Box>

      {/* Embedded Browser Dialog - Prominent and helpful */}
      <Dialog
        open={showBrowserDialog}
        onClose={() => setShowBrowserDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            maxWidth: '400px',
            border: `4px solid ${teal.main}`,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: amber.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <OpenInBrowser sx={{ fontSize: 48, color: amber.dark }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color={teal.dark}>
            Open in Your Browser
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Google sign-in doesn't work in app browsers (like Snapchat, Instagram, etc.)
          </Typography>
          <Typography variant="body1" fontWeight={600} color={teal.dark}>
            Tap the menu <strong>⋯</strong> and select:
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: teal.bg, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} color={teal.dark}>
              "Open in Browser"
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={handleCopyLink}
            sx={{
              bgcolor: teal.main,
              fontWeight: 700,
              py: 1.5,
              borderRadius: '50px',
              '&:hover': { bgcolor: teal.dark },
            }}
          >
            Copy Link to Paste in Browser
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowBrowserDialog(false)}
            sx={{ color: 'text.secondary' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar - for other errors */}
      <Snackbar
        open={!!error && !showBrowserDialog}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity={error.includes('copied') ? 'success' : 'error'} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
