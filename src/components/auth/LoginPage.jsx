import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ShoppingCart,
  Google as GoogleIcon,
  OpenInBrowser,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { teal, amber } from '../../theme/colors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in (handles redirect sign-in return)
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // Note: With redirect auth, the page will redirect to Google
      // When returning, useEffect above handles navigation to dashboard
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Pass through the specific error message (especially for embedded browsers)
      if (error.message && error.message.includes('regular browser')) {
        setError(error.message);
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site or try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      setLoading(false);
    }
    // Don't setLoading(false) here - page redirects to Google
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${teal.bg} 0%, ${amber.bg} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <ShoppingCart sx={{ fontSize: 48, color: 'white' }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
            Welcome Back!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to track your grocery spending
          </Typography>

          {/* Error Alert - Enhanced for embedded browser errors */}
          {error && (
            <Alert
              severity={error.includes('regular browser') ? 'warning' : 'error'}
              icon={error.includes('regular browser') ? <OpenInBrowser fontSize="large" /> : undefined}
              sx={{
                width: '100%',
                mb: 2,
                ...(error.includes('regular browser') && {
                  py: 2,
                  '& .MuiAlert-message': {
                    fontSize: '1rem',
                  },
                  '& .MuiAlert-icon': {
                    fontSize: '2rem',
                  },
                }),
              }}
            >
              {error.includes('regular browser') ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Open in Your Browser
                  </Typography>
                  <Typography variant="body2">
                    Tap the <strong>⋯</strong> menu and select <strong>"Open in Browser"</strong> to sign in with Google.
                  </Typography>
                </Box>
              ) : (
                error
              )}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Google Sign In */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              underline="hover"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
