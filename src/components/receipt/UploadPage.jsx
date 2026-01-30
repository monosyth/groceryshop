import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import UploadForm from './UploadForm';
import ReceiptCamera from './ReceiptCamera';
import SuccessDialog from '../common/SuccessDialog';
import { createReceipt } from '../../services/receiptService';
import { useAuth } from '../../hooks/useAuth';

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
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
      setProgress(0);

      // Upload receipt
      const newReceiptId = await createReceipt(file, currentUser.uid, (progressPercent) => {
        setProgress(progressPercent);
      });

      setReceiptId(newReceiptId);
      setSuccessOpen(true);
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

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setProgress(0);
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

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> For best results, ensure the receipt is well-lit and all text is clearly visible.
          AI analysis will automatically extract items, prices, and store information.
        </Typography>
      </Alert>

      {/* Upload Form */}
      <UploadForm
        onFileSelect={handleFileSelect}
        onCameraClick={() => setCameraOpen(true)}
        loading={loading}
        error={error}
        progress={progress}
      />

      {/* Camera Modal */}
      <ReceiptCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={successOpen}
        onClose={handleSuccessClose}
        title="Receipt Uploaded!"
        message="Your receipt has been uploaded successfully. AI analysis will begin shortly and you'll be able to view the results in your dashboard."
        actionLabel="View Dashboard"
        onAction={handleViewDashboard}
      />
    </Container>
  );
}
