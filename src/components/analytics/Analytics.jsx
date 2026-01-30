import { Container, Typography, Paper, Box } from '@mui/material';
import { BarChart } from '@mui/icons-material';

export default function Analytics() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="accent.main">
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View spending trends, compare stores, and analyze your grocery expenses
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
        <BarChart sx={{ fontSize: 80, color: 'accent.light' }} />
        <Typography variant="h5" fontWeight="600">
          Analytics Coming Soon!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Charts and spending analytics will be implemented in Phase 6.
        </Typography>
      </Paper>
    </Container>
  );
}
