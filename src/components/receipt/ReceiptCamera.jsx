import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Button,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { PhotoCamera, Close, FlipCameraIos } from '@mui/icons-material';

export default function ReceiptCamera({ open, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create file from blob
        const file = new File([blob], `receipt_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        setCaptured(true);
        onCapture?.(file);
        handleClose();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleClose = () => {
    stopCamera();
    setCaptured(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'black',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close />
        </IconButton>

        {error && (
          <Alert
            severity="error"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 80,
              zIndex: 1,
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'black',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'space-around',
          p: 3,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <IconButton
          onClick={handleFlipCamera}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <FlipCameraIos />
        </IconButton>

        <IconButton
          onClick={handleCapture}
          disabled={!stream || !!error}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'white',
            color: 'primary.main',
            border: '4px solid',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100',
            },
            '&:disabled': {
              bgcolor: 'grey.500',
              borderColor: 'grey.600',
            },
          }}
        >
          <PhotoCamera sx={{ fontSize: 40 }} />
        </IconButton>

        <Box sx={{ width: 56 }} /> {/* Spacer for centering */}
      </DialogActions>
    </Dialog>
  );
}
