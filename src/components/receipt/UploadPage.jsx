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
              fontWeight: 700,
              color: '#10B981',
              fontSize: { xs: '28px', md: '34px' },
              mb: 1,
            }}
          >
            📸 Upload Receipt
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
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
              bgcolor: '#ECFDF5',
              borderRadius: '12px',
              border: '2px solid #10B981',
              boxShadow: '3px 3px 0px #6EE7B7',
              p: 4,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 2 }}>🎉</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#065F46',
                mb: 2,
                fontSize: '20px',
              }}
            >
              Receipt Uploaded Successfully!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#065F46',
                mb: 3,
              }}
            >
              AI analysis has begun. Your receipt will appear in the dashboard shortly with all items,
              prices, and store information extracted.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button
                onClick={handleViewDashboard}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  px: 3,
                  py: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  bgcolor: '#10B981',
                  color: 'white',
                  border: '2px solid #059669',
                  boxShadow: '2px 2px 0px #059669',
                  '&:hover': {
                    bgcolor: '#059669',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                View Dashboard
              </Button>
              <Button
                onClick={handleUploadAnother}
                startIcon={<Box sx={{ fontSize: '16px' }}>📸</Box>}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  px: 3,
                  py: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: '#10B981',
                  border: '2px solid #10B981',
                  '&:hover': {
                    bgcolor: '#F0FDF4',
                    transform: 'translateY(-1px)',
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
              bgcolor: '#FFEDD5',
              borderRadius: '10px',
              border: '2px solid #F97316',
              boxShadow: '2px 2px 0px #FCD34D',
              p: 2.5,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ fontSize: '24px' }}>💡</Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                color: '#EA580C',
                fontSize: '13px',
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
