import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  PhotoCamera,
  Close,
} from '@mui/icons-material';
import { formatFileSize } from '../../utils/formatters';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/constants';

export default function UploadForm({ onFileSelect, onCameraClick, loading, error, progress }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      {error && (
        <Box
          sx={{
            bgcolor: '#FED7E2',
            borderRadius: '20px',
            border: '3px solid #BE185D',
            boxShadow: '4px 4px 0px #BE185D',
            p: 3,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ fontSize: '32px' }}>⚠️</Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: '#831843',
            }}
          >
            {error}
          </Typography>
        </Box>
      )}

      {!selectedFile ? (
        <Paper
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: dragActive ? '#FEF3C7' : '#FED7E2',
            borderRadius: '32px',
            border: dragActive ? '5px dashed #B45309' : '5px dashed #BE185D',
            boxShadow: dragActive ? '8px 8px 0px #B45309' : '8px 8px 0px #BE185D',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              bgcolor: '#FEF3C7',
              border: '5px dashed #B45309',
              boxShadow: '8px 8px 0px #B45309',
              transform: 'scale(1.02)',
            },
          }}
          onClick={handleButtonClick}
        >
          <Box
            sx={{
              fontSize: '120px',
              mb: 2,
              animation: dragActive ? 'bounce 0.6s ease-in-out infinite' : 'none',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          >
            📸
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              color: dragActive ? '#78350F' : '#831843',
              mb: 1,
            }}
          >
            Drop your receipt here
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: dragActive ? '#92400E' : '#9F1239',
              mb: 4,
            }}
          >
            or click to browse files
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              startIcon={<Box sx={{ fontSize: '20px' }}>📁</Box>}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                px: 4,
                py: 1.5,
                borderRadius: '15px',
                textTransform: 'none',
                bgcolor: '#BE185D',
                color: 'white',
                border: '3px solid #9F1239',
                boxShadow: '4px 4px 0px #9F1239',
                '&:hover': {
                  bgcolor: '#9F1239',
                  transform: 'scale(1.05) rotate(-2deg)',
                  boxShadow: '6px 6px 0px #831843',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Choose File
            </Button>
            <Button
              startIcon={<Box sx={{ fontSize: '20px' }}>📷</Box>}
              onClick={(e) => {
                e.stopPropagation();
                onCameraClick?.();
              }}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                px: 4,
                py: 1.5,
                borderRadius: '15px',
                textTransform: 'none',
                bgcolor: 'white',
                color: '#BE185D',
                border: '3px solid #BE185D',
                '&:hover': {
                  bgcolor: '#FCE7F3',
                  transform: 'scale(1.05) rotate(2deg)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Use Camera
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 3,
              display: 'block',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: dragActive ? '#92400E' : '#9F1239',
            }}
          >
            Supported formats: JPEG, PNG, WebP (max 10MB)
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </Paper>
      ) : (
        <Box>
          {/* Preview */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              position: 'relative',
              bgcolor: '#DBEAFE',
              borderRadius: '24px',
              border: '4px solid #1E40AF',
              boxShadow: '6px 6px 0px #1E40AF',
            }}
          >
            <IconButton
              onClick={handleClear}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'white',
                border: '2px solid #BE185D',
                zIndex: 1,
                '&:hover': {
                  bgcolor: '#BE185D',
                  color: 'white',
                  transform: 'scale(1.1) rotate(90deg)',
                },
                transition: 'all 0.2s ease',
              }}
              disabled={loading}
            >
              <Close />
            </IconButton>

            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Receipt preview"
                sx={{
                  width: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  borderRadius: '16px',
                  mb: 3,
                  border: '3px solid #1E3A8A',
                  bgcolor: 'white',
                }}
              />
            )}

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ fontSize: '24px' }}>📄</Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: '#1E3A8A',
                  }}
                >
                  {selectedFile.name}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  color: '#1E40AF',
                  ml: 4,
                }}
              >
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>

            {loading && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '20px' }}>⏳</Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        color: '#1E3A8A',
                      }}
                    >
                      Uploading...
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      color: '#1E40AF',
                    }}
                  >
                    {Math.round(progress || 0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress || 0}
                  sx={{
                    height: 12,
                    borderRadius: '10px',
                    bgcolor: '#93C5FD',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#1E40AF',
                      borderRadius: '10px',
                    },
                  }}
                />
              </Box>
            )}

            <Button
              fullWidth
              size="large"
              onClick={handleUpload}
              disabled={loading}
              startIcon={<Box sx={{ fontSize: '24px' }}>🚀</Box>}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '18px',
                py: 2,
                borderRadius: '16px',
                textTransform: 'none',
                bgcolor: '#1E40AF',
                color: 'white',
                border: '3px solid #1E3A8A',
                boxShadow: '4px 4px 0px #1E3A8A',
                '&:hover': {
                  bgcolor: '#1E3A8A',
                  transform: 'scale(1.03)',
                  boxShadow: '6px 6px 0px #1E3A8A',
                },
                '&:disabled': {
                  bgcolor: '#93C5FD',
                  color: 'white',
                  opacity: 0.8,
                },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Uploading...' : 'Upload Receipt'}
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
