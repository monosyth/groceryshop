import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Button, Stack } from '@mui/material';
import { CheckCircle, Upload as UploadIcon } from '@mui/icons-material';
import UploadForm from './UploadForm';
import ReceiptCamera from './ReceiptCamera';
import { createReceipt } from '../../services/receiptService';
import { useAuth } from '../../hooks/useAuth';

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = async (file) => {
    if (!currentUser) {
      setError('You must be logged in to upload receipts');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadSuccess(false);
      setProgress(0);

      // Upload receipt
      const newReceiptId = await createReceipt(file, currentUser.uid, (progressPercent) => {
        setProgress(progressPercent);
      });

      setReceiptId(newReceiptId);
      setUploadSuccess(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file) => {
    handleFileSelect(file);
  };

  const handleUploadAnother = () => {
    setUploadSuccess(false);
    setError('');
    setProgress(0);
    setReceiptId(null);
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ pt: 4, pb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              color: '#15803D',
              fontSize: { xs: '32px', md: '42px' },
              mb: 1,
            }}
          >
            📸 Upload Receipt
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              color: '#78350F',
            }}
          >
            Take a photo or upload an image of your grocery receipt
          </Typography>
        </Box>

        {/* Success Confirmation */}
        {uploadSuccess && (
          <Box
            sx={{
              bgcolor: '#D1FAE5',
              borderRadius: '24px',
              border: '4px solid #047857',
              boxShadow: '6px 6px 0px #047857',
              p: 4,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '80px', mb: 2 }}>🎉</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: '#065F46',
                mb: 2,
              }}
            >
              Receipt Uploaded Successfully!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                color: '#065F46',
                mb: 3,
              }}
            >
              AI analysis has begun. Your receipt will appear in the dashboard shortly with all items,
              prices, and store information extracted.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                onClick={handleViewDashboard}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  px: 4,
                  py: 1.5,
                  borderRadius: '15px',
                  textTransform: 'none',
                  bgcolor: '#047857',
                  color: 'white',
                  border: '3px solid #065F46',
                  boxShadow: '4px 4px 0px #065F46',
                  '&:hover': {
                    bgcolor: '#065F46',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                View Dashboard
              </Button>
              <Button
                onClick={handleUploadAnother}
                startIcon={<Box sx={{ fontSize: '20px' }}>📸</Box>}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  px: 4,
                  py: 1.5,
                  borderRadius: '15px',
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: '#047857',
                  border: '3px solid #047857',
                  '&:hover': {
                    bgcolor: '#F0FDF4',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Upload Another
              </Button>
            </Stack>
          </Box>
        )}

        {/* Info Alert */}
        {!uploadSuccess && (
          <Box
            sx={{
              bgcolor: '#DBEAFE',
              borderRadius: '20px',
              border: '3px solid #1E40AF',
              boxShadow: '4px 4px 0px #1E40AF',
              p: 3,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ fontSize: '32px' }}>💡</Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#1E3A8A',
              }}
            >
              <strong>Tip:</strong> For best results, ensure the receipt is well-lit and all text is
              clearly visible. AI analysis will automatically extract items, prices, and store
              information.
            </Typography>
          </Box>
        )}

      {/* Upload Form */}
      {!uploadSuccess && (
        <UploadForm
          onFileSelect={handleFileSelect}
          onCameraClick={() => setCameraOpen(true)}
          loading={loading}
          error={error}
          progress={progress}
        />
      )}

        {/* Camera Modal */}
        <ReceiptCamera
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </Container>
    </Box>
  );
}
