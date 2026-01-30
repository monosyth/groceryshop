import { Container, Typography, Paper, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export default function SearchPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Search Receipts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find receipts by store, date, items, or price range
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <SearchIcon sx={{ fontSize: 80, color: 'primary.light' }} />
        <Typography variant="h5" fontWeight="600">
          Search Coming Soon!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search and filter functionality will be implemented in Phase 5.
        </Typography>
      </Paper>
    </Container>
  );
}
