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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!selectedFile ? (
        <Paper
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            p: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            bgcolor: dragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={handleButtonClick}
        >
          <CloudUpload
            sx={{
              fontSize: 80,
              color: dragActive ? 'primary.main' : 'grey.400',
              mb: 2,
            }}
          />
          <Typography variant="h5" gutterBottom fontWeight="600">
            Drop your receipt here
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            or click to browse files
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              Choose File
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={(e) => {
                e.stopPropagation();
                onCameraClick?.();
              }}
            >
              Use Camera
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
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
          <Paper sx={{ p: 3, mb: 2, position: 'relative' }}>
            <IconButton
              onClick={handleClear}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'error.light', color: 'white' },
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
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>

            {loading && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploading...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress || 0)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress || 0} />
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={loading}
              startIcon={<CloudUpload />}
            >
              {loading ? 'Uploading...' : 'Upload Receipt'}
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
