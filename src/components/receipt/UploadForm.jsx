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
            bgcolor: '#FCE7F3',
            borderRadius: '10px',
            border: '2px solid #EC4899',
            boxShadow: '2px 2px 0px #F9A8D4',
            p: 2.5,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ fontSize: '24px' }}>⚠️</Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              color: '#BE185D',
              fontSize: '13px',
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
            p: 6,
            textAlign: 'center',
            bgcolor: dragActive ? '#FEF3C7' : '#FCE7F3',
            borderRadius: '16px',
            border: dragActive ? '3px dashed #F59E0B' : '3px dashed #EC4899',
            boxShadow: dragActive ? '4px 4px 0px #FCD34D' : '4px 4px 0px #F9A8D4',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#FEF3C7',
              border: '3px dashed #F59E0B',
              boxShadow: '4px 4px 0px #FCD34D',
            },
          }}
          onClick={handleButtonClick}
        >
          <Box
            sx={{
              fontSize: '72px',
              mb: 2,
              animation: dragActive ? 'bounce 0.6s ease-in-out infinite' : 'none',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-12px)' },
              },
            }}
          >
            📸
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: dragActive ? '#78350F' : '#BE185D',
              mb: 0.5,
              fontSize: '22px',
            }}
          >
            Drop your receipt here
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: dragActive ? '#92400E' : '#9F1239',
              mb: 3,
              fontSize: '14px',
            }}
          >
            or click to browse files
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              startIcon={<Box sx={{ fontSize: '16px' }}>📁</Box>}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                px: 3,
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                bgcolor: '#EC4899',
                color: 'white',
                border: '2px solid #BE185D',
                boxShadow: '2px 2px 0px #BE185D',
                '&:hover': {
                  bgcolor: '#BE185D',
                  transform: 'translateY(-1px)',
                  boxShadow: '3px 3px 0px #BE185D',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Choose File
            </Button>
            <Button
              startIcon={<Box sx={{ fontSize: '16px' }}>📷</Box>}
              onClick={(e) => {
                e.stopPropagation();
                onCameraClick?.();
              }}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                px: 3,
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                bgcolor: 'white',
                color: '#EC4899',
                border: '2px solid #EC4899',
                '&:hover': {
                  bgcolor: '#FCE7F3',
                  transform: 'translateY(-1px)',
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
              mt: 2.5,
              display: 'block',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              color: dragActive ? '#92400E' : '#9F1239',
              fontSize: '12px',
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
              bgcolor: '#FFEDD5',
              borderRadius: '12px',
              border: '2px solid #F97316',
              boxShadow: '3px 3px 0px #FCD34D',
            }}
          >
            <IconButton
              onClick={handleClear}
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'white',
                border: '2px solid #EC4899',
                zIndex: 1,
                '&:hover': {
                  bgcolor: '#EC4899',
                  color: 'white',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.2s ease',
              }}
              disabled={loading}
            >
              <Close fontSize="small" />
            </IconButton>

            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Receipt preview"
                sx={{
                  width: '100%',
                  maxHeight: 450,
                  objectFit: 'contain',
                  borderRadius: '10px',
                  mb: 2.5,
                  border: '2px solid #F97316',
                  bgcolor: 'white',
                }}
              />
            )}

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Box sx={{ fontSize: '20px' }}>📄</Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#EA580C',
                    fontSize: '14px',
                  }}
                >
                  {selectedFile.name}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  color: '#F97316',
                  ml: 3.5,
                  fontSize: '12px',
                }}
              >
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>

            {loading && (
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ fontSize: '16px' }}>⏳</Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#EA580C',
                        fontSize: '13px',
                      }}
                    >
                      Uploading...
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#F97316',
                      fontSize: '13px',
                    }}
                  >
                    {Math.round(progress || 0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress || 0}
                  sx={{
                    height: 8,
                    borderRadius: '6px',
                    bgcolor: '#FDBA74',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#F97316',
                      borderRadius: '6px',
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
              startIcon={<Box sx={{ fontSize: '20px' }}>🚀</Box>}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                bgcolor: '#F97316',
                color: 'white',
                border: '2px solid #EA580C',
                boxShadow: '2px 2px 0px #EA580C',
                '&:hover': {
                  bgcolor: '#EA580C',
                  transform: 'translateY(-1px)',
                  boxShadow: '3px 3px 0px #EA580C',
                },
                '&:disabled': {
                  bgcolor: '#FCD34D',
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
