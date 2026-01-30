import { Container, Typography, Paper, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

export default function UploadPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="secondary.main">
          Upload Receipt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Take a photo or upload an image of your grocery receipt
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
        <CloudUpload sx={{ fontSize: 80, color: 'secondary.light' }} />
        <Typography variant="h5" fontWeight="600">
          Upload Coming Soon!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Receipt upload functionality will be implemented in Phase 2.
        </Typography>
      </Paper>
    </Container>
  );
}
