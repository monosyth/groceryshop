import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Button, Stack } from '@mui/material';
import { CheckCircle, Upload as UploadIcon, CameraAlt, EmojiEvents, Lightbulb } from '@mui/icons-material';
import UploadForm from './UploadForm';
import ReceiptCamera from './ReceiptCamera';
import { createReceipt } from '../../services/receiptService';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../context/HouseholdContext';
import { teal, brown, orange, white } from '../../theme/colors';

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState(null);

  const { currentUser } = useAuth();
  const { householdId } = useHousehold();
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

      // Upload receipt (include householdId if user is in a household)
      const newReceiptId = await createReceipt(file, currentUser.uid, (progressPercent) => {
        setProgress(progressPercent);
      }, householdId);

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
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CameraAlt sx={{ fontSize: '34px', color: teal.main }} />
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: teal.main,
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              Upload Receipt
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: brown.main,
            }}
          >
            Take a photo or upload an image of your grocery receipt
          </Typography>
        </Box>

        {/* Success Confirmation */}
        {uploadSuccess && (
          <Box
            sx={{
              bgcolor: teal.bg,
              borderRadius: '12px',
              border: `2px solid ${teal.main}`,
              boxShadow: `3px 3px 0px ${teal.light}`,
              p: 4,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <EmojiEvents sx={{ fontSize: '56px', mb: 2, color: teal.main }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: teal.darker,
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
                color: teal.darker,
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
                  bgcolor: teal.main,
                  color: white,
                  border: `2px solid ${teal.darker}`,
                  boxShadow: `2px 2px 0px ${teal.darker}`,
                  '&:hover': {
                    bgcolor: teal.dark,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                View Dashboard
              </Button>
              <Button
                onClick={handleUploadAnother}
                startIcon={<CameraAlt />}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  px: 3,
                  py: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  bgcolor: white,
                  color: teal.main,
                  border: `2px solid ${teal.main}`,
                  '&:hover': {
                    bgcolor: teal.bg,
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
              bgcolor: orange.bg,
              borderRadius: '10px',
              border: `2px solid ${orange.main}`,
              boxShadow: `2px 2px 0px ${orange.light}`,
              p: 2.5,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Lightbulb sx={{ fontSize: '24px', color: orange.dark, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                color: orange.dark,
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
