import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material';
import { Close, Store, CalendarToday, LocationOn, Delete, Edit } from '@mui/icons-material';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Receipt detail dialog showing full item breakdown
 */
export default function ReceiptDetail({ receipt, open, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editedName, setEditedName] = useState('');

  if (!receipt) return null;

  const { storeInfo, items = [], summary, metadata, imageUrl } = receipt;

  /**
   * Handle receipt deletion - removes both Firestore document and Storage image
   */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'receipts', receipt.id));

      // Delete image from Storage
      if (receipt.imagePath) {
        const imageRef = ref(storage, receipt.imagePath);
        await deleteObject(imageRef);
      }

      setSnackbar({
        open: true,
        message: 'Receipt deleted successfully!',
        severity: 'success',
      });

      // Close dialogs and modal
      setConfirmDelete(false);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error deleting receipt:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete receipt. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle closing snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Handle edit item click
   */
  const handleEditClick = (index, currentName) => {
    setEditingItemIndex(index);
    setEditedName(currentName);
    setEditDialogOpen(true);
  };

  /**
   * Handle save edited name
   */
  const handleSaveEdit = async () => {
    if (editingItemIndex === null || !editedName.trim()) {
      return;
    }

    try {
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = {
        ...updatedItems[editingItemIndex],
        name: editedName.trim(),
      };

      await updateDoc(doc(db, 'receipts', receipt.id), {
        items: updatedItems,
      });

      setSnackbar({
        open: true,
        message: 'Item name updated successfully',
        severity: 'success',
      });

      setEditDialogOpen(false);
      setEditingItemIndex(null);
      setEditedName('');
    } catch (error) {
      console.error('Error updating item name:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update item name',
        severity: 'error',
      });
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingItemIndex(null);
    setEditedName('');
  };

  // Category colors
  const getCategoryColor = (category) => {
    const colors = {
      grocery: 'success',
      produce: 'success',
      meat: 'error',
      dairy: 'info',
      bakery: 'warning',
      frozen: 'primary',
      beverages: 'info',
      snacks: 'secondary',
      household: 'default',
      'personal care': 'default',
      health: 'error',
      other: 'default',
    };
    return colors[category?.toLowerCase()] || 'default';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '2px solid #10B981',
          boxShadow: '4px 4px 0px #6EE7B7',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#10B981',
              fontSize: '24px',
            }}
          >
            Receipt Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setConfirmDelete(true)}
              size="small"
              sx={{
                color: '#DC2626',
                border: '2px solid #DC2626',
                '&:hover': {
                  bgcolor: '#FEE2E2',
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                border: '2px solid #9CA3AF',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Receipt Image and Store Information - Side by Side */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Receipt Image */}
          <Box
            component="img"
            src={imageUrl}
            alt="Receipt"
            sx={{
              width: { xs: '100%', sm: '50%' },
              maxHeight: 300,
              objectFit: 'contain',
              borderRadius: '10px',
              backgroundColor: 'grey.100',
              border: '2px solid #E5E7EB',
            }}
          />

          {/* Store Information */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              bgcolor: '#ECFDF5',
              borderRadius: '12px',
              border: '2px solid #10B981',
              boxShadow: '2px 2px 0px #6EE7B7',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={1.5}>
              {storeInfo?.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: '20px' }}>🏪</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#059669',
                      fontSize: '18px',
                    }}
                  >
                    {storeInfo.name}
                  </Typography>
                </Box>
              )}

              {storeInfo?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: '16px' }}>📍</Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      color: '#059669',
                      fontSize: '13px',
                    }}
                  >
                    {storeInfo.location}
                  </Typography>
                </Box>
              )}

              {storeInfo?.date && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: '16px' }}>📅</Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      color: '#059669',
                      fontSize: '13px',
                    }}
                  >
                    {formatDate(storeInfo.date)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>

        {/* Items Table */}
        {items.length > 0 ? (
          <>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#10B981',
                fontSize: '18px',
              }}
            >
              Items ({items.length})
            </Typography>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: '12px',
                border: '2px solid #F59E0B',
                boxShadow: '2px 2px 0px #FCD34D',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FEF3C7' }}>
                    <TableCell
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#78350F',
                        fontSize: '13px',
                      }}
                    >
                      Item
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#78350F',
                        fontSize: '13px',
                      }}
                    >
                      Qty
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#78350F',
                        fontSize: '13px',
                      }}
                    >
                      Unit Price
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: '#78350F',
                        fontSize: '13px',
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 500,
                                fontSize: '13px',
                              }}
                            >
                              {item.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(index, item.name)}
                              sx={{
                                ml: 0.5,
                                padding: 0.5,
                                color: 'text.secondary',
                                '&:hover': { color: '#10B981' },
                              }}
                            >
                              <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                          {item.receiptText && item.receiptText !== item.name && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                mt: 0.25,
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '11px',
                              }}
                            >
                              Receipt: {item.receiptText}
                            </Typography>
                          )}
                          <Chip
                            label={item.category}
                            size="small"
                            color={getCategoryColor(item.category)}
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '13px',
                        }}
                      >
                        {item.quantity}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '13px',
                        }}
                      >
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                        }}
                      >
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', py: 3 }}>
            No items extracted yet
          </Typography>
        )}

        {/* Summary */}
        {summary && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: '#F0FDFA',
              borderRadius: '12px',
              border: '2px solid #14B8A6',
              boxShadow: '2px 2px 0px #5EEAD4',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#0D9488',
                fontSize: '18px',
              }}
            >
              💰 Summary
            </Typography>

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  Subtotal:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  {formatCurrency(summary.subtotal)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  Tax:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  {formatCurrency(summary.tax)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1, borderColor: '#99F6E4' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: '#0D9488',
                    fontSize: '18px',
                  }}
                >
                  Total:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    color: '#0D9488',
                    fontSize: '18px',
                  }}
                >
                  {formatCurrency(summary.total)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Analysis Status */}
        {metadata?.analysisStatus && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Status: {metadata.analysisStatus}
              {metadata.geminiFeedback && ` • Confidence: ${metadata.geminiFeedback}`}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Receipt?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this receipt? This will permanently remove the receipt
            data and image. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? null : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Item Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
              helperText="Update the product name (e.g., 'Tillamook Ice Cream' instead of 'Tillamook Cheese')"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editedName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
