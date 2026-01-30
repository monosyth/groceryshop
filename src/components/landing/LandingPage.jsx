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
      description: 'Take a photo of your grocery receipt. Advanced scanning technology automatically extracts every item, price, and category. No more manual entry or spreadsheet headaches.',
    },
    {
      icon: '📊',
      title: 'Visual Insights',
      description: 'See spending patterns emerge through beautiful, interactive charts and graphs. Track your grocery budget by store, category, and time period with real-time analytics.',
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find any item instantly with powerful keyword search. Looking for "that organic cheese from Whole Foods last month"? We\'ll find it in seconds across all your receipts.',
    },
    {
      icon: '💰',
      title: 'Budget Clarity',
      description: 'Get complete visibility into your grocery spending habits. Compare stores, track price changes, and identify opportunities to save money on your weekly shopping.',
    },
  ];

  const benefits = [
    {
      title: 'Never Lose a Receipt',
      description: 'All your grocery receipts stored securely in the cloud. Access them anytime, anywhere from any device.',
    },
    {
      title: 'Price Tracking',
      description: 'See how prices change over time. Know if you\'re getting a good deal or if it\'s time to shop elsewhere.',
    },
    {
      title: 'Category Breakdown',
      description: 'Understand your spending by category - produce, meat, dairy, snacks. Optimize your grocery budget based on real data.',
    },
    {
      title: 'Multi-Store Comparison',
      description: 'Shopping at multiple stores? Compare prices and spending across Whole Foods, Trader Joe\'s, Albertsons, and more.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#FDFBF7',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Custom CSS for fonts and animations */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');

          .hero-title {
            font-family: 'Playfair Display', serif !important;
            letter-spacing: -0.02em;
          }

          .body-text {
            font-family: 'DM Sans', sans-serif !important;
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

      {/* Decorative background blobs */}
      <Box
        className="blob"
        sx={{
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, #4CAF50 0%, transparent 70%)',
          top: '-250px',
          right: '-150px',
        }}
      />
      <Box
        className="blob"
        sx={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, #FF9800 0%, transparent 70%)',
          bottom: '100px',
          left: '-100px',
          animationDelay: '2s',
        }}
      />

      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(253, 251, 247, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.1)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              }}
            >
              <ShoppingCart sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              className="hero-title"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '24px',
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
              className="body-text"
              sx={{
                bgcolor: '#4CAF50',
                color: 'white',
                fontWeight: 600,
                px: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)',
                '&:hover': {
                  bgcolor: '#45a049',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In with Google'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box className="animate-slide-up">
              <Typography
                variant="h1"
                className="hero-title"
                sx={{
                  fontSize: { xs: '48px', md: '72px' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3,
                  color: '#1B5E20',
                }}
              >
                Grocery Tracking,{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Reimagined
                </Box>
              </Typography>
            </Box>

            <Box className="animate-slide-up animate-delay-1">
              <Typography
                variant="h5"
                className="body-text"
                sx={{
                  fontSize: { xs: '20px', md: '24px' },
                  color: '#5D4037',
                  mb: 3,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Stop the receipt madness. Just snap, and watch your grocery chaos transform
                into crystal-clear spending insights. Track every purchase, compare prices across stores, and take control of your grocery budget with powerful analytics.
              </Typography>
            </Box>

            <Box className="animate-slide-up animate-delay-2" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                className="body-text"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={<GoogleIcon />}
                endIcon={<AutoAwesome />}
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                  '&:hover': {
                    bgcolor: '#45a049',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(76, 175, 80, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In with Google'}
              </Button>
            </Box>

            {/* Trust Badge */}
            <Box className="animate-slide-up animate-delay-3" sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Grid item xs={12} md={6}>
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
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F8E9 100%)',
                  borderRadius: '32px',
                  p: 4,
                  border: '2px solid rgba(76, 175, 80, 0.2)',
                  boxShadow: '0 20px 60px rgba(76, 175, 80, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative element */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                />

                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      fontSize: '120px',
                      mb: 2,
                      display: 'inline-block',
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  >
                    🧾
                  </Box>
                  <Typography
                    variant="h5"
                    className="body-text"
                    sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}
                  >
                    Upload Receipt
                  </Typography>
                  <Typography
                    variant="body1"
                    className="body-text"
                    sx={{ color: '#5D4037', mb: 3 }}
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
      <Box sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              className="hero-title"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
                fontWeight: 900,
                color: '#1B5E20',
                mb: 2,
              }}
            >
              Everything You Need
            </Typography>
            <Typography
              variant="h6"
              className="body-text"
              sx={{
                color: '#5D4037',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '18px',
              }}
            >
              Powerful features disguised as effortless simplicity
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className={`feature-card animate-slide-up animate-delay-${index + 1}`}
                  elevation={0}
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F8E9 100%)',
                    borderRadius: '24px',
                    border: '2px solid rgba(76, 175, 80, 0.1)',
                    overflow: 'visible',
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        fontSize: '64px',
                        mb: 2,
                        display: 'inline-block',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      className="body-text"
                      sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="body-text"
                      sx={{ color: '#5D4037', lineHeight: 1.6 }}
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

      {/* Benefits Section */}
      <Box sx={{ py: 10, bgcolor: 'rgba(255, 152, 0, 0.05)', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              className="hero-title"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
                fontWeight: 900,
                color: '#1B5E20',
                mb: 2,
              }}
            >
              More Than Just Storage
            </Typography>
            <Typography
              variant="h6"
              className="body-text"
              sx={{
                color: '#5D4037',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '18px',
              }}
            >
              Your complete grocery intelligence platform
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  className={`feature-card animate-slide-up animate-delay-${(index % 4) + 1}`}
                  elevation={0}
                  sx={{
                    p: 4,
                    background: 'white',
                    borderRadius: '24px',
                    border: '2px solid rgba(255, 152, 0, 0.2)',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                      }}
                    >
                      <Typography sx={{ fontSize: '24px' }}>
                        {index === 0 ? '🗂️' : index === 1 ? '💵' : index === 2 ? '📦' : '🏪'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        className="body-text"
                        sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="body-text"
                        sx={{ color: '#5D4037', lineHeight: 1.7, fontSize: '16px' }}
                      >
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
              borderRadius: '32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(76, 175, 80, 0.4)',
            }}
          >
            {/* Decorative circles */}
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                left: -100,
                width: 300,
                height: 300,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -80,
                right: -80,
                width: 250,
                height: 250,
                background: 'rgba(255, 152, 0, 0.2)',
                borderRadius: '50%',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h2"
                className="hero-title"
                sx={{
                  fontSize: { xs: '36px', md: '48px' },
                  fontWeight: 900,
                  color: 'white',
                  mb: 2,
                }}
              >
                Ready to Transform Your Grocery Game?
              </Typography>
              <Typography
                variant="h6"
                className="body-text"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                Join the smart shoppers who've already ditched spreadsheets for snapshots
              </Typography>
              <Button
                variant="contained"
                size="large"
                className="body-text"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={<GoogleIcon />}
                endIcon={<AutoAwesome />}
                sx={{
                  bgcolor: 'white',
                  color: '#2E7D32',
                  px: 5,
                  py: 2,
                  fontSize: '20px',
                  fontWeight: 700,
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: '#FFF9C4',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                  },
                  transition: 'all 0.3s ease',
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
          py: 6,
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
                className="body-text"
                sx={{ opacity: 0.8, maxWidth: 400 }}
              >
                Intelligent grocery tracking that transforms receipt chaos into spending clarity.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  className="body-text"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  sx={{
                    bgcolor: 'white',
                    color: '#2E7D32',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFF9C4' },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In with Google'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
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
