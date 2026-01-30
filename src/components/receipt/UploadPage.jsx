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
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="secondary.main">
          Upload Receipt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Take a photo or upload an image of your grocery receipt
        </Typography>
      </Box>

      {/* Success Confirmation */}
      {uploadSuccess && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 3 }}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                color="inherit"
                size="small"
                onClick={handleViewDashboard}
                sx={{ whiteSpace: 'nowrap' }}
              >
                View Dashboard
              </Button>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={handleUploadAnother}
                startIcon={<UploadIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Upload Another
              </Button>
            </Stack>
          }
        >
          <Typography variant="body1" fontWeight="600">
            Receipt Uploaded Successfully!
          </Typography>
          <Typography variant="body2">
            AI analysis has begun. Your receipt will appear in the dashboard shortly with all items,
            prices, and store information extracted.
          </Typography>
        </Alert>
      )}

      {/* Info Alert */}
      {!uploadSuccess && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> For best results, ensure the receipt is well-lit and all text is
            clearly visible. AI analysis will automatically extract items, prices, and store
            information.
          </Typography>
        </Alert>
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
  );
}
