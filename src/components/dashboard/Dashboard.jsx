import { Container, Typography, Paper, Box } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

export default function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your grocery tracking dashboard!
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
        <DashboardIcon sx={{ fontSize: 80, color: 'primary.light' }} />
        <Typography variant="h5" fontWeight="600">
          Your Dashboard is Ready!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start uploading receipts to see your spending analytics here.
        </Typography>
      </Paper>
    </Container>
  );
}
