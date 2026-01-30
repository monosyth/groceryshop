import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export default function SuccessDialog({ open, onClose, title, message, actionLabel, onAction }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
          }}
        >
          <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
        </Box>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="success.main">
          {title || 'Success!'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message || 'Operation completed successfully'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        {onAction && actionLabel && (
          <Button variant="contained" onClick={onAction} size="large">
            {actionLabel}
          </Button>
        )}
        <Button variant="outlined" onClick={onClose} size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
