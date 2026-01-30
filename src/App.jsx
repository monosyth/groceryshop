import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <ShoppingCartIcon
              sx={{
                fontSize: 80,
                color: 'primary.main',
                mb: 2
              }}
            />
            <Typography variant="h1" gutterBottom color="primary">
              GroceryShop
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
              Your app is ready to build!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Firebase services configured: Authentication, Firestore, Storage, and Functions
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
