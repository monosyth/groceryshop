import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Stack,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  LocationOn,
  Edit as EditIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import SearchBar from './SearchBar';
import { format } from 'date-fns';

/**
 * Category colors for chips
 */
const categoryColors = {
  grocery: 'default',
  produce: 'success',
  meat: 'error',
  dairy: 'info',
  bakery: 'warning',
  frozen: 'primary',
  beverages: 'secondary',
  snacks: 'warning',
  household: 'default',
  'personal care': 'info',
  health: 'success',
  other: 'default',
};

export default function SearchPage() {
  const { currentUser } = useAuth();
  const { receipts, loading } = useReceipts();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ dateRange: 'all', category: 'all' });
  const [sortBy, setSortBy] = useState('name-asc');

  // Edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Flatten all items from all receipts with receipt context
  const allItems = useMemo(() => {
    const items = [];
    receipts.forEach((receipt) => {
      if (receipt.items && Array.isArray(receipt.items)) {
        receipt.items.forEach((item, index) => {
          items.push({
            ...item,
            itemId: `${receipt.id}-${index}`,
            receiptId: receipt.id,
            receiptStore: receipt.storeInfo?.name || 'Unknown Store',
            receiptDate: receipt.storeInfo?.date,
            receiptLocation: receipt.storeInfo?.location,
          });
        });
      }
    });
    return items;
  }, [receipts]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Text search - search item name, receipt text, keywords, category, store, and location
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      items = items.filter((item) => {
        // Search in item name
        if (item.name?.toLowerCase().includes(searchLower)) return true;

        // Search in receipt text (shorthand)
        if (item.receiptText?.toLowerCase().includes(searchLower)) return true;

        // Search in keywords array
        if (
          item.keywords &&
          Array.isArray(item.keywords) &&
          item.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
        ) {
          return true;
        }

        // Search in category
        if (item.category?.toLowerCase().includes(searchLower)) return true;

        // Search in store name (matches Dashboard behavior)
        if (item.receiptStore?.toLowerCase().includes(searchLower)) return true;

        // Search in store location (matches Dashboard behavior)
        if (item.receiptLocation?.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          break;
      }

      items = items.filter((item) => {
        if (!item.receiptDate) return false;
        const itemDate = item.receiptDate.toDate();
        return itemDate >= filterDate;
      });
    }

    // Category filter
    if (filters.category !== 'all') {
      items = items.filter((item) => item.category === filters.category);
    }

    // Sort items
    switch (sortBy) {
      case 'name-asc':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'store-asc':
        items.sort((a, b) =>
          (a.receiptStore || '').localeCompare(b.receiptStore || '')
        );
        break;
      case 'store-desc':
        items.sort((a, b) =>
          (b.receiptStore || '').localeCompare(a.receiptStore || '')
        );
        break;
      case 'amount-asc':
        items.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      case 'amount-desc':
        items.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      case 'date-desc':
        items.sort((a, b) => {
          if (!a.receiptDate) return 1;
          if (!b.receiptDate) return -1;
          return b.receiptDate.toDate() - a.receiptDate.toDate();
        });
        break;
      case 'date-asc':
        items.sort((a, b) => {
          if (!a.receiptDate) return 1;
          if (!b.receiptDate) return -1;
          return a.receiptDate.toDate() - b.receiptDate.toDate();
        });
        break;
      default:
        break;
    }

    return items;
  }, [allItems, searchText, filters, sortBy]);

  // Handle edit click
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditedName(item.name);
    setEditDialogOpen(true);
  };

  // Handle save edited name
  const handleSaveEdit = async () => {
    if (!editingItem || !editedName.trim()) {
      return;
    }

    try {
      const receiptRef = doc(db, 'receipts', editingItem.receiptId);
      const receipt = receipts.find((r) => r.id === editingItem.receiptId);

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Find the item index in the receipt
      const itemIndex = receipt.items.findIndex((_, idx) => {
        return `${editingItem.receiptId}-${idx}` === editingItem.itemId;
      });

      if (itemIndex === -1) {
        throw new Error('Item not found in receipt');
      }

      // Update the item name
      const updatedItems = [...receipt.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        name: editedName.trim(),
      };

      // Update Firestore
      await updateDoc(receiptRef, {
        items: updatedItems,
      });

      setSnackbar({
        open: true,
        message: 'Item name updated successfully',
        severity: 'success',
      });

      setEditDialogOpen(false);
      setEditingItem(null);
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

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
    setEditedName('');
  };

  // Handle column sort
  const handleSort = (column) => {
    if (sortBy === `${column}-asc`) {
      setSortBy(`${column}-desc`);
    } else {
      setSortBy(`${column}-asc`);
    }
  };

  // Get sort icon for column
  const getSortIcon = (column) => {
    if (sortBy === `${column}-asc`) {
      return <ArrowUpward sx={{ fontSize: 16 }} />;
    }
    if (sortBy === `${column}-desc`) {
      return <ArrowDownward sx={{ fontSize: 16 }} />;
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Search Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find items by name, keywords (candy, creamer, etc.), category, date, or store
        </Typography>
      </Box>

      {/* Search Bar */}
      <SearchBar
        onSearchChange={setSearchText}
        onFilterChange={setFilters}
        onSortChange={setSortBy}
        hideSortDropdown={true}
      />

      {/* Results Header */}
      {filteredItems.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {searchText || filters.category !== 'all' || filters.dateRange !== 'all'
              ? `Found ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`
              : `${filteredItems.length} total item${filteredItems.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      )}

      {/* Empty state - no items at all */}
      {allItems.length === 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: 'primary.light' }} />
          <Typography variant="h6" fontWeight="600">
            No Receipts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload a receipt to start tracking your grocery items
          </Typography>
        </Paper>
      )}

      {/* Empty state - no results after search/filter */}
      {allItems.length > 0 &&
        filteredItems.length === 0 &&
        (searchText || filters.category !== 'all' || filters.dateRange !== 'all') && (
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" fontWeight="600">
              No Items Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Paper>
        )}

      {/* Results Table */}
      {filteredItems.length > 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Button
                    size="small"
                    onClick={() => handleSort('name')}
                    sx={{
                      color: 'inherit',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                    endIcon={getSortIcon('name')}
                  >
                    Item
                  </Button>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Button
                    size="small"
                    onClick={() => handleSort('store')}
                    sx={{
                      color: 'inherit',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                    endIcon={getSortIcon('store')}
                  >
                    Store
                  </Button>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Button
                    size="small"
                    onClick={() => handleSort('amount')}
                    sx={{
                      color: 'inherit',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                    endIcon={getSortIcon('amount')}
                  >
                    Total
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.itemId}
                  sx={{
                    '&:last-child td': { border: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(item)}
                          sx={{
                            ml: 0.5,
                            padding: 0.5,
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      {item.receiptText && item.receiptText !== item.name && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Receipt: {item.receiptText}
                        </Typography>
                      )}
                      <Chip
                        label={item.category}
                        size="small"
                        color={categoryColors[item.category] || 'default'}
                        sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {item.receiptStore}
                      </Typography>
                      {item.receiptLocation && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {item.receiptLocation}
                        </Typography>
                      )}
                      {item.receiptDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {format(item.receiptDate.toDate(), 'MMM d, yyyy')}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item.quantity || 1}</TableCell>
                  <TableCell align="right">${(item.unitPrice || 0).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${(item.totalPrice || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
